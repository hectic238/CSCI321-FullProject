import {APIWithToken} from "@/components/API.js";

export const generateCheckout = async (body) => {
    try {
        const response = await APIWithToken(`checkout`, "POST", body)

        if (!response.ok) {
            throw new Error("Failed to generate Checkout");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching checkout session:", error);
    }
}

export const fetchSessionStatus = async (sessionId) => {
    try {
        const response = await APIWithToken(`sessionStatus?session_id=${sessionId}`, "GET")

        if (!response.ok) {
            throw new Error("Failed to get sessionStatus");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching sessionStatus", error);
    }
}