"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Skeleton,
    Card,
    CardMedia,
    Tooltip,
    IconButton,
    Snackbar,
    Alert,
    Fade,
} from "@mui/material"
import {
    CalendarToday,
    LocationOn,
    Info,
    OpenInNew,
    EventSeat,
    Favorite,
    FavoriteBorder,
    Share,
    AccessTime,
} from "@mui/icons-material"
import background from "@/assets/background.png"
import Navbar from "@/components/Navbar"
import { getCookie } from "@/components/Cookie.jsx"
import {fetchExternalEvent} from "@/components/eventFunctions.jsx";

const ExternalEventDetails = () => {
    const { eventId } = useParams()
    const [eventDetails, setEventDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [infoDialogOpen, setInfoDialogOpen] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")

    const navigate = useNavigate()
    const { user, isAuthenticated, loginWithRedirect } = useAuth0()

    const fetchExternalEventDetails = async () => {
        const API_URL = `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json`

        const API_KEY = `${import.meta.env.VITE_TICKETMASTER_KEY}`;
        const params = `?apikey=${API_KEY}`

        try {
            setLoading(true)
            const response = await fetch(`${API_URL}${params}`)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const data = await response.json()
            setEventDetails(data)
            document.title = `${data.name} | PLANIT`
        } catch (err) {
            console.error("Failed to fetch events:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAttendClick = async () => {
        if (!user && !isAuthenticated) {
            await loginWithRedirect()
            return
        }

        if (getCookie("userType") !== "attendee") {
            setSnackbarMessage("User type not allowed")
            setSnackbarOpen(true)
            return
        }

        setSnackbarMessage("You're attending this event!")
        setSnackbarOpen(true)
        console.log(`Added attendees to the event.`)
    }

    const handleWebsiteClick = () => {
        if (eventDetails?.url) {
            window.open(eventDetails.url, "_blank")
        }
    }

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            loginWithRedirect()
            return
        }

        setIsFavorite(!isFavorite)
        setSnackbarMessage(isFavorite ? "Removed from favorites" : "Added to favorites")
        setSnackbarOpen(true)
    }

    const handleShareEvent = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: eventDetails?.name,
                    text: `Check out this event: ${eventDetails?.name}`,
                    url: window.location.href,
                })
                .catch((error) => console.log("Error sharing", error))
        } else {
            navigator.clipboard.writeText(window.location.href)
            setSnackbarMessage("Event link copied to clipboard!")
            setSnackbarOpen(true)
        }
    }

    useEffect(() => {
        const getEventDetails = async () => {
            try {
                setLoading(true)
                const response = await fetchExternalEvent({ eventId });
                console.log(response);
                setEventDetails(response);
                document.title = `${response.name} | PLANIT`;
                setLoading(false);
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        if (eventId) {
            getEventDetails();
        }
    }, [eventId]);

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

    // Calculate time until event
    const getTimeUntilEvent = () => {
        if (!eventDetails?.dates?.start?.localDate) return null

        const now = new Date()
        const eventDate = new Date(eventDetails.dates.start.localDate)
        if (eventDetails.dates.start.localTime) {
            const [hours, minutes] = eventDetails.dates.start.localTime.split(":")
            eventDate.setHours(hours, minutes)
        }

        const diffTime = eventDate - now

        if (diffTime <= 0) return null

        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (diffDays > 0) {
            return `${diffDays} day${diffDays !== 1 ? "s" : ""} ${diffHours} hour${diffHours !== 1 ? "s" : ""}`
        } else {
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
            return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`
        }
    }

    // Loading state
    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 0,
                    },
                }}
            >
                <Navbar sx={{ position: "sticky", top: 0, zIndex: 1100, mb: 2 }} />
                <Container
                    maxWidth="lg"
                    sx={{
                        flex: 1,
                        position: "relative",
                        zIndex: 1,
                        pt: 6,
                        pb: 4,
                        mt: 2,
                    }}
                >
                    <Paper sx={{ p: 3, backgroundColor: "white", borderRadius: 2 }}>
                        <Skeleton variant="rectangular" height={300} />
                        <Skeleton variant="text" height={60} sx={{ mt: 2 }} />
                        <Skeleton variant="text" height={30} />
                        <Skeleton variant="text" height={30} />
                    </Paper>
                </Container>
            </Box>
        )
    }

    // Error state
    if (error) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 0,
                    },
                }}
            >
                <Navbar sx={{ position: "sticky", top: 0, zIndex: 1100, mb: 2 }} />
                <Container
                    maxWidth="lg"
                    sx={{
                        flex: 1,
                        position: "relative",
                        zIndex: 1,
                        pt: 6,
                        pb: 4,
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Paper sx={{ p: 4, backgroundColor: "white", borderRadius: 2, textAlign: "center" }}>
                        <Typography variant="h5" color="error" gutterBottom>
                            Error Loading Event
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {error}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate("/explore")}
                            sx={{
                                mt: 2,
                                backgroundColor: "#ff4d4f",
                                "&:hover": {
                                    backgroundColor: "#ff7875",
                                },
                            }}
                        >
                            Back to Explore
                        </Button>
                    </Paper>
                </Container>
            </Box>
        )
    }

    const timeUntilEvent = getTimeUntilEvent()

    // Main content
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 0,
                },
            }}
        >
            <Navbar sx={{ position: "sticky", top: 0, zIndex: 1100, mb: 2 }} />

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pt: 6,
                    pb: 4,
                    mt: 2,
                }}
            >
                <Paper sx={{ backgroundColor: "white", borderRadius: 2, overflow: "hidden" }}>
                    {/* Event Header */}
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ position: "relative" }}>
                                <CardMedia
                                    component="img"
                                    image={eventDetails?.images?.[0]?.url || "/placeholder.svg?height=300&width=400"}
                                    alt={eventDetails?.name}
                                    sx={{
                                        height: { xs: 200, md: 300 },
                                        objectFit: "cover",
                                    }}
                                />
                                {timeUntilEvent && (
                                    <Chip
                                        label={`Starts in: ${timeUntilEvent}`}
                                        color="primary"
                                        sx={{
                                            position: "absolute",
                                            top: 16,
                                            right: 16,
                                            backgroundColor: "#ff4d4f",
                                            fontWeight: "bold",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                                        {eventDetails?.name}
                                    </Typography>
                                    <Box>
                                        <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                                            <IconButton onClick={handleToggleFavorite} sx={{ color: "#ff4d4f" }}>
                                                {isFavorite ? <Favorite /> : <FavoriteBorder />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Share event">
                                            <IconButton onClick={handleShareEvent} sx={{ color: "#ff4d4f" }}>
                                                <Share />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <CalendarToday sx={{ mr: 1, color: "#ff4d4f" }} />
                                    <Typography variant="body1">{formatDate(eventDetails?.dates?.start?.localDate)}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <AccessTime sx={{ mr: 1, color: "#ff4d4f" }} />
                                    <Typography variant="body1">{formatTime(eventDetails?.dates?.start?.localTime)}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <LocationOn sx={{ mr: 1, color: "#ff4d4f" }} />
                                    <Typography variant="body1">
                                        {eventDetails?._embedded?.venues?.[0]?.address?.line1},{" "}
                                        {eventDetails?._embedded?.venues?.[0]?.city?.name},{" "}
                                        {eventDetails?._embedded?.venues?.[0]?.state?.stateCode}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    startIcon={<Info />}
                                    onClick={() => setInfoDialogOpen(true)}
                                    sx={{
                                        borderColor: "#ff4d4f",
                                        color: "#ff4d4f",
                                        "&:hover": {
                                            borderColor: "#ff7875",
                                            backgroundColor: "rgba(255, 77, 79, 0.04)",
                                        },
                                    }}
                                >
                                    More Info
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider />

                    {/* Event Body */}
                    <Grid container>
                        <Grid item xs={12} md={7} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Venue Information
                            </Typography>

                            <Card
                                sx={{
                                    height: 300,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#f5f5f5",
                                    mb: 2,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {eventDetails?._embedded?.venues?.[0]?.images?.[0]?.url ? (
                                    <CardMedia
                                        component="img"
                                        image={eventDetails._embedded.venues[0].images[0].url}
                                        alt={eventDetails._embedded.venues[0].name}
                                        sx={{ height: "100%", width: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <Box sx={{ textAlign: "center" }}>
                                        <EventSeat sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }} />
                                        <Typography variant="body1" color="textSecondary">
                                            Venue Map Placeholder
                                        </Typography>
                                    </Box>
                                )}
                            </Card>

                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                                {eventDetails?._embedded?.venues?.[0]?.name}
                            </Typography>

                            <Typography variant="body2" color="textSecondary" paragraph>
                                {eventDetails?._embedded?.venues?.[0]?.description ||
                                    "This event is hosted at a venue managed by TicketMaster. Visit the TicketMaster website for more venue details."}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={5} sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
                            <Typography variant="h6" gutterBottom>
                                Ticket Information
                            </Typography>

                            <Paper elevation={0} sx={{ p: 3, border: "1px solid #e0e0e0", mb: 3 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {eventDetails?.priceRanges
                                            ? `$${eventDetails.priceRanges[0].min} - $${eventDetails.priceRanges[0].max}`
                                            : "Free Event"}
                                    </Typography>
                                    <Chip
                                        label="External Event"
                                        size="small"
                                        sx={{
                                            backgroundColor: "#ff4d4f",
                                            color: "white",
                                        }}
                                    />
                                </Box>

                                <Typography variant="body2" color="textSecondary" paragraph>
                                    This event is hosted on TicketMaster. You can attend for free or purchase tickets through their
                                    platform.
                                </Typography>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleAttendClick}
                                    sx={{
                                        mb: 2,
                                        backgroundColor: "#ff4d4f",
                                        "&:hover": {
                                            backgroundColor: "#ff7875",
                                        },
                                    }}
                                >
                                    Attend
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<OpenInNew />}
                                    onClick={handleWebsiteClick}
                                    sx={{
                                        borderColor: "#ff4d4f",
                                        color: "#ff4d4f",
                                        "&:hover": {
                                            borderColor: "#ff7875",
                                            backgroundColor: "rgba(255, 77, 79, 0.04)",
                                        },
                                    }}
                                >
                                    Purchase Tickets on TicketMaster
                                </Button>
                            </Paper>

                            {/* Related Events */}
                            <Typography variant="h6" gutterBottom>
                                Event Categories
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                                {eventDetails?.classifications?.map((classification, index) => (
                                    <Chip
                                        key={index}
                                        label={classification.segment?.name || "Event"}
                                        sx={{ backgroundColor: "#f0f0f0" }}
                                    />
                                ))}
                                {eventDetails?.classifications?.[0]?.genre && (
                                    <Chip label={eventDetails.classifications[0].genre.name} sx={{ backgroundColor: "#f0f0f0" }} />
                                )}
                                {eventDetails?.classifications?.[0]?.subGenre && (
                                    <Chip label={eventDetails.classifications[0].subGenre.name} sx={{ backgroundColor: "#f0f0f0" }} />
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* More Info Dialog */}
            <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {eventDetails?.name}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" gutterBottom>
                        <strong>Date & Time:</strong> {formatDate(eventDetails?.dates?.start?.localDate)} |{" "}
                        {formatTime(eventDetails?.dates?.start?.localTime)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Location:</strong> {eventDetails?._embedded?.venues?.[0]?.address?.line1},{" "}
                        {eventDetails?._embedded?.venues?.[0]?.city?.name}, {eventDetails?._embedded?.venues?.[0]?.state?.stateCode}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {eventDetails?.info && (
                        <Typography variant="body1" paragraph>
                            {eventDetails.info}
                        </Typography>
                    )}

                    {eventDetails?.description && (
                        <Box
                            dangerouslySetInnerHTML={{ __html: eventDetails.description }}
                            sx={{
                                "& a": { color: "#ff4d4f" },
                                "& p": { mb: 1 },
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setInfoDialogOpen(false)} sx={{ color: "#ff4d4f" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    sx={{ width: "100%", backgroundColor: "#ff4d4f", color: "white" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ExternalEventDetails

