import {APIWithToken} from "@/components/API.js";


export const getUserTypeFromToken =  async () => {

    try {
        
        const response = await APIWithToken("user/getUserType", "GET")

        if (!response.ok) {
            throw new Error("Failed to fetch userType");
        }
        const data = await response.json();
        return data;  // This will return the userType
    } catch (error) {
        console.error("Error:", error);
    }
}