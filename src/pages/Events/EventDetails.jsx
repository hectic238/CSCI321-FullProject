import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Drawer} from 'antd';
import './EventDetails.css';
import { getCookie } from "@/components/Cookie.jsx";
import { getEvent, updateEvent } from "@/components/eventFunctions.jsx";
import { useAuth } from "react-oidc-context";
import {createOrder} from "@/components/orderFunctions.jsx";
import {generateObjectId} from "@/components/Functions.jsx";
import {
    Button,
    Box,
    Container,
    Paper,
    Grid,
    Typography,
    Card,
    CardMedia,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    Fade,
} from '@mui/material';
import {
    CalendarToday,
    AccessTime,
    LocationOn,
    Favorite,
    FavoriteBorder,
    Share,
} from '@mui/icons-material';
import background from "@/assets/background.png"

const EventDetails = () => {
    const { eventName, eventId } = useParams();
    const [eventDetails, setEventDetails] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [isEventInPast, setIsEventInPast] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const auth = useAuth();

    // Updates the attendee count for free events, ensuring it doesn't go below zero and stays synced with total tickets.
    const handleAttendeeCountChange = (change) => {
        const newCount = attendeeCount + change;
        if (newCount >= 0) {
            setAttendeeCount(newCount);
            setTotalTickets(newCount); // keeps totalTickets in sync for free events
        }
    };

    // Adds a ticket to the selection if it's not sold out, updates quantity, total tickets, and total price accordingly.
    const handleAddTicket = (ticket) => {
        if (ticket.soldOut) {
            console.log(`${ticket.name} is sold out.`);
            return;
        }
        const newSelectedTickets = [...selectedTickets];
        const ticketIndex = newSelectedTickets.findIndex(t => t.name === ticket.name);
        if (ticketIndex !== -1) {
            newSelectedTickets[ticketIndex].quantity += 1;
        } else {
            newSelectedTickets.push({ ...ticket, quantity: 1 });
        }
        setSelectedTickets(newSelectedTickets);
        setTotalTickets(prev => prev + 1);
        setTotalPrice(prev => prev + Number(ticket.price));
    };

    // Removes a ticket from the selection, updating quantity, total tickets, and total price, and deletes it if quantity reaches zero.
    const handleRemoveTicket = (ticket) => {
        const newSelectedTickets = [...selectedTickets];
        const ticketIndex = newSelectedTickets.findIndex(t => t.name === ticket.name);
        if (ticketIndex !== -1 && newSelectedTickets[ticketIndex].quantity > 0) {
            newSelectedTickets[ticketIndex].quantity -= 1;
            if (newSelectedTickets[ticketIndex].quantity === 0) {
                newSelectedTickets.splice(ticketIndex, 1);
            }
            setSelectedTickets(newSelectedTickets);
            setTotalTickets(prev => prev - 1);
            setTotalPrice(prev => prev - Number(ticket.price));
        }
    };

    const navigate = useNavigate();

    // Handles the checkout process by validating login, user type, and ticket selection before navigating to the checkout page.
    const handleCheckout =  async () => {

        // If user isnt logged in, force them to the login page
        if(!auth.isAuthenticated) {
            alert("User is not logged in, and will not go to checkout -- PLEASE ADD STYLING")
        }
        // If the user is not an attendee, alert user is on the wrong account
        if(getCookie("userType") !== "attendee") {
            alert("User type not allowed or user is not logged in -- PLEASE ADD STYLING");
            return;
        }
        if (totalTickets === 0) {
            alert("No tickets selected for checkout.");
            return;
        }
        navigate(`/checkout/${eventId}`, { state: { selectedTickets, eventDetails } });
    };

    // Handles attendance for free events by updating attendee and ticket counts, creating a zero-price order, and redirecting to the homepage.
    const handleAttendClick = async () => {
        if (!isEventInPast) {
            eventDetails.numberAttendees += totalTickets;
            eventDetails.tickets[0].count -= totalTickets;
            eventDetails.tickets[0].bought += totalTickets;
            const data = await updateEvent(eventDetails);


            const body = {
                orderId: generateObjectId(),
                eventId: eventDetails.eventId,
                totalPrice: 0,
                eventDate: eventDetails.startDate,
                tickets: selectedTickets,
            }

            console.log(body);

            const orderData = await createOrder(body);
            if(orderData) {
                window.location.href = '/';
            }
        }
    };

    const handleToggleFavorite = () => {
        setIsFavorite(prev => !prev);
        setSnackbarMessage(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
        setSnackbarOpen(true);
    };

    // Shares the event via the Web Share API if available, or copies the URL to clipboard with a confirmation message.
    const handleShareEvent = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: eventDetails.title, text: `Check out this event: ${eventDetails.title}`, url })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            setSnackbarMessage('Event link copied to clipboard!');
            setSnackbarOpen(true);
        }
    };

    // Fetches event details on load, parses ticket data, checks if the event is in the past, and updates the page title.
    useEffect(() => {

        getEvent(eventId).then(event => {
            if (event) {
                // Parse tickets array
                if (typeof event.tickets === "string") {
                    try {
                        event.tickets = JSON.parse(event.tickets);
                    } catch (err) {
                        console.error("Failed to parse tickets:", err);
                        event.tickets = [];
                    }
                }

                setEventDetails(event);
                console.log(event);
                const now = new Date();
                const eventDateTime = new Date(`${event.startDate}T${event.startTime}`);
                setIsEventInPast(eventDateTime < now);
                document.title = event.title + " | PLANIT";
            }
        });



    }, [eventId]);


    if (!eventDetails) {
        return <p>Loading event details...</p>;
    }

    const isFree = eventDetails.eventTicketType === 'free';

    return (
        <Box
            sx={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center',
                position: 'relative',
                '&::before': { content: '""', position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 0 },
            }}
        >

            <Container maxWidth="lg" sx={{ flex: 1, zIndex: 1, pt: 6, pb: 4, mt: 2 }}>
                <Paper sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
                    {/* Header */}
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <CardMedia
                                component="img"
                                image={eventDetails.image}
                                alt={eventDetails.title}
                                sx={{ height: { xs: 200, md: 300 }, width: '100%', objectFit: 'cover' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="h4" fontWeight="bold">{eventDetails.title}</Typography>
                                    <Box>
                                        <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                                            <IconButton onClick={handleToggleFavorite} sx={{ color: '#FF5757' }}>
                                                {isFavorite ? <Favorite /> : <FavoriteBorder />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Share event">
                                            <IconButton onClick={handleShareEvent} sx={{ color: '#FF5757' }}>
                                                <Share />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {/* Date/Time/Location */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <CalendarToday sx={{ mr: 1, color: '#FF5757' }} />
                                    <Typography>{eventDetails.startDate}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <AccessTime sx={{ mr: 1, color: '#FF5757' }} />
                                    <Typography>{eventDetails.startTime} – {eventDetails.endTime}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOn sx={{ mr: 1, color: '#FF5757' }} />
                                    <Typography>{eventDetails.location}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider />

                    {/* Body */}
                    <Grid container>
                        {/* Venue */}
                        <Grid item xs={12} md={7} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Event Information</Typography>
                            <Card
                                sx={{
                                    height: 300, display: 'flex', padding: '10px', justifyContent: 'start',
                                    bgcolor: '#f5f5f5', mb: 2,
                                }}
                            >
                                <Typography>{eventDetails.additionalInfo}</Typography>
                            </Card>
                        </Grid>

                        {/* Tickets */}
                        <Grid item xs={12} md={5} sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                            <Typography variant="h6" gutterBottom>Ticket Information</Typography>

                            {isFree ? (
                                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', mb: 5 }}>
                                    {/* Free Event UI */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <Typography variant="h5" fontWeight="bold">Free Event</Typography>
                                        <Chip label="General Admission" size="small" sx={{ bgcolor: 'green', color: 'white', borderRadius: 1 }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, gap: 3 }}>
                                        <Button
                                            onClick={() => handleAttendeeCountChange(-1)}
                                            disabled={attendeeCount === 0 || isEventInPast}
                                            sx={{
                                                width: 50, minWidth: 50, height: 40,
                                                bgcolor: attendeeCount === 0 ? '#f0f0f0' : '#FF5757',
                                                color: attendeeCount === 0 ? '#bdbdbd' : 'white',
                                                border: '1px solid',
                                                borderColor: attendeeCount === 0 ? '#f0f0f0' : '#FF5757',
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'white', color: '#FF5757', border: '1px solid #FF5757' },
                                            }}
                                        >
                                            –
                                        </Button>
                                        <Typography>{attendeeCount}</Typography>
                                        <Button
                                            onClick={() => handleAttendeeCountChange(1)}
                                            disabled={isEventInPast}
                                            sx={{
                                                width: 50, minWidth: 50, height: 40,
                                                bgcolor: '#FF5757', color: 'white',
                                                border: '1px solid #FF5757', borderRadius: 1,
                                                '&:hover': { bgcolor: 'white', color: '#FF5757', border: '1px solid #FF5757' },
                                            }}
                                        >
                                            +
                                        </Button>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        block
                                        onClick={handleAttendClick}
                                        disabled={attendeeCount === 0 || isEventInPast}
                                        sx={{
                                            width: '350px',
                                            mb: 5,
                                            bgcolor: attendeeCount === 0 ? '#f0f0f0' : '#FF5757',
                                            color: attendeeCount === 0 ? '#bdbdbd' : 'white',
                                            border: '1px solid',
                                            borderColor: attendeeCount === 0 ? '#f0f0f0' : '#FF5757',
                                            borderRadius: 1,
                                            '&:hover': { bgcolor: attendeeCount === 0 ? '#f0f0f0' : 'white', color: attendeeCount === 0 ? '#bdbdbd' : '#FF5757', border: '1px solid #FF5757' },
                                        }}
                                    >
                                        Attend
                                    </Button>
                                    {isEventInPast && (
                                        <Typography color="textSecondary">This event has already happened. Tickets can no longer be purchased or attended.</Typography>
                                    )}
                                </Paper>
                            ) : (
                                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                                    {eventDetails.tickets.map((ticket, idx) => (
                                        <Box
                                            key={ticket.name}
                                            sx={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                py: 1.5, borderLeft: '4px solid #FF5757', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px',
                                                ...(idx > 0 && { mt: 1.5 }),
                                            }}
                                        >
                                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                <Typography fontWeight="600">{ticket.name}</Typography>
                                                <Typography variant="body2">Price: ${ticket.price}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleRemoveTicket(ticket)}
                                                    disabled={
                                                        ticket.count < 1 ||
                                                        isEventInPast ||
                                                        (selectedTickets.find(t => t.name === ticket.name)?.quantity || 0) === 0
                                                    }
                                                    sx={{
                                                        width: 40, minWidth: 40, height: 30,
                                                        bgcolor:
                                                            ticket.count < 1 ||
                                                            isEventInPast ||
                                                            (selectedTickets.find(t => t.name === ticket.name)?.quantity || 0) === 0
                                                                ? '#f0f0f0'
                                                                : '#FF5757',
                                                        color:
                                                            ticket.count < 1 ||
                                                            isEventInPast ||
                                                            (selectedTickets.find(t => t.name === ticket.name)?.quantity || 0) === 0
                                                                ? '#bdbdbd'
                                                                : 'white',
                                                        border: '1px solid',
                                                        borderColor:
                                                            ticket.count < 1 ||
                                                            isEventInPast ||
                                                            (selectedTickets.find(t => t.name === ticket.name)?.quantity || 0) === 0
                                                                ? '#f0f0f0'
                                                                : '#FF5757',
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            bgcolor: 'white',
                                                            color: '#FF5757',
                                                            border: '1px solid #FF5757',
                                                        },
                                                    }}
                                                >
                                                    –
                                                </Button>
                                                <Typography>
                                                    {selectedTickets.find(t => t.name === ticket.name)?.quantity || 0}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleAddTicket(ticket)}
                                                    disabled={ticket.count < 1 || isEventInPast}
                                                    sx={{
                                                        width: 40, minWidth: 40, height: 30,
                                                        bgcolor: '#FF5757', color: 'white',
                                                        border: '1px solid #FF5757', borderRadius: 1,
                                                        '&:hover': {
                                                            bgcolor: 'white',
                                                            color: '#FF5757',
                                                            border: '1px solid #FF5757',
                                                        },
                                                    }}
                                                >
                                                    +
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))}
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography><strong>Total Tickets:</strong></Typography>
                                            <Typography>{totalTickets}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography><strong>Total Price:</strong></Typography>
                                            <Typography>${totalPrice}</Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        fullWidth
                                        onClick={handleCheckout}
                                        disabled={totalTickets === 0 || isEventInPast}
                                        sx={{
                                            backgroundColor: totalTickets === 0 ? '#f0f0f0' : '#FF5757',
                                            color: totalTickets === 0 ? '#bdbdbd' : 'white',
                                            border: '1px solid',
                                            borderColor: totalTickets === 0 ? '#f0f0f0' : '#FF5757',
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: totalTickets === 0 ? '#f0f0f0' : 'white',
                                                color: totalTickets === 0 ? '#bdbdbd' : '#FF5757',
                                                border: '1px solid #FF5757',
                                            },
                                        }}
                                    >
                                        Checkout
                                    </Button>
                                    {isEventInPast && (
                                        <Typography color="textSecondary" sx={{ mt: 2 }}>
                                            This event has already happened. Tickets can no longer be purchased or attended.
                                        </Typography>
                                    )}
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Paper>

                <Drawer
                    title={<Typography sx={{ color: '#FF5757' }}>{eventDetails.title}</Typography>}
                    placement="right"
                    onClose={() => setIsDrawerVisible(false)}
                    open={isDrawerVisible}
                    width={360}
                >
                    <Typography gutterBottom>
                        <CalendarToday sx={{ mr: 1, color: '#FF5757' }} />{eventDetails.startDate}
                    </Typography>
                    <Typography gutterBottom>
                        <AccessTime sx={{ mr: 1, color: '#FF5757' }} />{eventDetails.startTime} – {eventDetails.endTime}
                    </Typography>
                    <Typography gutterBottom>
                        <LocationOn sx={{ mr: 1, color: '#FF5757' }} />{eventDetails.location}
                    </Typography>
                    <Typography sx={{ mt: 2 }}>{eventDetails.additionalInfo}</Typography>
                </Drawer>
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ backgroundColor: '#FF5757', color: 'white' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EventDetails;
