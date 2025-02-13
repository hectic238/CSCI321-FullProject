import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar.jsx"; // Assuming this updates the event in mock backend
import {editEvent, generateObjectId, getUserIdFromToken, handlePublishOrder} from "@/components/Functions.jsx";
import eventDetails from "@/pages/EventDetails.jsx";
import {EmbeddedCheckout, Elements, EmbeddedCheckoutProvider} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {getURL} from "@/components/URL.jsx";
import {Button} from "antd"; // Assuming you will style with this CSS file

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const Checkout = () => {
    const location = useLocation(); // Get event and selected tickets from state
    const selectedTickets = location.state?.selectedTickets;
    const event = location.state?.eventDetails;
    
    
    const [clientSecret, setClientSecret] = useState(null);
    
    
    useEffect(() => {
        
        const fetchCheckoutSession = async () => {
            try {
                const response = await fetch(`${getURL()}/create-checkout-session`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        products: selectedTickets,
                        eventId: event.eventId,
                        userId: getUserIdFromToken(),
                        }), 
                });

                const data = await response.json();
                setClientSecret(data.clientSecret); 
            } catch (error) {
                console.error("Error fetching checkout session:", error);
            }
        };

        fetchCheckoutSession();
    }, []);

    if (!clientSecret) {
        return <div>Loading checkout...</div>;
    }

    return (
        <Elements stripe={stripePromise}>
            <Navbar />

            <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{"display":"flex", "alignItems":"center", "gap": "10px", maxWidth: "700px"}}>
                        <img src={event.image} alt={event.title}  style={{"width": "250px", "height": "141px", "verticalAlign":"middle"}} />
                        <div className="event-info">
                            <h1 className="event-title">{event.title}</h1>
                            <p className="event-date-time">{event.startDate} | {event.startTime} - {event.endTime}</p>
                            <p className="event-location">{event.location}</p>
                        </div>
                    </div>
                </div>

                <EmbeddedCheckoutProvider stripe={stripePromise} options={{clientSecret}}>

                    <EmbeddedCheckout/> {/* ✅ Now wrapped inside EmbeddedCheckoutProvider */}
                </EmbeddedCheckoutProvider>
            </div>


        </Elements>
    );
};

export default Checkout;
