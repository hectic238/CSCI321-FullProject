import {APIWithToken} from "@/components/API.js";

export const createOrder = async (body) => {
    try {

        const response = await APIWithToken("order/create", "PUT", body)

        if (!response.ok) {
            throw new Error("Failed to upload event");
        }
        const data = await response.json();
        return data;  // this will return a message if the event was successfully created
    } catch (error) {
        console.error("Error:", error);
    }
}