"use client"

import { useEffect, useState } from "react"
import EventCard from "@/components/EventCard.jsx"
import { getEventsByCategory, getEventsBySearchTerm, getTicketmasterEvents } from "@/components/eventFunctions.jsx"
import Navbar from "@/components/Navbar"
import "./ExploreEvents.css"
import { useNavigate } from "react-router-dom"
import { Box, Container, Paper, Typography, Divider, CircularProgress, FormControlLabel, Switch } from "@mui/material"
import { DarkMode, LightMode } from "@mui/icons-material"

// Configuration for the 5 categories
const categoriesConfig = [
    { key: "popular", title: "Popular Events", type: "popular", category: "popular", path: "/explore/category/popular" },
    { key: "concerts", title: "Music", type: "category", category: "Music", path: "/explore/category/Music" },
    { key: "theatre", title: "Arts", type: "category", category: "Art", path: "/explore/category/Art" },
    { key: "family", title: "Family", type: "category", category: "Family", path: "/explore/category/Family" },
    { key: "comedy", title: "Comedy", type: "category", category: "Comedy", path: "/explore/category/Comedy" },
]
const PAGE_SIZE = 5

export default function ExploreEvents({ category, searchTerm }) {
    // State hooks
    const [popularEvents, setPopularEvents] = useState([])
    const [concerts, setConcerts] = useState([])
    const [theatreEvents, setTheatreEvents] = useState([])
    const [familyEvents, setFamilyEvents] = useState([])
    const [comedyEvents, setComedyEvents] = useState([])
    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true")
    const [loading, setLoading] = useState(true)
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null)
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false)
    const [ticketmasterEventsPage, setTicketmasterEventsPage] = useState(0)
    const navigate = useNavigate()

    // Helper to fetch Ticketmaster events
    const fetchTicketMasterEvents = async (size = 10, page = 0, category = "") => {
        const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json"
        const API_KEY = `${import.meta.env.VITE_TICKETMASTER_KEY}`
        const params = category === "popular"
            ? `?dmaId=702&size=${size}&page=${page}&apikey=${API_KEY}`
            : `?dmaId=702&classificationName=${category}&size=${size}&page=${page}&apikey=${API_KEY}`
        try {
            const response = await fetch(`${API_URL}${params}`)
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
            const data = await response.json()
            return data._embedded?.events
        } catch (err) {
            console.error("Failed to fetch events:", err)
        }
    }

    // Original fetchEvent logic
    const fetchEvent = async (type, category, searchTerm) => {
        let websiteEvents = []
        let newWebsiteEvents = []
        if (!noMoreWebsiteEvents) {
            
            const data = type === "popular"
                ? await getEventsBySearchTerm(" ", lastEvaluatedKey, PAGE_SIZE)
                : await getEventsByCategory(category, lastEvaluatedKey, PAGE_SIZE)
            if (data?.events?.length) {
                data.events = data.events.map((evt) => ({
                    ...evt,
                    tickets: typeof evt.tickets === "string" ? JSON.parse(evt.tickets) : evt.tickets,
                }))
            }
            websiteEvents = data.events || []
            setLastEvaluatedKey(data.lastEvaluatedKey)
            newWebsiteEvents = websiteEvents.map((evt) => ({ ...evt, source: "local" }))
            if (!websiteEvents.length) setNoMoreWebsiteEvents(true)
        }
        const deficit = PAGE_SIZE - newWebsiteEvents.length
        let tmWrapped = []
        if (deficit > 0) {
            const resp = await getTicketmasterEvents({ size: deficit, page: ticketmasterEventsPage, category })
            const tm = resp._embedded?.events || []
            tmWrapped = tm.map((e) => ({ ...e, source: "ticketmaster" }))
            setTicketmasterEventsPage((p) => p + 1)
        }
        return [...newWebsiteEvents, ...tmWrapped]
    }

    // Sequential load
    const loadEvents = async () => {
        setLoading(true)
        try {
            const popular = await fetchEvent("popular", "popular", "")
            setPopularEvents(popular)

            const concerts = await fetchEvent("category", "Music", "")
            setConcerts(concerts)

            const theatre = await fetchEvent("category", "Art", "")
            setTheatreEvents(theatre)

            const family = await fetchEvent("category", "Family", "")
            setFamilyEvents(family)

            const comedy = await fetchEvent("category", "Comedy", "")
            setComedyEvents(comedy)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        document.title = "Explore Events | PLANIT"
        loadEvents()
    }, [])

    useEffect(() => {
        if (darkMode) document.body.classList.add("dark")
        else document.body.classList.remove("dark")
        localStorage.setItem("darkMode", darkMode.toString())
    }, [darkMode])

    const handleDarkModeToggle = () => setDarkMode((d) => !d)

    // Styles for grid layout
    const eventsContainerStyle = (list) => ({
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "4px",
        overflowX: list.length > PAGE_SIZE ? "auto" : "hidden",
        paddingBottom: "10px",
        minHeight: list.length ? "300px" : "60px",
        width: "100%",
        boxSizing: "border-box",
        ...(list.length > PAGE_SIZE && { gridAutoFlow: "column", gridAutoColumns: "minmax(210px, 1fr)" }),
    })
    const cardWrapperStyle = { height: "300px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }
    const innerCardStyle = { width: "100%", height: "100%" }
    const noEventsStyle = { textAlign: "center", color: darkMode ? "#cccccc" : "#666666", fontStyle: "italic" }

    const stateMap = {
        popular: popularEvents,
        concerts,
        theatre: theatreEvents,
        family: familyEvents,
        comedy: comedyEvents,
    }

    return (
        <>
            <Navbar />
            {/* Dark grey background outside the white box */}
            <Box sx={{ minHeight: "100vh", backgroundColor: darkMode ? "#1a1a1a" : "#2a2a2a" }}>
                <Container maxWidth="lg" sx={{ pt: 2, pb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
                            label={darkMode ? <LightMode /> : <DarkMode />}
                        />
                    </Box>
                    <Paper sx={{ p: 2, backgroundColor: darkMode ? "#1a1a1a" : "#ffffff", borderRadius: 2, boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)" }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                <CircularProgress color="inherit" />
                            </Box>
                        ) : (
                            categoriesConfig.map((cfg, idx) => {
                                const list = stateMap[cfg.key] || []
                                return (
                                    <Box key={cfg.key} sx={{ mb: idx < categoriesConfig.length - 1 ? 2 : 0 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: idx === 0 ? 1 : 3, mb: 1 }}>
                                            <Typography variant="h6" fontWeight="bold" color="#FF5757" sx={{ textDecoration: "underline" }}>
                                                {cfg.title}
                                            </Typography>
                                            <button className="view-more-btn" onClick={() => navigate(cfg.path)}>
                                                View More
                                            </button>
                                        </Box>
                                        <Box sx={eventsContainerStyle(list)}>
                                            {list.length ? (
                                                list.map((evt, i) => (
                                                    <Box key={evt.eventId || evt.id || i} sx={cardWrapperStyle}>
                                                        <Box sx={innerCardStyle}>
                                                            <EventCard event={evt} darkMode={darkMode} />
                                                        </Box>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography sx={noEventsStyle}>No events found.</Typography>
                                            )}
                                        </Box>
                                        {idx < categoriesConfig.length - 1 && <Divider sx={{ mt: 2, mb: 2, borderColor: darkMode ? "#333" : "#e0e0e0" }} />}
                                    </Box>
                                )
                            })
                        )}
                    </Paper>
                </Container>
            </Box>
        </>
    )
}