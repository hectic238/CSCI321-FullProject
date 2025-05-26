import {APIWithToken} from "@/components/API.js";

// function to send a message to contact
export const sendMessage = async (body) => {
    try {

        const response = await APIWithToken("message/send", "PUT", body)

        if (!response.ok) {
            throw new Error("Failed to send message");
        }
        const data = await response.json();
        return data;  // this will return a message if the event was successfully created
    } catch (error) {
        console.error("Error:", error);
    }
}