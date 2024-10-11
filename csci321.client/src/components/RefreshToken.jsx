export const RefreshToken = async () => {

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.log("No refresh token found. User is likely logged out.");
        return null;
    }

    const expiryResponse = await fetch('http://localhost:5144/api/User/getRefreshExpiry', {
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
    console.log(expiryDate);

    // Test expired Token
    //expiryDate.setDate(expiryDate.getDate() - 7);
    //console.log(expiryDate);
    
    

    // If the refreshTokenExpiry is earlier than now, log the user out
    if (expiryDate < new Date()) {
        console.log("Refresh token has expired. Logging the user out.");
        //logoutUser();
        return;
    }
    
    


    // Check if access token is expired
    if (accessTokenIsExpired(accessToken)) {
        console.log("Access token is expired. Attempting to refresh it.");

        try {

            const response = await fetch('http://localhost:5144/api/User/refreshToken', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

            const data = await response.json();
            const newAccessToken = data.accessToken;
            
            localStorage.setItem('accessToken', newAccessToken); // Store the new access token
            console.log("Access token successfully refreshed.");
            return newAccessToken;
        } catch (error) {
            console.log("Failed to refresh access token:", error);
            //logoutUser(); // Log out if refreshing the access token fails
        }
    }
    
    
    

    // const response = await fetch('http://localhost:5144/api/User/refreshToken', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${accessToken}`,
    //         'Content-Type': 'application/json',
    //     },
    // });
    //
    // if (!response.ok) {
    //     throw new Error("Unable to refresh token");
    // }
    //
    // const data = await response.json();
    // return data.accessToken; // Get the new access token from the response


};


function accessTokenIsExpired(accessToken) {
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