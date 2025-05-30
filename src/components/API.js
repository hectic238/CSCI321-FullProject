import { getToken } from "@/components/getToken.jsx";

// API function for all APIs
export const APIWithToken = async (url, method, body = null) => {
    try {
        const accessToken = getToken();

        const headers = {
            "Content-Type": "application/json",
            Authorization: accessToken,
        };

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const baseUrl = "https://bfrc7mljh3.execute-api.ap-southeast-2.amazonaws.com/api/";
        const response = await fetch(baseUrl + url, options);

        return response;
    } catch (e) {
        alert(`Error: ${e.message}`);
    }
}