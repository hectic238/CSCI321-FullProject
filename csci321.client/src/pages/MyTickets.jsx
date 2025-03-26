"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    CardMedia,
    IconButton,
    Skeleton,
    Chip,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    LinearProgress,
} from "@mui/material"
import {
    CalendarToday,
    LocationOn,
    AccessTime,
    OpenInNew,
    EventSeat,
    CalendarMonth,
    Download,
    Apple,
    Google,
    QrCode2,
    Favorite,
    FavoriteBorder,
    DarkMode,
    LightMode,
    Map,
} from "@mui/icons-material"
import Navbar from "../components/Navbar.jsx"
import banner from "../assets/exploreEvent.png"
import background from "../assets/background.png"
import { enrichOrdersWithEventDetails } from "@/components/Functions.jsx"

const MyTickets = () => {
    const [orders, setOrders] = useState([])
    const [expandedTicket, setExpandedTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [anchorEl, setAnchorEl] = useState(null)
    const [activeTicket, setActiveTicket] = useState(null)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [infoDialogOpen, setInfoDialogOpen] = useState(false)
    const [mapDialogOpen, setMapDialogOpen] = useState(false)
    const [qrDialogOpen, setQrDialogOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [darkMode, setDarkMode] = useState(false)
    const [favorites, setFavorites] = useState([])
    const [weatherData, setWeatherData] = useState({})
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()

    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    const formatTime = (timeString) => {
        if (!timeString) return ""
        const [hours, minutes] = timeString.split(":")
        const formattedHours = hours % 12 || 12
        const ampm = hours >= 12 ? "PM" : "AM"
        return `${formattedHours}:${minutes} ${ampm}`
    }

    useEffect(() => {
        if (isAuthenticated) {
            const fetchOrders = async () => {
                setLoading(true)
                try {
                    const enrichedOrders = await enrichOrdersWithEventDetails(false, await getAccessTokenSilently(), user.sub)
                    console.log("Enriched orders:", enrichedOrders) // For debugging
                    setOrders(enrichedOrders || [])

                    // Simulate fetching weather data for each event
                    const weatherPromises = enrichedOrders.map((order) => fetchWeatherData(order))
                    await Promise.all(weatherPromises)
                } catch (error) {
                    console.error("Failed to fetch orders:", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchOrders()
        }
    }, [user, isAuthenticated])

    useEffect(() => {
        document.title = "My Tickets | PLANIT"

        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem("darkMode") === "true"
        setDarkMode(savedDarkMode)

        // Check for saved favorites
        const savedFavorites = JSON.parse(localStorage.getItem("favoriteEvents") || "[]")
        setFavorites(savedFavorites)
    }, [])

    // Apply dark mode class to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark")
        } else {
            document.body.classList.remove("dark")
        }
        localStorage.setItem("darkMode", darkMode)
    }, [darkMode])

    const fetchWeatherData = async (order) => {
        // This would be a real API call in production
        // For demo purposes, we'll simulate weather data

        if (!order.startDate || !order.location) return

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const weatherConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy"]
        const temperatures = [18, 20, 22, 24, 26, 28, 30]

        const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
        const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)]

        setWeatherData((prev) => ({
            ...prev,
            [order.id]: {
                condition: randomWeather,
                temperature: randomTemp,
                humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
                chanceOfRain: Math.floor(Math.random() * 100),
            },
        }))
    }

    const getTimeUntilEvent = (startDate, startTime) => {
        if (!startDate) return null

        const now = new Date()
        const eventDate = new Date(startDate)

        if (startTime) {
            const [hours, minutes] = startTime.split(":")
            eventDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
        }

        const diffTime = eventDate - now

        if (diffTime <= 0) return { text: "Event has passed", percentage: 100 }

        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        const totalHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const totalMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

        let text = ""
        if (totalDays > 0) {
            text = `${totalDays}d ${totalHours}h`
        } else if (totalHours > 0) {
            text = `${totalHours}h ${totalMinutes}m`
        } else {
            text = `${totalMinutes}m`
        }

        // Calculate percentage for progress bar (assuming 30 days max)
        const maxTimeframe = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
        const percentage = Math.min(100, Math.max(0, 100 - (diffTime / maxTimeframe) * 100))

        return { text, percentage, isUpcoming: diffTime < 7 * 24 * 60 * 60 * 1000 } // Mark as upcoming if less than 7 days
    }

    const toggleFavorite = (orderId) => {
        let newFavorites
        if (favorites.includes(orderId)) {
            newFavorites = favorites.filter((id) => id !== orderId)
        } else {
            newFavorites = [...favorites, orderId]
        }

        setFavorites(newFavorites)
        localStorage.setItem("favoriteEvents", JSON.stringify(newFavorites))

        showSnackbar(favorites.includes(orderId) ? "Removed from favorites" : "Added to favorites")
    }

    const handleExpandTicket = (ticketId) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
    }

    const handleMenuOpen = (event, ticket) => {
        setAnchorEl(event.currentTarget)
        setActiveTicket(ticket)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleAddToGoogleCalendar = (order) => {
        if (!order) return

        // Format date and time for Google Calendar
        const startDate = order.startDate ? new Date(order.startDate) : new Date()
        if (order.startTime) {
            const [hours, minutes] = order.startTime.split(":")
            startDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
        }

        // End time
        let endDate
        if (order.endTime) {
            endDate = new Date(startDate)
            const [hours, minutes] = order.endTime.split(":")
            endDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
        } else {
            // Default to 2 hours after start
            endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
        }

        // Format dates for URL
        const formatForCalendar = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "")
        }

        const startDateFormatted = formatForCalendar(startDate)
        const endDateFormatted = formatForCalendar(endDate)

        // Create Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(order.title || "Event")}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(`Ticket purchased through PLANIT`)}&location=${encodeURIComponent(order.location || "")}`

        // Open in new tab
        window.open(googleCalendarUrl, "_blank")

        handleMenuClose()
        showSnackbar("Event added to Google Calendar")
    }

    const handleAddToAppleWallet = (order) => {
        // In a real implementation, this would generate and download a .pkpass file
        showSnackbar("Adding to Apple Wallet...")
        // Simulate download delay
        setTimeout(() => {
            showSnackbar("Added to Apple Wallet")
        }, 1500)
    }

    const handleAddToGoogleWallet = (order) => {
        // In a real implementation, this would redirect to Google Pay or generate a pass
        showSnackbar("Adding to Google Wallet...")
        // Simulate download delay
        setTimeout(() => {
            showSnackbar("Added to Google Wallet")
        }, 1500)
    }

    const handleAddToCalendar = (order) => {
        // Generic calendar file download (.ics file)
        showSnackbar("Downloading calendar file...")

        // Create .ics file content
        const startDate = order.startDate ? new Date(order.startDate) : new Date()
        if (order.startTime) {
            const [hours, minutes] = order.startTime.split(":")
            startDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
        }

        // End time
        let endDate
        if (order.endTime) {
            endDate = new Date(startDate)
            const [hours, minutes] = order.endTime.split(":")
            endDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
        } else {
            // Default to 2 hours after start
            endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
        }

        const formatICSDate = (date) => {
            return date
                .toISOString()
                .replace(/-|:|\.\d+/g, "")
                .slice(0, -1)
        }

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `SUMMARY:${order.title || "Event"}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `LOCATION:${order.location || ""}`,
            `DESCRIPTION:Ticket purchased through PLANIT`,
            "END:VEVENT",
            "END:VCALENDAR",
        ].join("\r\n")

        // Create download link
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `${order.title || "event"}.ics`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showSnackbar("Calendar file downloaded")
    }

    const handleDownloadInfo = (order) => {
        showSnackbar("Downloading ticket information...")

        // Create ticket info content
        const ticketInfo = [
            `Event: ${order.title || "Unnamed Event"}`,
            `Date: ${formatDate(order.startDate)}`,
            `Time: ${formatTime(order.startTime)} - ${formatTime(order.endTime)}`,
            `Location: ${order.location || "TBA"}`,
            `Order ID: ${order.id || "N/A"}`,
            `Ticket Type: ${order.ticketType || "Standard Admission"}`,
            `Quantity: ${order.quantity || 1}`,
            `Price: $${order.price?.toFixed(2) || "0.00"} per ticket`,
            `Total: $${(order.price * order.quantity)?.toFixed(2) || "0.00"}`,
        ].join("\n")

        // Create download link
        const blob = new Blob([ticketInfo], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `ticket-${order.id || "info"}.txt`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showSnackbar("Ticket information downloaded")
    }

    const handleShowAdditionalInfo = (order) => {
        setSelectedTicket(order)
        setInfoDialogOpen(true)
    }

    const handleShowMap = (order) => {
        setSelectedTicket(order)
        setMapDialogOpen(true)
    }

    const handleShowQRCode = (order) => {
        setSelectedTicket(order)
        setQrDialogOpen(true)
    }

    const showSnackbar = (message) => {
        setSnackbarMessage(message)
        setSnackbarOpen(true)
        setTimeout(() => setSnackbarOpen(false), 3000)
    }

    // Loading skeleton
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
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1100,
                        width: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        mb: 2,
                    }}
                >
                    <Navbar />
                </Box>
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
                        <Skeleton variant="rectangular" height={200} />
                        <Typography variant="h4" sx={{ mt: 3, mb: 3 }}>
                            <Skeleton width="50%" />
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        {[1, 2, 3].map((item) => (
                            <Box key={item} sx={{ mb: 3 }}>
                                <Skeleton variant="rectangular" height={120} />
                                <Box sx={{ mt: 1 }}>
                                    <Skeleton width="70%" height={30} />
                                    <Skeleton width="40%" height={20} />
                                    <Skeleton width="30%" height={20} />
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Container>
            </Box>
        )
    }

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
                    backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
                    zIndex: 0,
                },
            }}
        >
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    width: "100%",
                }}
            >
                <Navbar />
            </Box>

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
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                color="default"
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: "#ff4d4f",
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                        backgroundColor: "#ff4d4f",
                                    },
                                }}
                            />
                        }
                        label={darkMode ? <LightMode sx={{ color: "white" }} /> : <DarkMode sx={{ color: "white" }} />}
                    />
                </Box>

                <Paper
                    sx={{
                        backgroundColor: darkMode ? "#1a1a1a" : "white",
                        color: darkMode ? "white" : "inherit",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Banner Image */}
                    <Box sx={{ position: "relative", height: 250, overflow: "hidden" }}>
                        <CardMedia
                            component="img"
                            image={banner}
                            alt="Tickets Banner"
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: darkMode ? "brightness(0.7)" : "none",
                            }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 3,
                                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                            }}
                        >
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                                }}
                            >
                                Order History
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "rgba(255,255,255,0.8)",
                                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                                }}
                            >
                                Manage your upcoming events
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {orders.length === 0 ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    textAlign: "center",
                                    backgroundColor: darkMode ? "#2a2a2a" : "#f9f9f9",
                                    border: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                                    color: darkMode ? "white" : "inherit",
                                }}
                            >
                                <EventSeat sx={{ fontSize: 60, color: "#ff4d4f", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    No current tickets to display
                                </Typography>
                                <Typography variant="body1" color={darkMode ? "rgba(255,255,255,0.7)" : "textSecondary"} paragraph>
                                    Looks like you haven't purchased any tickets yet. Explore our events to find something you'll love!
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/explore"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#ff4d4f",
                                        "&:hover": {
                                            backgroundColor: "#ff7875",
                                        },
                                        mt: 2,
                                    }}
                                >
                                    Explore Events
                                </Button>
                            </Paper>
                        ) : (
                            <Box>
                                {orders.map((order, index) => {
                                    const countdown = getTimeUntilEvent(order.startDate, order.startTime)
                                    const weather = weatherData[order.id]

                                    return (
                                        <Paper
                                            key={order.id || index}
                                            elevation={darkMode ? 3 : 1}
                                            sx={{
                                                mb: 4,
                                                overflow: "hidden",
                                                transition: "all 0.3s ease",
                                                backgroundColor: darkMode ? "#2a2a2a" : "white",
                                                color: darkMode ? "white" : "inherit",
                                                borderRadius: 2,
                                                position: "relative",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: darkMode ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.1)",
                                                },
                                                border: countdown?.isUpcoming ? "2px solid #ff4d4f" : "none",
                                            }}
                                        >
                                            {countdown?.isUpcoming && (
                                                <Chip
                                                    label="Upcoming Event"
                                                    size="small"
                                                    sx={{
                                                        position: "absolute",
                                                        top: 10,
                                                        right: 10,
                                                        backgroundColor: "#ff4d4f",
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        zIndex: 10,
                                                    }}
                                                />
                                            )}

                                            {favorites.includes(order.id) && (
                                                <Chip
                                                    icon={<Favorite sx={{ color: "white !important", fontSize: "0.8rem" }} />}
                                                    label="Favorite"
                                                    size="small"
                                                    sx={{
                                                        position: "absolute",
                                                        top: 10,
                                                        left: 10,
                                                        backgroundColor: "#ff4d4f",
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        zIndex: 10,
                                                    }}
                                                />
                                            )}

                                            <Grid container>
                                                <Grid item xs={12} sm={3} md={2}>
                                                    <Box sx={{ position: "relative", height: { xs: 200, sm: "100%" } }}>
                                                        <CardMedia
                                                            component="img"
                                                            image={order.image || "/placeholder.svg?height=200&width=300"}
                                                            alt={order.title || "Event"}
                                                            sx={{
                                                                height: "100%",
                                                                minHeight: 200,
                                                                objectFit: "cover",
                                                                filter: darkMode ? "brightness(0.8)" : "none",
                                                            }}
                                                        />
                                                        <Box
                                                            sx={{
                                                                position: "absolute",
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                p: 1,
                                                                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <IconButton onClick={() => toggleFavorite(order.id)} sx={{ color: "white" }}>
                                                                {favorites.includes(order.id) ? (
                                                                    <Favorite sx={{ color: "#ff4d4f" }} />
                                                                ) : (
                                                                    <FavoriteBorder />
                                                                )}
                                                            </IconButton>

                                                            <IconButton onClick={() => handleShowQRCode(order)} sx={{ color: "white" }}>
                                                                <QrCode2 />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={5} md={6}>
                                                    <Box
                                                        sx={{
                                                            p: 3,
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h5"
                                                            fontWeight="bold"
                                                            gutterBottom
                                                            sx={{
                                                                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                                                padding: "4px 8px",
                                                                borderRadius: "4px",
                                                                display: "inline-block",
                                                                color: darkMode ? "white" : "black",
                                                            }}
                                                        >
                                                            {order.title || "Unnamed Event"}
                                                        </Typography>

                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                mb: 1,
                                                                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                                                padding: "4px 8px",
                                                                borderRadius: "4px",
                                                                display: "inline-block",
                                                                color: darkMode ? "white" : "black",
                                                            }}
                                                        >
                                                            {formatDate(order.startDate)}
                                                        </Typography>

                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                mb: 1,
                                                                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                                                padding: "4px 8px",
                                                                borderRadius: "4px",
                                                                display: "inline-block",
                                                                color: darkMode ? "white" : "black",
                                                            }}
                                                        >
                                                            {formatTime(order.startTime)} - {formatTime(order.endTime)}
                                                        </Typography>

                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                                                padding: "4px 8px",
                                                                borderRadius: "4px",
                                                                display: "inline-block",
                                                                color: darkMode ? "white" : "black",
                                                            }}
                                                        >
                                                            {order.location || "Location TBA"}
                                                        </Typography>

                                                        {countdown && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                        mb: 0.5,
                                                                    }}
                                                                >
                                                                    <Typography variant="body2" color={darkMode ? "white" : "black"}>
                                                                        Time until event
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight="bold" color="#ff4d4f">
                                                                        {countdown.text}
                                                                    </Typography>
                                                                </Box>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={countdown.percentage}
                                                                    sx={{
                                                                        height: 6,
                                                                        borderRadius: 3,
                                                                        backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                                                        "& .MuiLinearProgress-bar": {
                                                                            backgroundColor: "#ff4d4f",
                                                                            borderRadius: 3,
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={4} md={4}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={() => handleShowAdditionalInfo(order)}
                                                            sx={{
                                                                backgroundColor: "#222",
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "#444",
                                                                },
                                                            }}
                                                        >
                                                            Additional Info
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={() => handleDownloadInfo(order)}
                                                            sx={{
                                                                backgroundColor: "#222",
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "#444",
                                                                },
                                                            }}
                                                        >
                                                            Download Info
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            startIcon={<Apple />}
                                                            onClick={() => handleAddToAppleWallet(order)}
                                                            sx={{
                                                                backgroundColor: "#222",
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "#444",
                                                                },
                                                            }}
                                                        >
                                                            Add to Apple Wallet
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            startIcon={<Google />}
                                                            onClick={() => handleAddToGoogleWallet(order)}
                                                            sx={{
                                                                backgroundColor: "#222",
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "#444",
                                                                },
                                                            }}
                                                        >
                                                            Add to Google Wallet
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={() => handleAddToCalendar(order)}
                                                            sx={{
                                                                backgroundColor: "#222",
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "#444",
                                                                },
                                                            }}
                                                        >
                                                            Add to Calendar
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={() => handleAddToGoogleCalendar(order)}
                                                            sx={{
                                                                backgroundColor: "#222",
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "#444",
                                                                },
                                                            }}
                                                        >
                                                            Add to Google Calendar
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            <Divider />
                                        </Paper>
                                    )
                                })}
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>

            {/* Additional Info Dialog */}
            <Dialog
                open={infoDialogOpen}
                onClose={() => setInfoDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: darkMode ? "#1a1a1a" : "white",
                        color: darkMode ? "white" : "inherit",
                        backgroundImage: "linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 77, 79, 0) 100%)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        pb: 2,
                        backgroundColor: darkMode ? "rgba(255, 77, 79, 0.1)" : "rgba(255, 77, 79, 0.05)",
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        {selectedTicket?.title || "Event Details"}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, mt: 1 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 3 }}>
                                <CardMedia
                                    component="img"
                                    image={selectedTicket?.image || "/placeholder.svg?height=300&width=500"}
                                    alt={selectedTicket?.title || "Event"}
                                    sx={{
                                        width: "100%",
                                        height: 200,
                                        objectFit: "cover",
                                        borderRadius: 2,
                                        mb: 2,
                                    }}
                                />

                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <CalendarToday sx={{ mr: 1, color: "#ff4d4f" }} />
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{
                                            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            color: darkMode ? "white" : "black",
                                        }}
                                    >
                                        {formatDate(selectedTicket?.startDate)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <AccessTime sx={{ mr: 1, color: "#ff4d4f" }} />
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{
                                            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            color: darkMode ? "white" : "black",
                                        }}
                                    >
                                        {formatTime(selectedTicket?.startTime)} - {formatTime(selectedTicket?.endTime)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <LocationOn sx={{ mr: 1, color: "#ff4d4f" }} />
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{
                                            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(211, 211, 211, 0.3)",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            color: darkMode ? "white" : "black",
                                        }}
                                    >
                                        {selectedTicket?.location || "TBA"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Ticket Information
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color={darkMode ? "white" : "black"} fontWeight="bold">
                                        Ticket Type
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" color={darkMode ? "white" : "black"}>
                                        {selectedTicket?.ticketType || "Standard Admission"}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color={darkMode ? "white" : "black"} fontWeight="bold">
                                        Quantity
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" color={darkMode ? "white" : "black"}>
                                        {selectedTicket?.quantity || 1}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color={darkMode ? "white" : "black"} fontWeight="bold">
                                        Order ID
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" color={darkMode ? "white" : "black"}>
                                        {selectedTicket?.id || "N/A"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color={darkMode ? "white" : "black"} fontWeight="bold">
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="#ff4d4f">
                                        ${(selectedTicket?.price * selectedTicket?.quantity)?.toFixed(2) || "0.00"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ height: "100%" }}>
                                <Typography variant="h6" gutterBottom>
                                    Event Location
                                </Typography>

                                <Box
                                    sx={{
                                        height: 300,
                                        backgroundColor: darkMode ? "#333" : "#f5f5f5",
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 3,
                                        backgroundImage: `url(https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(selectedTicket?.location || "Sydney")}&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(selectedTicket?.location || "Sydney")}&key=YOUR_API_KEY)`,
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
                                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                                            borderRadius: 2,
                                        },
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<Map />}
                                        onClick={() =>
                                            window.open(
                                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTicket?.location || "Sydney")}`,
                                                "_blank",
                                            )
                                        }
                                        sx={{
                                            backgroundColor: "#ff4d4f",
                                            "&:hover": {
                                                backgroundColor: "#ff7875",
                                            },
                                            position: "absolute",
                                            bottom: 16,
                                            right: 16,
                                            zIndex: 1,
                                        }}
                                    >
                                        Open in Maps
                                    </Button>
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<CalendarMonth />}
                                        onClick={() => handleAddToGoogleCalendar(selectedTicket)}
                                        sx={{
                                            backgroundColor: "#ff4d4f",
                                            color: "white",
                                            "&:hover": {
                                                backgroundColor: "#ff7875",
                                            },
                                        }}
                                    >
                                        Add to Google Calendar
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<Apple />}
                                        onClick={() => handleAddToAppleWallet(selectedTicket)}
                                        sx={{
                                            backgroundColor: "#222",
                                            color: "white",
                                            "&:hover": {
                                                backgroundColor: "#444",
                                            },
                                        }}
                                    >
                                        Add to Apple Wallet
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<Google />}
                                        onClick={() => handleAddToGoogleWallet(selectedTicket)}
                                        sx={{
                                            backgroundColor: "#222",
                                            color: "white",
                                            "&:hover": {
                                                backgroundColor: "#444",
                                            },
                                        }}
                                    >
                                        Add to Google Wallet
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={() => handleDownloadInfo(selectedTicket)}
                                        sx={{
                                            borderColor: "#ff4d4f",
                                            color: "#ff4d4f",
                                            fontWeight: "bold",
                                            "&:hover": {
                                                borderColor: "#ff7875",
                                                backgroundColor: "rgba(255, 77, 79, 0.04)",
                                            },
                                        }}
                                    >
                                        Download Ticket Info
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setInfoDialogOpen(false)} sx={{ color: "#ff4d4f" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Map Dialog */}
            <Dialog
                open={mapDialogOpen}
                onClose={() => setMapDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: darkMode ? "#1a1a1a" : "white",
                        color: darkMode ? "white" : "inherit",
                    },
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`, pb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Event Location: {selectedTicket?.location || "TBA"}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, height: 500, p: 0 }}>
                    <Box
                        sx={{
                            height: "100%",
                            width: "100%",
                            backgroundImage: `url(https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(selectedTicket?.location || "Sydney")}&zoom=14&size=1200x500&maptype=roadmap&markers=color:red%7C${encodeURIComponent(selectedTicket?.location || "Sydney")}&key=YOUR_API_KEY)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<OpenInNew />}
                        onClick={() =>
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTicket?.location || "Sydney")}`,
                                "_blank",
                            )
                        }
                        sx={{
                            backgroundColor: "#ff4d4f",
                            "&:hover": {
                                backgroundColor: "#ff7875",
                            },
                            mr: "auto",
                        }}
                    >
                        Open in Google Maps
                    </Button>

                    <Button onClick={() => setMapDialogOpen(false)} sx={{ color: "#ff4d4f" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog
                open={qrDialogOpen}
                onClose={() => setQrDialogOpen(false)}
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        backgroundColor: darkMode ? "#1a1a1a" : "white",
                        color: darkMode ? "white" : "inherit",
                        overflow: "hidden",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        pb: 2,
                        backgroundColor: "#ff4d4f",
                        color: "white",
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Your Ticket QR Code
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 4, pb: 4, textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                        {selectedTicket?.title || "Event"}
                    </Typography>
                    <Typography variant="body2" color={darkMode ? "white" : "black"} gutterBottom>
                        {formatDate(selectedTicket?.startDate)} | {formatTime(selectedTicket?.startTime)}
                    </Typography>

                    <Box
                        sx={{
                            mt: 3,
                            mb: 3,
                            p: 3,
                            backgroundColor: "white",
                            display: "inline-block",
                            borderRadius: 2,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                    >
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`PLANIT-TICKET-${selectedTicket?.id || "123456789"}`)}`}
                            alt="Ticket QR Code"
                            width="200"
                            height="200"
                        />
                    </Box>

                    <Typography variant="body2" color={darkMode ? "white" : "black"} gutterBottom>
                        Present this QR code at the event entrance
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                        Ticket ID: {selectedTicket?.id || "N/A"}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "#f9f9f9" }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => {
                            // In a real app, this would download the QR code image
                            showSnackbar("Downloading QR code...")
                        }}
                        sx={{
                            borderColor: "#ff4d4f",
                            color: "#ff4d4f",
                            "&:hover": {
                                borderColor: "#ff7875",
                                backgroundColor: "rgba(255, 77, 79, 0.04)",
                            },
                            mr: "auto",
                        }}
                    >
                        Download QR Code
                    </Button>

                    <Button onClick={() => setQrDialogOpen(false)} sx={{ color: "#ff4d4f" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Options Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 200,
                        mt: 1,
                        backgroundColor: darkMode ? "#2a2a2a" : "white",
                        color: darkMode ? "white" : "inherit",
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        handleAddToGoogleCalendar(activeTicket)
                        handleMenuClose()
                    }}
                >
                    <CalendarMonth sx={{ mr: 2, color: "#ff4d4f" }} />
                    Add to Google Calendar
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleAddToCalendar(activeTicket)
                        handleMenuClose()
                    }}
                >
                    <CalendarToday sx={{ mr: 2, color: "#ff4d4f" }} />
                    Add to Calendar
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleShowMap(activeTicket)
                        handleMenuClose()
                    }}
                >
                    <Map sx={{ mr: 2, color: "#ff4d4f" }} />
                    View on Map
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleShowQRCode(activeTicket)
                        handleMenuClose()
                    }}
                >
                    <QrCode2 sx={{ mr: 2, color: "#ff4d4f" }} />
                    Show QR Code
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        toggleFavorite(activeTicket.id)
                        handleMenuClose()
                    }}
                >
                    {favorites.includes(activeTicket?.id) ? (
                        <>
                            <FavoriteBorder sx={{ mr: 2, color: "#ff4d4f" }} />
                            Remove from Favorites
                        </>
                    ) : (
                        <>
                            <Favorite sx={{ mr: 2, color: "#ff4d4f" }} />
                            Add to Favorites
                        </>
                    )}
                </MenuItem>
            </Menu>

            {/* Snackbar for notifications */}
            {snackbarOpen && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 2000,
                        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "4px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        animation: "fadeIn 0.3s ease-out",
                        border: "1px solid #ff4d4f",
                        "@keyframes fadeIn": {
                            from: { opacity: 0, transform: "translate(-50%, 20px)" },
                            to: { opacity: 1, transform: "translate(-50%, 0)" },
                        },
                    }}
                >
                    {snackbarMessage}
                </Box>
            )}
        </Box>
    )
}

export default MyTickets

