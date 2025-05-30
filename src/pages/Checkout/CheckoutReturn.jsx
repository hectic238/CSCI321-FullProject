"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getEvent } from "@/components/eventFunctions.jsx"
import { fetchSessionStatus } from "@/components/checkoutFunctions.jsx"
import background from "@/assets/background.png"
import {
    Box,
    Container,
    Paper,
    Typography,
    CircularProgress,
    Divider,
    Grid,
    Card,
} from "@mui/material"
import {
    CalendarToday,
    AccessTime,
    LocationOn,
} from "@mui/icons-material"

const CheckoutReturn = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [status, setStatus] = useState(null)
    const [customerEmail, setCustomerEmail] = useState(null)
    const [event, setEvent] = useState(null)
    const [tickets, setTickets] = useState([])
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    )

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

    useEffect(() => {
        document.title = "Checkout | PLANIT"
        document.body.classList.toggle("dark", darkMode)
        localStorage.setItem("darkMode", darkMode.toString())
    }, [darkMode])

    
    // get the session status of checkout from the lambda call, and display an order confirmation
    useEffect(() => {
        const getSessionStatus = async () => {
            const sessionId = new URLSearchParams(location.search).get("session_id")
            if (!sessionId) {
                navigate("/home")
                return
            }

            try {
                const data = await fetchSessionStatus(sessionId)
                if (data.orderExists) {
                    navigate("/home")
                    return
                }

                setCustomerEmail(data.customer_email)
                setStatus(data.status)

                if (data.eventId) {
                    const evt = await getEvent(data.eventId)
                    setEvent(evt)
                }
                if (data.lineItems) {
                    setTickets(data.lineItems)
                }
            } catch (err) {
                console.error(err)
                setStatus("error")
            }
        }
        getSessionStatus()
    }, [location, navigate])

    const totalCost = tickets.reduce(
        (sum, ticket) => sum + ticket.quantity * ticket.price,
        0
    )

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
                    inset: 0,
                    backgroundColor: darkMode
                        ? "rgba(0,0,0,0.7)"
                        : "rgba(0,0,0,0.5)",
                    zIndex: 0,
                },
            }}
        >
            <Container
                maxWidth="lg"
                sx={{ flex: 1, position: "relative", zIndex: 1, py: 4 }}
            >
                <Paper
                    sx={{
                        p: 3,
                        backgroundColor: darkMode ? "#1a1a1a" : "#fff",
                        color: darkMode ? "#e0e0e0" : "#333",
                    }}
                >
                    {/* Header */}
                    <Typography
                        variant="h3"
                        component="h1"
                        align="center"
                        fontWeight="bold"
                        color="#FF5757"
                    >
                        Checkout Status
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {status === null ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress sx={{ color: "#FF5757" }} />
                        </Box>
                    ) : status === "error" || status !== "complete" ? (
                        <Box>
                            <Typography variant="h4" gutterBottom align="center">
                                Payment Failed or Canceled
                            </Typography>
                            <Typography align="center">
                                Unfortunately, your payment could not be completed.{' '}
                                <Typography
                                    component="span"
                                    sx={{ color: "#FF5757", cursor: "pointer" }}
                                    onClick={() => navigate("/checkout")}
                                >
                                    Try again{' '}
                                </Typography>
                                .
                            </Typography>
                        </Box>
                    ) : !event ? (
                        <Typography align="center">Loading event details…</Typography>
                    ) : (
                        <>
                            {/* Summary */}
                            <Box sx={{ mb: 2, textAlign: "center" }}>
                                <Typography variant="h4" component="h2" gutterBottom>
                                    Payment Successful!
                                </Typography>
                                <Typography sx={{ maxWidth: 700, mx: "auto" }}>
                                    Thank you for your order, <strong>{customerEmail}</strong>! Your Tickets and a confirmation will be sent to your email. You may also view your purchased tickets from the{' '}
                                    <Typography
                                        component="span"
                                        sx={{ color: "#FF5757", cursor: "pointer" }}
                                        onClick={() => navigate("/tickets")}
                                    >
                                        Tickets Page{' '}
                                    </Typography>
                                    for more information.
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Event Details */}
                            <Box sx={{ mb: 2, textAlign: "center" }}>
                                <Typography variant="h5" gutterBottom>
                                    Event Details
                                </Typography>

                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item xs={12} sm={4}>
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            <CalendarToday sx={{ mr: 1, color: "#FF5757" }} />
                                            <Typography>{formatDate(event.startDate)}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            <AccessTime sx={{ mr: 1, color: "#FF5757" }} />
                                            <Typography>
                                                {formatTime(event.startTime)} &ndash; {formatTime(event.endTime) || ""}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            <LocationOn sx={{ mr: 1, color: "#FF5757" }} />
                                            <Typography>{event.location}</Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {event.title}
                                        </Typography>
                                        <Typography variant="body2">
                                            {event.additionalInfo}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Purchased Tickets */}
                            <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h5" gutterBottom>
                                    Purchased Tickets
                                </Typography>
                                {tickets.length > 0 ? (
                                    <>  {/* Fragment to wrap grid and total */}
                                        <Grid container spacing={2} justifyContent="center">
                                            {tickets.map((ticket, i) => (
                                                <Grid key={ticket.name || i} item xs={12} sm={4}>
                                                    <Card variant="outlined" sx={{ p: 2 }}>
                                                        <Typography variant="subtitle1" fontWeight="600">
                                                            Type: {ticket.name}
                                                        </Typography>
                                                        <Typography>Quantity: {ticket.quantity}</Typography>
                                                        <Typography>Price: ${ticket.price}</Typography>
                                                        <Divider sx={{ my: 1 }} />
                                                        <Typography fontWeight="bold">
                                                            Total: ${ticket.quantity * ticket.price}
                                                        </Typography>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <Typography variant="h6" sx={{ mt: 3 }}>
                                            Total: ${totalCost.toFixed(2)}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography>No tickets purchased.</Typography>
                                )}
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    )
}

export default CheckoutReturn
