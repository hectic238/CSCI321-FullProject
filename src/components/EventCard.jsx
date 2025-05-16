"use client"

import React from "react"
import { Card, CardContent, CardMedia, Typography, Box, Chip } from "@mui/material"
import { CalendarToday, AccessTime, LocationOn } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useAuth } from "react-oidc-context"

const EventCard = ({ event, darkMode = false }) => {
    const navigate = useNavigate()
    const auth = useAuth()

    // Generate unique ID
    const eventUniqueId = React.useMemo(
        () => event.id || event.eventId || `${event.title}-${event.startDate}-${event.location}`.replace(/\s+/g, "-"),
        [event]
    )

    const handleCardClick = () => {
        if (event.source === "ticketmaster") navigate(`/event/${event.id}`)
        else navigate(`/event/${event.title}/${event.eventId || event.id}`)
    }

    // Format date
    const formattedDate = event.startDate
        ? new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : event.dates?.start?.localDate
            ? new Date(event.dates.start.localDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "Date TBA"

    // Image URL
    const imageUrl =
        event.source === "ticketmaster"
            ? event.images?.[0]?.url || "/placeholder.jpg"
            : event.image || "/placeholder.jpg"

    // Location
    const location =
        event.source === "ticketmaster"
            ? event._embedded?.venues?.[0]?.name || "Location TBA"
            : event.location || "Location TBA"

    // Time
    const startTime =
        event.source === "ticketmaster"
            ? event.dates?.start?.localTime || "Time TBA"
            : event.startTime || "Time TBA"
    const endTime =
        event.source === "ticketmaster"
            ? event.dates?.end?.localTime || null
            : event.endTime || null
    const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime

    // Determine free
    const isFree =
        event.isFree === true ||
        (event.tickets?.some((t) => t?.price === 0))

    // Determine price range
    const priceRange = React.useMemo(() => {
        if (isFree) return null
        if (event.priceRanges?.length) {
            const pr = event.priceRanges[0]
            return `$${pr.min}${pr.max > pr.min ? ` - $${pr.max}` : ""}`
        }
        if (event.tickets?.length) {
            const prices = event.tickets.filter(t => t?.price != null).map(t => Number(t.price))
            if (prices.length) {
                const min = Math.min(...prices)
                const max = Math.max(...prices)
                return min === max ? `$${min}` : `$${min} - $${max}`
            }
        }
        return null
    }, [event, isFree])

    const isSoldOut = event.isSoldOut === true
    const hasLimitedSpace = event.hasLimitedSpace === true

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                width: "210px",
                height: "290px",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" },
                backgroundColor: darkMode ? "#2a2a2a" : "white",
                color: darkMode ? "#e0e0e0" : "inherit",
                border: darkMode ? "1px solid #333" : "1px solid #e0e0e0",
                position: "relative",
                margin: "0 auto",
            }}
        >
            <Box sx={{ position: "relative" }}>
                <CardMedia component="img" height="140" image={imageUrl} alt={event.title || event.name} sx={{ objectFit: "cover" }} />

                {/* Free event or price tag at top-left */}
                {isFree ? (
                    <Chip
                        label="Free Event"
                        size="small"
                        sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            backgroundColor: "green",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            height: "22px",
                        }}
                    />
                ) : (
                    priceRange && (
                        <Chip
                            label={priceRange}
                            size="small"
                            sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                backgroundColor: "#6b21a8",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                height: "22px",
                            }}
                        />
                    )
                )}
            </Box>

            <Box sx={{ position: "relative", flexGrow: 1, display: "flex", flexDirection: "column", height: "120px" }}>
                <CardContent sx={{ p: 1.2, pb: 0, "&:last-child": { pb: 0 }, overflow: "hidden" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            color: darkMode ? "white" : "#333",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.2,
                            minHeight: "32px",
                        }}
                    >
                        {event.title || event.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.2 }}>
                        <CalendarToday sx={{ fontSize: "0.9rem", mr: 0.6, color: "#FF5757" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: darkMode ? "#fff" : "#333", fontWeight: 500 }}>
                            {formattedDate}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.2 }}>
                        <AccessTime sx={{ fontSize: "0.9rem", mr: 0.6, color: "#FF5757" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: darkMode ? "#fff" : "#333", fontWeight: 500 }}>
                            {timeDisplay}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.3 }}>
                        <LocationOn sx={{ fontSize: "0.9rem", mr: 0.6, mt: "2px", color: "#FF5757" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: darkMode ? "#fff" : "#333", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                            {location}
                        </Typography>
                    </Box>
                </CardContent>

                <Box sx={{ position: "absolute", bottom: "6px", left: 0, right: 0, display: "flex", justifyContent: "space-between", px: 1.2, py: 0.5 }}>
                    {event.source === "ticketmaster" && (
                        <Chip label="Ticketmaster" size="small" sx={{ backgroundColor: "#026CDF", color: "white", fontSize: "0.7rem", height: "22px", fontWeight: 500 }} />
                    )}
                    <Box sx={{ display: "flex", gap: 0.8 }}>
                        {isSoldOut && <Chip label="Sold Out" size="small" sx={{ backgroundColor: "red", color: "white", fontSize: "0.7rem", height: "22px", fontWeight: "bold" }} />}
                        {!isSoldOut && hasLimitedSpace && <Chip label="Almost Sold Out" size="small" sx={{ backgroundColor: "orange", color: "black", fontSize: "0.7rem", fontWeight: "bold", height: "22px" }} />}
                    </Box>
                </Box>
            </Box>
        </Card>
    )
}

export default EventCard
