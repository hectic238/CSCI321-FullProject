import {getURL} from "@/components/URL.jsx";
import {APIWithToken} from "@/components/API.js";

export const generateCheckout = async (body) => {
    try {
        // const response = await fetch(`${getURL()}/create-checkout-session`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         products: selectedTickets,
        //         eventId: event.eventId,
        //         userId: auth.user.profile.sub,
        //     }),
        // });

        const response = await APIWithToken(`event/checkout`, "POST", body)

        if (!response.ok) {
            throw new Error("Failed to generate Checkout");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching checkout session:", error);
    }
}