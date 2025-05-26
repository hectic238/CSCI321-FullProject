"use client"

import { useLocation, useParams, useSearchParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import {
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    FormControlLabel,
    Switch,
    Alert,
    Button,
    Grid,
} from "@mui/material"
import { DarkMode, LightMode } from "@mui/icons-material"
import EventPageCard from "@/components/EventPageCard.jsx"
import background from "@/assets/background.png"
import {
    calculateTotalPages,
    getEventsByCategory,
    getEventsBySearchTerm,
    getTicketmasterEvents,
} from "@/components/eventFunctions.jsx"
import "@/components/EventPageCard.css" // Import the CSS file from the components directory

const ExploreEventPages = () => {
    const category = useParams()
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false) // Separate loading state for "View More"
    const location = useLocation()
    const navigate = useNavigate()
    const [events, setEvents] = useState([])
    const [currentWebsiteEventCount, setCurrentWebsiteEventCount] = useState(6) // Changed from 5 to 6
    const [totalPages, setTotalPages] = useState(null)
    const [page, setPage] = useState(0)
    const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json"
    const API_KEY = `${import.meta.env.VITE_TICKETMASTER_KEY}`
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false)
    const [ticketMasterEventsFetched, setTicketMasterEventsFetched] = useState(null)
    const PAGE_SIZE = 6 // Changed from 5 to 6
    const isCategory = location.pathname.includes("/explore/category/")
    const isSearch = location.pathname.includes("/explore/search")
    const [allAvailableEvents, setAllAvailableEvents] = useState([])
    const [modifiedWebsiteEvents, setModifiedWebsiteEvents] = useState([])
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null)
    const [noMorePages, setNoMorePages] = useState(false)
    const [searchParams] = useSearchParams()
    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true")
    const [searchTerm, setSearchTerm] = useState("")
    const [searchError, setSearchError] = useState(null)
    const [loadedEventIds, setLoadedEventIds] = useState(new Set()) // Track loaded event IDs

    // Apply dark mode to body
    useEffect(() => {
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

    // Extract search term from URL and update state
    useEffect(() => {
        if (isSearch) {
            const query = searchParams.get("q") || ""
            setSearchTerm(query)
            console.log("Search term updated:", query)
        } else {
            setSearchTerm("")
        }
    }, [isSearch, searchParams])

    // build the dynamic heading text
    const displayNames = {
        popular: "Popular Events",
        music: "Concerts",
        theatre: "Theatre",
        family: "Family",
        comedy: "Comedy",
    }

    let headingText = "Results"
    if (isSearch) {
        const q = searchParams.get("q") || ""
        headingText = `Search: "${q}"`
    } else if (isCategory) {
        headingText =
            displayNames[category.categoryName] ||
            category.categoryName.charAt(0).toUpperCase() + category.categoryName.slice(1)
    }

    const [ticketmasterEventsPage, setTicketmasterEventsPage] = useState(0)

    const fetchTicketMasterEvents = async (size = 10, page = 0, searchQuery = "") => {
        setTicketMasterEventsFetched(true)

        let params

        if (category.categoryName === "popular" && !searchQuery) {
            params = `?dmaId=702&size=${size}&page=${page}&apikey=${API_KEY}`
        } else if (searchQuery) {
            params = `?dmaId=702&keyword=${encodeURIComponent(searchQuery)}&page=${page}&size=${size}&apikey=${API_KEY}`
        } else {
            params = `?dmaId=702&classificationName=${category.categoryName}&size=${size}&page=${page}&apikey=${API_KEY}`
        }

        const url = `${API_URL}${params}`
        console.log("Fetching Ticketmaster events with URL:", url)

        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const data = await response.json()
            // Setting minus 1 as the last page returns nothing
            setTotalPages(data.page.totalPages - 1)
            return data._embedded?.events || []
        } catch (err) {
            console.error("Failed to fetch Ticketmaster events:", err)
            setSearchError("Failed to fetch events from Ticketmaster. Please try again.")
            return []
        }
    }

    const calculateTotalPage = async (size, searchQuery) => {
        let params

        if (category.categoryName === "popular" && !searchQuery) {
            params = `?dmaId=702&size=${size}&apikey=${API_KEY}`
        } else if (searchQuery) {
            params = `?dmaId=702&keyword=${encodeURIComponent(searchQuery)}&size=${size}&apikey=${API_KEY}`
        } else {
            params = `?dmaId=702&classificationName=${category.categoryName}&size=${size}&apikey=${API_KEY}`
        }

        const url = `${API_URL}${params}`

        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            const data = await response.json()
            setTotalPages(data.page.totalPages)
        } catch (error) {
            console.error("Error calculating total pages:", error)
        }
    }

    // Helper function to get event ID
    const getEventId = (event) => {
        return (
            event.eventId || event.id || `${event.title || event.name}-${event.startDate || event.dates?.start?.localDate}`
        )
    }

    // Filter out duplicate events
    const filterDuplicateEvents = (newEvents) => {
        if (!newEvents || newEvents.length === 0) return []

        return newEvents.filter((event) => {
            const eventId = getEventId(event)
            if (loadedEventIds.has(eventId)) {
                return false // Skip this event as it's already loaded
            }
            return true
        })
    }

    // Fetches local and Ticketmaster events based on search type, category, page, and search query, handling pagination, duplicates, and merging results.
    const fetchEvent = async (type, categoryName, page, searchQuery) => {
        console.log("Fetching events with search query:", searchQuery, "page:", page)
        setSearchError(null)

        // Reset state for new searches
        if (searchQuery && page === 0) {
            setNoMoreWebsiteEvents(false)
            setLastEvaluatedKey(null)
            setAllAvailableEvents([])
            setModifiedWebsiteEvents([])
        }

        // Fetch local events
        let websiteEvents = []
        let newWebsiteEvents = []

        if (!noMoreWebsiteEvents) {
            try {
                let data
                if (type === "popular" || searchQuery) {
                    console.log("Fetching search results with term:", searchQuery)
                    // Make sure searchQuery is passed as-is, don't add spaces or modify it
                    data = await getEventsBySearchTerm(searchQuery || "", lastEvaluatedKey, PAGE_SIZE)
                } else if (type === "category") {
                    data = await getEventsByCategory(categoryName, lastEvaluatedKey, PAGE_SIZE)
                }

                if (data?.events?.length) {
                    data.events = data.events.map((event) => ({
                        ...event,
                        tickets: typeof event.tickets === "string" ? JSON.parse(event.tickets) : event.tickets,
                    }))

                    websiteEvents = data.events
                    setLastEvaluatedKey(data.lastEvaluatedKey)

                    newWebsiteEvents = websiteEvents.map((event) => ({
                        ...event,
                        source: "local", // Mark these events as 'local'
                    }))

                    // Filter out duplicates
                    newWebsiteEvents = filterDuplicateEvents(newWebsiteEvents)

                    setModifiedWebsiteEvents(
                        websiteEvents.map((event) => ({
                            ...event,
                            source: "local", // Mark these events as 'local'
                        })),
                    )
                } else {
                    setNoMoreWebsiteEvents(true)
                }
            } catch (error) {
                console.error("Error fetching local events:", error)
                setSearchError("Failed to fetch local events. Please try again.")
            }
        }

        try {
            const pageBody = {
                size: PAGE_SIZE,
                category: categoryName,
                searchTerm: searchQuery,
                isSearch: Boolean(searchQuery),
            }

            const pages = await calculateTotalPages(pageBody)
            setTotalPages(pages?.totalPages || 0)
        } catch (error) {
            console.error("Error calculating total pages:", error)
        }

        // Fetch Ticketmaster events if needed
        const numberWebsiteEvents = newWebsiteEvents.length
        let newTicketMasterEvents = []

        // Always fetch Ticketmaster events for "View More"
        try {
            if (page > 0 || numberWebsiteEvents < PAGE_SIZE) {
                setNoMoreWebsiteEvents(true)

                const body = {
                    size: PAGE_SIZE,
                    page: ticketmasterEventsPage,
                    category: categoryName,
                    searchTerm: searchQuery,
                    isSearch: Boolean(searchQuery),
                }

                console.log("Fetching Ticketmaster events with page:", ticketmasterEventsPage)
                const ticketData = await getTicketmasterEvents(body)

                if (ticketData) {
                    setTicketMasterEventsFetched(true)
                    setTotalPages(ticketData.page?.totalPages - 1 || 0)

                    const ticketMasterEvents = ticketData._embedded?.events || []

                    if (Array.isArray(ticketMasterEvents) && ticketMasterEvents.length > 0) {
                        newTicketMasterEvents = ticketMasterEvents.map((event) => ({
                            ...event,
                            source: "ticketmaster", // Mark these events as 'ticketmaster'
                        }))

                        // Filter out duplicates
                        newTicketMasterEvents = filterDuplicateEvents(newTicketMasterEvents)

                        // If this is a "View More" request (page > 0), return only Ticketmaster events
                        if (page > 0) {
                            setTicketmasterEventsPage(ticketmasterEventsPage + 1)
                            return newTicketMasterEvents
                        }

                        // For initial load, combine local and Ticketmaster events
                        const ticketmasterEventsNeeded = PAGE_SIZE - numberWebsiteEvents
                        const splicedTicketmasterEvents = newTicketMasterEvents.slice(0, ticketmasterEventsNeeded)

                        setTicketmasterEventsPage(ticketmasterEventsPage + 1)

                        return [...newWebsiteEvents, ...splicedTicketmasterEvents]
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching Ticketmaster events:", error)
            setSearchError("Failed to fetch events from Ticketmaster. Please try again.")
        }

        return [...newWebsiteEvents]
    }

    // Memoize loadEvents to prevent unnecessary re-renders
    const loadEvents = useCallback(
        async (searchQuery, categoryName) => {
            setLoading(true)
            setEvents([]) // Clear existing events when loading new ones
            setLoadedEventIds(new Set()) // Reset loaded event IDs

            try {
                console.log("Loading events with search:", searchQuery, "category:", categoryName)

                if (searchQuery) {
                    const searchedEvents = await fetchEvent("popular", "popular", 0, searchQuery)
                    console.log("Search results for '" + searchQuery + "':", searchedEvents?.length || 0, "events found")

                    // Update loaded event IDs
                    const newIds = new Set(searchedEvents.map(getEventId))
                    setLoadedEventIds(newIds)

                    setEvents(searchedEvents || [])
                } else if (categoryName === "popular") {
                    const popularEvents = await fetchEvent("popular", "popular", 0, " ")

                    // Update loaded event IDs
                    const newIds = new Set(popularEvents.map(getEventId))
                    setLoadedEventIds(newIds)

                    setEvents(popularEvents || [])
                } else {
                    const categoryEvents = await fetchEvent("category", categoryName)

                    // Update loaded event IDs
                    const newIds = new Set(categoryEvents.map(getEventId))
                    setLoadedEventIds(newIds)

                    setEvents(categoryEvents || [])
                }
            } catch (error) {
                console.error("Error loading events:", error)
                setSearchError("Failed to load events. Please try again.")
            } finally {
                setLoading(false)
            }
        },
        [setEvents, setLoading],
    )

    // Loads more events on "View More" click, handles pagination, updates event lists and loading states, and manages errors gracefully.
    const handleViewMore = async () => {
        if (loadingMore) return
        setLoadingMore(true) // Use the separate loading state for "View More"

        try {
            if (page >= totalPages) {
                setNoMorePages(true)
                return
            }

            const updatedCount = currentWebsiteEventCount + PAGE_SIZE
            setCurrentWebsiteEventCount(updatedCount)

            // Always increment page for "View More"
            const nextPage = page + 1
            setPage(nextPage)

            let newEvents = []

            if (isSearch) {
                const query = searchParams.get("q") || ""
                newEvents = await fetchEvent("popular", "popular", nextPage, query)
            } else if (isCategory) {
                newEvents = await fetchEvent("category", category.categoryName, nextPage)
            } else {
                newEvents = await fetchEvent("popular", "popular", nextPage, " ")
            }

            if (newEvents && newEvents.length > 0) {
                // Update loaded event IDs
                const newIds = new Set([...loadedEventIds])
                newEvents.forEach((event) => {
                    newIds.add(getEventId(event))
                })
                setLoadedEventIds(newIds)

                setEvents((prevEvents) => [...prevEvents, ...newEvents])
            } else {
                setNoMorePages(true)
            }
        } catch (error) {
            console.error("Error loading more events:", error)
            setSearchError("Failed to load more events. Please try again.")
        } finally {
            setLoadingMore(false) // Reset the "View More" loading state
        }
    }

    // Effect to load events when component mounts or when search/category changes
    useEffect(() => {
        setPage(0)
        setTicketmasterEventsPage(0)
        setNoMorePages(false)
        setAllAvailableEvents([])
        setLastEvaluatedKey(null)
        setNoMoreWebsiteEvents(false)

        if (isSearch) {
            const query = searchParams.get("q") || ""
            loadEvents(query, "")
        } else if (isCategory) {
            loadEvents("", category.categoryName)
        } else {
            loadEvents("", "popular")
        }
    }, [isSearch, isCategory, searchParams, category.categoryName, loadEvents])

    // Function to handle manual search
    const handleSearch = (query) => {
        if (!query.trim()) return
        navigate(`/explore/search?q=${encodeURIComponent(query)}`)
    }

    // Function to scroll to the bottom of the event list
    const scrollToBottom = () => {
        // Smooth scroll to the bottom of the event list or to the View More button
        window.scrollTo({
            top: document.querySelector(".events-section")?.getBoundingClientRect().bottom + window.scrollY - 100,
            behavior: "smooth",
        })
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
            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pt: 4,
                    pb: 4,
                    mt: 2,
                }}
            >
                {/* Dark Mode Toggle */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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
                            p: { xs: 2, md: 4 },
                            textAlign: "center",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                            borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        }}
                    >
                        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="#FF5757">
                            {headingText}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{ maxWidth: 800, mx: "auto", mb: 1 }}
                            color={darkMode ? "#cccccc" : "#666666"}
                        >
                            {isSearch
                                ? `Showing results for "${searchTerm}"`
                                : isCategory
                                    ? `Discover more events related to ${category.categoryName}!`
                                    : "Discover exciting events that match your interests!"}
                        </Typography>
                    </Box>

                    {/* Error message if search fails */}
                    {searchError && (
                        <Alert
                            severity="error"
                            sx={{
                                margin: 2,
                                backgroundColor: darkMode ? "rgba(211, 47, 47, 0.1)" : undefined,
                                color: darkMode ? "#f44336" : undefined,
                            }}
                            onClose={() => setSearchError(null)}
                        >
                            {searchError}
                        </Alert>
                    )}

                    {/* Events Section */}
                    <Box sx={{ p: { xs: 3, md: 4 } }} className="explore-event-pages">
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
                                <CircularProgress sx={{ color: "#FF5757" }} />
                            </Box>
                        ) : events.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 6 }}>
                                <Typography variant="h5" color={darkMode ? "#e0e0e0" : "#333333"} gutterBottom>
                                    {isSearch ? `No events found for "${searchTerm}"` : "No events found"}
                                </Typography>
                                <Typography variant="body1" color={darkMode ? "#cccccc" : "#666666"} sx={{ mt: 2, mb: 4 }}>
                                    {isSearch
                                        ? "Try a different search term or browse our categories"
                                        : "Try a different category or search term"}
                                </Typography>

                                {isSearch && (
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate("/home")}
                                        sx={{
                                            backgroundColor: "#FF5757",
                                            "&:hover": {
                                                backgroundColor: darkMode ? "#1a1a1a" : "white",
                                                color: "#FF5757",
                                                border: "1px solid #FF5757",
                                            },
                                            mt: 2,
                                        }}
                                    >
                                        Browse All Events
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <Box className="events-section">
                                <div>
                                    {/* Event Grid - Changed from list to grid */}
                                    <Grid container spacing={2} className="event-grid">
                                        {events.map((event) => (
                                            <Grid item xs={12} md={6} key={getEventId(event)}>
                                                <EventPageCard event={event} />
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Load More Button with localized loading indicator */}
                                    {noMorePages ? (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                                            }}
                                        >
                                            No more events to load
                                        </div>
                                    ) : (
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                                            <button
                                                onClick={() => {
                                                    handleViewMore()
                                                    // Scroll to bottom after a short delay to allow for DOM updates
                                                    setTimeout(scrollToBottom, 100)
                                                }}
                                                disabled={loadingMore}
                                                style={{
                                                    position: "relative",
                                                    minWidth: "140px",
                                                    backgroundColor: loadingMore ? (darkMode ? "#2a2a2a" : "white") : "#FF5757",
                                                    color: loadingMore ? "#FF5757" : "white",
                                                    padding: "10px 30px",
                                                    borderRadius: "9999px",
                                                    border: "1px solid #FF5757",
                                                    cursor: loadingMore ? "default" : "pointer",
                                                    fontSize: "1rem",
                                                    fontWeight: "600",
                                                    transition: "background-color 0.2s, color 0.2s",
                                                    marginTop: "16px",
                                                }}
                                                onMouseOver={(e) => {
                                                    if (loadingMore) {
                                                        // Keep the loading state styling
                                                        return
                                                    }

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
                                                    if (!loadingMore) {
                                                        e.currentTarget.style.backgroundColor = "#FF5757"
                                                        e.currentTarget.style.color = "white"
                                                        e.currentTarget.style.border = "1px solid #FF5757"
                                                    }
                                                }}
                                            >
                                                {loadingMore ? "Loading..." : "View More"}
                                            </button>
                                        </Box>
                                    )}
                                </div>
                            </Box>
                        )}
                    </Box>

                    {/* Bottom section */}
                    <Box
                        sx={{
                            p: { xs: 3, md: 4 },
                            textAlign: "center",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                            borderTop: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        }}
                    >
                        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom color="#FF5757">
                            Looking for more? <span style={{ color: darkMode ? "#e0e0e0" : "#333333" }}>Explore events!</span>
                        </Typography>

                        <button
                            onClick={() => (window.location.href = "/home")}
                            style={{
                                backgroundColor: "#FF5757",
                                color: "white",
                                padding: "10px 30px",
                                borderRadius: "9999px",
                                border: "1px solid #FF5757",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: "600",
                                transition: "background-color 0.2s, color 0.2s",
                                marginTop: "16px",
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
                            Back to Home
                        </button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default ExploreEventPages
