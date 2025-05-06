import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {EmbeddedCheckout, Elements, EmbeddedCheckoutProvider} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {useAuth0} from "@auth0/auth0-react";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
import {useAuth} from "react-oidc-context";
import {generateCheckout} from "@/components/checkoutFunctions.jsx";

const Checkout = () => {
    
    const {user, isAuthenticated} = useAuth0();
    const location = useLocation(); 
    const selectedTickets = location.state?.selectedTickets;
    const event = location.state?.eventDetails;
    const auth = useAuth();
    
    const [clientSecret, setClientSecret] = useState(null);
    
    
    useEffect(() => {
        
        const fetchCheckoutSession = async () => {
            console.log(auth.user)
            //sessionStorage.clear();
            if(auth.isAuthenticated) {

                const body = {
                    products: selectedTickets,
                    eventId: event.eventId,
                    userId: auth.user.profile.sub,
                };
                
                console.log(body);
                
                const data = await generateCheckout(body)
                
                console.log(data);
                setClientSecret(data.clientSecret);
                
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
                    //
                    // const data = await response.json();
                    // setClientSecret(data.clientSecret);
                } catch (error) {
                    console.error("Error fetching checkout session:", error);
                }
            }
        };

        fetchCheckoutSession();
    }, []);

    if (!clientSecret) {
        return <div>Loading checkout...</div>;
    }

    return (
        <Elements stripe={stripePromise}>

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
