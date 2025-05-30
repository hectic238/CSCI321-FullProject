import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from 'react-oidc-context';
import { generateCheckout } from '@/components/checkoutFunctions.jsx';
import {
    Box,
    Container,
    Paper,
    Typography,
    CardMedia,
} from '@mui/material';
import {
    CalendarToday,
    AccessTime,
    LocationOn,
} from '@mui/icons-material';
import background from '@/assets/background.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const Checkout = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const selectedTickets = state?.selectedTickets;
    const event = state?.eventDetails;

    const [clientSecret, setClientSecret] = useState(null);

    // fetching checkout if the user and the event exist and are authenticated
    useEffect(() => {
        // ❗ SAFETY CHECK for `auth.user` and `event`
        if (!auth.isAuthenticated || !auth.user || !event) return;

        const fetchCheckout = async () => {
            const body = {
                products: selectedTickets,
                eventId: event.eventId,
                userId: auth.user.profile.sub,
            };

            const data = await generateCheckout(body);
            console.log("generateCheckout response:", data); // ✅ LOG IT

            if (data?.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                console.error("No clientSecret found in response.");
            }
        };

        fetchCheckout();
    }, []);

    if (!clientSecret) {
        return (
            <Typography variant="body1" align="center" sx={{ mt: 6 }}>
                Loading checkout…
            </Typography>
        );
    }

    // Format date and time
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (timeString) => {
        if (!timeString) return ""
        const [hours, minutes] = timeString.split(":")
        const hour = Number.parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const formattedHour = hour % 12 || 12
        return `${formattedHour}:${minutes} ${ampm}`
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>


            {/* HEADER SECTION WITH BACKGROUND IMAGE */}
            <Box
                component="header"
                sx={{
                    position: 'relative',
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: { xs: 200, md: 300 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 0,
                    }}
                />

                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 3,
                        width: '90%',
                        maxWidth: '1100px',
                        p: 3,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        borderRadius: 2,
                    }}
                >
                    <CardMedia
                        component="img"
                        image={event.image}
                        alt={event.title}
                        sx={{
                            width: '35%',
                            objectFit: 'cover',
                            borderRadius: 2,
                            flexShrink: 0,
                        }}
                    />

                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ textAlign: 'left' }}
                        >
                            {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarToday sx={{ mr: 1, color: '#FF5757' }} />
                            <Typography variant="body1">{formatDate(event.startDate)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime sx={{ mr: 1, color: '#FF5757' }} />
                            <Typography variant="body1">
                                {formatTime(event.startTime)} – {formatTime(event.endTime)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, color: '#FF5757' }} />
                            <Typography variant="body1">{event.location}</Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* STRIPE EMBEDDED CHECKOUT */}
            <Elements stripe={stripePromise}>
                <Container maxWidth="lg" sx={{ mb: 4 }}>
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                </Container>
            </Elements>
        </Box>
    );
};

export default Checkout;
