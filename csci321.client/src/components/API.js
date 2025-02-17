import {RefreshToken} from "../components/RefreshToken.jsx";

export const APIWithToken = async (accessToken, url, method, body = null) => {
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