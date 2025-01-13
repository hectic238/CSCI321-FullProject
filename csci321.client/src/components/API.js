import {RefreshToken} from "../components/RefreshToken.jsx";

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
            
            const retryResponse = await fetch(url, options);
            return retryResponse.json();
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new Error('Failed to parse error response');
            }
            throw new Error(errorData.message);
        }

        const data = await response.json();
        return data;
    } catch (e) {
        alert(`Error: ${e.message}`);
    }
}