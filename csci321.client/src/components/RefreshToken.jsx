export const RefreshToken = async () => {

    let accessToken = localStorage.getItem('accessToken');
    //
    if (!accessToken) {
        console.log("No refresh token found. User is likely logged out.");
        return null;
    }

    const expiryResponse = await fetch('https://localhost:5144/api/User/getRefreshExpiry', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!expiryResponse.ok) {
        throw new Error("Unable to get refresh token expiry.");
    }

    const expiryDateJSON = await expiryResponse.json();
    const expiryDate = new Date(expiryDateJSON.refreshExpiry);
    
    // If the refreshTokenExpiry is earlier than now, log the user out
    if (expiryDate < new Date()) {
        logoutUser();
        console.log("Refresh token has expired. Logging the user out.");

        return;
    }

    // Check if access token is expired
    if (accessTokenIsExpired(accessToken)) {
        console.log("Access token is expired. Attempting to refresh it.");

        try {

            const response = await fetch('https://localhost:5144/api/User/refreshToken', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken); // Store the new access tokenreturn newAccessToken;
            console.log("Access Token Refreshed");
        } catch (error) {
            logoutUser(); // Log out if refreshing the access token fails
        }
    }
    
};

export const logoutUser = () => {
    
    localStorage.removeItem('accessToken');
    // You can also add a redirect here to the login page
    window.location.href = '/home'; // For example
    console.log("User has been logged out. Redirecting to login.");

}


export const accessTokenIsExpired = () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) return true;

    const decodedToken = parseJwt(accessToken);
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    return decodedToken.exp < currentTime; // Compare the expiration time with current time
}

// Helper function to decode the JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}