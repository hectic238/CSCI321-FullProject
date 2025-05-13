import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {EmbeddedCheckout, Elements, EmbeddedCheckoutProvider} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {useAuth0} from "@auth0/auth0-react";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
import {useAuth} from "react-oidc-context";
import { generateCheckout } from "@/components/checkoutFunctions.jsx";
import { CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';

const Checkout = () => {
    const {user, isAuthenticated} = useAuth0();
    const location = useLocation();
    const selectedTickets = location.state?.selectedTickets;
    const event = location.state?.eventDetails;
    const auth = useAuth();

    const [clientSecret, setClientSecret] = useState(null);

    const iconStyle = {
        color: '#FF5757',
        verticalAlign: 'middle',
        marginRight: '8px',
    };

    const infoItemStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        margin: '4px 0',
        fontSize: '1rem',
        marginLeft: '30px',     // keeps all <p> in line
    };

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
            {/* Event header banner */}
                <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "30px",
                        width: "90%",
                        maxWidth: "1100px"
                    }}>
                        <img
                            src={event.image}
                            alt={event.title}
                            style={{
                                width: "35%",
                                height: "auto",
                                objectFit: "cover",
                                borderRadius: "8px",
                                flexShrink: 0
                            }}
                        />
    
                        <div style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            marginTop: 0,
                        }}>
                            {/* only change: added marginLeft to h1 */}
                            <h1 style={{
                                margin: 0,
                                fontSize: '2rem',
                                lineHeight: 1.2,
                                marginBottom: '20px',
                                textAlign: 'left'
                            }}>
                                {event.title}
                            </h1>
    
                            <p style={infoItemStyle}>
                                <CalendarToday style={iconStyle} />
                                {event.startDate}
                            </p>
                            <p style={infoItemStyle}>
                                <AccessTime style={iconStyle} />
                                {event.startTime} – {event.endTime}
                            </p>
                            <p style={infoItemStyle}>
                                <LocationOn style={iconStyle} />
                                {event.location}
                            </p>
                        </div>
                    </div>
                </div>
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>

                
            </div>
        </Elements>
    );
};

export default Checkout;
