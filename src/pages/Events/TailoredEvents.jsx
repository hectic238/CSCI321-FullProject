"use client"

import { APIWithToken } from "@/components/API.js"
import { useEffect, useState } from "react"
import { useAuth } from "react-oidc-context"
import EventCard from "@/components/EventCard.jsx"
import { useNavigate, useLocation } from "react-router-dom"
import { getEventsByCategory, getEventsBySearchTerm, getTicketmasterEvents } from "@/components/eventFunctions.jsx"
import background from "@/assets/background.png"
import { Box, Container, Typography, Paper, Divider, CircularProgress, FormControlLabel, Switch } from "@mui/material"
import { DarkMode, LightMode } from "@mui/icons-material"

const TailoredEvents = () => {
    const [userDetails, setUserDetails] = useState(null)
    const [categories, setCategories] = useState([])
    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true")
    const auth = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [events, setEvents] = useState([])
    const [ticketmasterEventsPage, setTicketmasterEventsPage] = useState(0)
    const [eventsByCategory, setEventsByCategory] = useState({})
    const [loading, setLoading] = useState(true)

    const PAGE_SIZE = 5
    const [modifiedWebsiteEvents, setModifiedWebsiteEvents] = useState([])
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null)
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false)

    // Apply dark mode to body
    useEffect(() => {
        document.title = "Tailored Events | PLANIT"
        if (darkMode) {
            document.body.classList.add("dark")
        } else {
            document.body.classList.remove("dark")
        }
        localStorage.setItem("darkMode", darkMode.toString())
    }, [darkMode])

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode)
    }

    // fetch user details for categories
    const fetchUserDetails = async () => {
        try {
            const response = await APIWithToken(`user/fetch`, "GET")

            if (!response.ok) {
                console.error("Could not fetch the user details")
                return
            }
            const data = await response.json()

            const { userId, ...updatedData } = data
            setUserDetails(updatedData)

            document.title = `${updatedData.name}'s Events | PLANIT`
        } catch (error) {
            console.error("Failed to fetch user details", error)
        }
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // fetch all events based on the users selected interests
    const checkCategories = async () => {
        const categories = {
            Music: ["Concerts", "Music Festivals", "Music Workshops", "DJ Nights"],
            Art: ["Art Exhibitions", "Cultural Festivals", "Theater Plays", "Dance Performances"],
            Food: ["Food Festivals", "Wine Tastings", "Cooking Classes", "Beer Festivals"],
            Sports: ["Marathons", "Yoga Sessions", "Fitness Workshops", "Sporting Events"],
            Business: ["Conferences", "Seminars", "Workshops", "Networking Events"],
            Family: ["Family-Friendly Events", "Children's Workshops", "Kid-Friendly Shows", "Educational Activities"],
            Technology: ["Tech Conferences", "Hackathons", "Startup Events", "Gadget Expos"],
            Comedy: ["Stand-up Comedy", "Improv Nights", "Comedy Festivals", "Magic Shows"],
            Charity: ["Fundraising Events", "Charity Galas", "Benefit Concerts", "Auctions & Fundraisers"],
            Education: ["Lectures & Talks", "Education Workshops", "Educational Seminars", "Skill-Building Sessions"],
            Travel: ["City Tours", "Adventure Travel", "Cultural Experiences", "Cruise Vacations"],
        }

        const selectedCategories = userDetails.interests
        const matchedKeys = new Set()

        selectedCategories.forEach((category) => {
            for (const [key, values] of Object.entries(categories)) {
                if (values.includes(category)) {
                    matchedKeys.add(key)
                    break
                }
            }
        })

        const result = Array.from(matchedKeys)
        setCategories(result)

        const eventsByCat = {}

        // loop through categories to fetch events
        for (let i = 0; i < result.length; i++) {
            const cat = result[i]

            // delay to prevent overwhelming the server
            await sleep(250)

            try {
                const data = await fetchEvent("category", cat)
                eventsByCat[cat] = data
            } catch (error) {
                console.error(`Error fetching events for category ${cat}:`, error)
                eventsByCat[cat] = [] // fallback to empty array
            }
        }

        setEventsByCategory(eventsByCat)
        setLoading(false)
    }

    // Fetching events based on category
    const fetchEvent = async (type, category, searchTerm) => {
        
        let websiteEvents = []
        let newWebsiteEvents = []

        if (!noMoreWebsiteEvents) {
            let data

            // Fetch events based on saerching term
            if (type === "popular") {
                data = await getEventsBySearchTerm(" ", lastEvaluatedKey, PAGE_SIZE)
            } else if (type === "category") {
                
                data = await getEventsByCategory(category, lastEvaluatedKey, PAGE_SIZE)
                    
            }

            if (data?.events?.length) {
                data.events = data.events.map((event) => ({
                    ...event,
                    tickets: typeof event.tickets === "string" ? JSON.parse(event.tickets) : event.tickets,
                }))
            }

            websiteEvents = data.events || []
            setLastEvaluatedKey(data.lastEvaluatedKey)

            newWebsiteEvents = websiteEvents.map((event) => ({
                ...event,
                source: "local",
            }))

            setModifiedWebsiteEvents(
                websiteEvents.map((event) => ({
                    ...event,
                    source: "local",
                })),
            )

            if (websiteEvents.length === 0) {
                setNoMoreWebsiteEvents(true)
            }
        }

        const numberWebsiteEvents = newWebsiteEvents.length
        let newTicketMasterEvents = []

        // Fetching ticketmaster events
        if (numberWebsiteEvents !== 5) {
            const body = {
                size: 5 - numberWebsiteEvents,
                page: ticketmasterEventsPage,
                category: category,
            }

            const response = await getTicketmasterEvents(body)

            if (response._embedded?.events) {
                const ticketMasterEvents = response._embedded.events
                setTicketmasterEventsPage(ticketmasterEventsPage + 1)

                if (Array.isArray(ticketMasterEvents)) {
                    newTicketMasterEvents = ticketMasterEvents.map((event) => ({
                        ...event,
                        source: "ticketmaster",
                    }))

                    // return website events and the new ticketmaster events
                    return [...newWebsiteEvents, ...newTicketMasterEvents]
                }
            }
        }
        // return combined events with new events
        return [...events, ...newWebsiteEvents]
    }

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUserDetails()
        }
    }, [auth.isAuthenticated])

    useEffect(() => {
        if (userDetails) {
            checkCategories()
        }
    }, [userDetails])

    // Function to navigate to explore events
    const navigateToExploreEvents = () => {
        navigate("/home#exploreEvents")
    }

    // Style for the no events message
    const noEventsStyle = {
        width: "100%",
        textAlign: "center",
        padding: "0.5rem",
        color: darkMode ? "#cccccc" : "#666666",
        fontSize: "0.9rem",
        fontStyle: "italic",
    }

    // Container style for events - using CSS Grid for consistent layout
    const eventsContainerStyle = (hasEvents, eventCount) => {
        const needsScrolling = eventCount > 5

        return {
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)", // Always 5 equal columns
            gap: "4px", // Reduced from 8px to 4px to reduce space between cards
            overflowX: needsScrolling ? "auto" : "hidden", // Only enable horizontal scrolling when needed
            overflowY: "hidden", // Prevent vertical scrolling
            paddingBottom: "10px",
            minHeight: hasEvents ? "320px" : "60px",
            width: "100%",
            // When scrolling is needed, use grid-auto-flow for additional columns
            ...(needsScrolling && {
                gridAutoFlow: "column", // Force horizontal layout for additional items
                gridAutoColumns: "minmax(210px, 1fr)", // Each additional column is at least 210px (matching card width)
            }),
            // Scrollbar styling
            scrollbarWidth: "thin",
            scrollbarColor: "#FF5757 transparent",
            "&::-webkit-scrollbar": {
                height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#FF5757",
                borderRadius: "6px",
            },
            "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
            },
        }
    }

    // Card wrapper style
    const cardWrapperStyle = {
        height: "300px",
        width: "100%", // Take full width of grid cell
        display: "flex",
        justifyContent: "center", // Center the card horizontally
        alignItems: "center", // Center the card vertically
    }

    // Inner card container style - removed the border
    const innerCardStyle = {
        width: "100%", // Let EventCard control the width
        height: "100%",
        // Removed the border that was causing the double border effect
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
            <Box sx={{ position: "relative", zIndex: 1 }}></Box>

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pt: 2,
                    pb: 2,
                }}
            >
                {/* Dark Mode Toggle */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={handleDarkModeToggle}
                                color="default"
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: "#FF5757",
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                        backgroundColor: "#FF5757",
                                    },
                                }}
                            />
                        }
                        label={darkMode ? <LightMode sx={{ color: "white" }} /> : <DarkMode sx={{ color: "white" }} />}
                    />
                </Box>

                {/* Main Content Paper */}
                <Paper
                    sx={{
                        backgroundColor: darkMode ? "#1a1a1a" : "white",
                        color: darkMode ? "#e0e0e0" : "#333333",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Hero Section with Title */}
                    <Box
                        sx={{
                            p: { xs: 1.5, md: 3 },
                            textAlign: "center",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                            borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        }}
                    >
                        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="#FF5757">
                            Events <span style={{ color: darkMode ? "#e0e0e0" : "#333333" }}>For You</span>
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{ maxWidth: 800, mx: "auto", mb: 0.5 }}
                            color={darkMode ? "#cccccc" : "#666666"}
                        >
                            Discover exciting events tailored to your interests!
                        </Typography>
                    </Box>

                    {/* Categories and Events */}
                    <Box sx={{ p: { xs: 1, md: 2 } }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
                                <CircularProgress sx={{ color: "#FF5757" }} />
                            </Box>
                        ) : categories.length > 0 ? (
                            categories.map((category, index) => {
                                const hasEvents = eventsByCategory[category] && eventsByCategory[category].length > 0
                                const eventCount = eventsByCategory[category]?.length || 0

                                return (
                                    <Box key={index} sx={{ mb: hasEvents ? 1 : 0.5 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 1,
                                                mt: index === 0 ? 0.5 : 2.5,
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight="bold" color="#FF5757">
                                                {category}
                                            </Typography>
                                            <button
                                                onClick={() => navigate(`/explore/category/${category}`)}
                                                style={{
                                                    backgroundColor: "#FF5757",
                                                    color: "white",
                                                    padding: "4px 16px",
                                                    borderRadius: "9999px",
                                                    border: "1px solid #FF5757",
                                                    cursor: "pointer",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "500",
                                                    transition: "background-color 0.2s, color 0.2s",
                                                }}
                                                onMouseOver={(e) => {
                                                    if (darkMode) {
                                                        e.currentTarget.style.backgroundColor = "#1a1a1a"
                                                        e.currentTarget.style.color = "#FF5757"
                                                        e.currentTarget.style.border = "1px solid #FF5757"
                                                    } else {
                                                        e.currentTarget.style.backgroundColor = "white"
                                                        e.currentTarget.style.color = "#FF5757"
                                                        e.currentTarget.style.border = "1px solid #FF5757"
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#FF5757"
                                                    e.currentTarget.style.color = "white"
                                                    e.currentTarget.style.border = "1px solid #FF5757"
                                                }}
                                            >
                                                View More
                                            </button>
                                        </Box>

                                        {/* Grid layout for events */}
                                        <Box sx={eventsContainerStyle(hasEvents, eventCount)}>
                                            {hasEvents ? (
                                                eventsByCategory[category].map((event, idx) => (
                                                    <Box key={event.eventId || event.id || idx} sx={cardWrapperStyle}>
                                                        <Box sx={innerCardStyle}>
                                                            <EventCard event={event} darkMode={darkMode} />
                                                        </Box>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Box sx={{ ...noEventsStyle, gridColumn: '1 / -1' }}>No events found in this category. 
                                                    Check back later!</Box>
                                            )}
                                        </Box>

                                        {index < categories.length - 1 && (
                                            <Divider
                                                sx={{
                                                    mt: 2,
                                                    mb: 2,
                                                    borderColor: darkMode ? "#333" : "#e0e0e0",
                                                    height: "2px",
                                                    opacity: 0.8,
                                                }}
                                            />
                                        )}
                                    </Box>
                                )
                            })
                        ) : (
                            <Box sx={{ textAlign: "center", py: 2 }}>
                                <Typography variant="subtitle1" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    No categories found based on your interests.
                                </Typography>
                                <Typography variant="body2" color={darkMode ? "#cccccc" : "#666666"} sx={{ mt: 0.5 }}>
                                    Update your profile to add interests and discover events tailored for you.
                                </Typography>
                                <button
                                    onClick={() => navigate("/profile")}
                                    style={{
                                        backgroundColor: "#FF5757",
                                        color: "white",
                                        padding: "4px 16px",
                                        borderRadius: "9999px",
                                        border: "1px solid #FF5757",
                                        cursor: "pointer",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        marginTop: "12px",
                                        transition: "background-color 0.2s, color 0.2s",
                                    }}
                                    onMouseOver={(e) => {
                                        if (darkMode) {
                                            e.currentTarget.style.backgroundColor = "#1a1a1a"
                                            e.currentTarget.style.color = "#FF5757"
                                            e.currentTarget.style.border = "1px solid #FF5757"
                                        } else {
                                            e.currentTarget.style.backgroundColor = "white"
                                            e.currentTarget.style.color = "#FF5757"
                                            e.currentTarget.style.border = "1px solid #FF5757"
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = "#FF5757"
                                        e.currentTarget.style.color = "white"
                                        e.currentTarget.style.border = "1px solid #FF5757"
                                    }}
                                >
                                    Update Profile
                                </button>
                            </Box>
                        )}
                    </Box>

                    {/* Bottom section */}
                    <Box
                        sx={{
                            p: { xs: 1.5, md: 3 },
                            textAlign: "center",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                            borderTop: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        }}
                    >
                        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom color="#FF5757">
                            If not for you, <span style={{ color: darkMode ? "#e0e0e0" : "#333333" }}>explore more!</span>
                        </Typography>

                        <button
                            onClick={navigateToExploreEvents}
                            style={{
                                backgroundColor: "#FF5757",
                                color: "white",
                                padding: "8px 24px",
                                borderRadius: "9999px",
                                border: "1px solid #FF5757",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                transition: "background-color 0.2s, color 0.2s",
                                marginTop: "12px",
                            }}
                            onMouseOver={(e) => {
                                if (darkMode) {
                                    e.currentTarget.style.backgroundColor = "#2a2a2a"
                                    e.currentTarget.style.color = "#FF5757"
                                    e.currentTarget.style.border = "1px solid #FF5757"
                                } else {
                                    e.currentTarget.style.backgroundColor = "white"
                                    e.currentTarget.style.color = "#FF5757"
                                    e.currentTarget.style.border = "1px solid #FF5757"
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#FF5757"
                                e.currentTarget.style.color = "white"
                                e.currentTarget.style.border = "1px solid #FF5757"
                            }}
                        >
                            Explore Events
                        </button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default TailoredEvents
