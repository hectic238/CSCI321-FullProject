import {RefreshToken} from "@/components/RefreshToken.jsx";

export const APIWithToken = async (url, method, body = null) => {

    let accessToken = localStorage.getItem('accessToken');
    //
    if (!accessToken) {
        console.log("No refresh token found. User is likely logged out.");
        return null;
    }


    try {

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        };

        const options = {
            method,
            headers,
        };

        // Add body only if it's not null or undefined
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        
        const response = await fetch(url, options);
        // If the response is unauthorised then try and refresh the token and try the api call again
        if(response.status === 401) {
            await RefreshToken();

            let accessToken = localStorage.getItem('accessToken');
            //
            if (!accessToken) {
                console.log("No refresh token found. User is likely logged out.");
                return null;
            }
            
            const retryResponse = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return retryResponse.json();
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new Error('Failed to parse error response');
            }
            throw new Error(errorData.message || 'Failed to fetch orders');
        }
        
        return response.json();
    } catch (e) {
        alert(`Error: ${e.message}`);
    }
}