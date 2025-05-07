import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar.jsx";
import { Elements, EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "react-oidc-context";
import { generateCheckout } from "@/components/checkoutFunctions.jsx";
import { CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const Checkout = () => {
    const auth = useAuth();
    const location = useLocation();
    const selectedTickets = location.state?.selectedTickets;
    const event = location.state?.eventDetails;

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
        const fetchCheckout = async () => {
            if (!auth.isAuthenticated) return;
            const body = {
                products: selectedTickets,
                eventId: event.eventId,
                userId: auth.user.profile.sub,
            };
            const { clientSecret } = await generateCheckout(body);
            setClientSecret(clientSecret);
        };
        fetchCheckout();
    }, [auth, event, selectedTickets]);

    if (!clientSecret) return <div>Loading checkout...</div>;

    return (
        <Elements stripe={stripePromise}>
            <Navbar />

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
        </Elements>
    );
};

export default Checkout;
