"use client"
import { Card, CardContent, Typography, Box, Chip } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import { useTheme } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"

const EventPageCard = ({ event }) => {
    const theme = useTheme()
    const darkMode = theme.palette.mode === "dark"
    const navigate = useNavigate()

    // Handle card click to navigate to event details
    const handleCardClick = () => {
        if (event.source === "ticketmaster") {
            navigate(`/event/${event.id}`)
        } else {
            navigate(`/event/${event.title}/${event.eventId || event.id}`)
        }
    }

    // Format date if it exists
    const formattedDate = event.startDate
        ? new Date(event.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : event.dates?.start?.localDate
            ? new Date(event.dates.start.localDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })
            : "Date TBA"

    // Get event location
    const location =
        event.source === "ticketmaster"
            ? event._embedded?.venues?.[0]?.name || "Location TBA"
            : event.location || "Location TBA"

    // Get event time
    const time =
        event.source === "ticketmaster"
            ? event.dates?.start?.localTime
                ? new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                : "Time TBA"
            : event.startTime || "Time TBA"

    // Get image URL based on event source
    const imageUrl =
        event.source === "ticketmaster"
            ? event.images && event.images.length > 0
                ? event.images[0].url
                : "/placeholder.svg"
            : event.image || "/placeholder.svg"

    // Check if event is free
    const isFree =
        event.isFree === true ||
        (event.tickets && Array.isArray(event.tickets) && event.tickets.some((ticket) => ticket && ticket.price === 0)) ||
        (event.priceRanges && event.priceRanges[0] && event.priceRanges[0].min === 0)

    // Check if event is sold out
    const isSoldOut =
        event.isSoldOut === true ||
        (event.tickets &&
            Array.isArray(event.tickets) &&
            event.tickets.every((ticket) => ticket.count === 0 || ticket.soldOut === true))

    // Check if event has limited space
    const hasLimitedSpace =
        event.hasLimitedSpace === true ||
        (event.tickets &&
            Array.isArray(event.tickets) &&
            event.tickets.some((ticket) => ticket.count > 0 && ticket.count < 10))

    // Get event category
    const category = (() => {
        if (event.source === "ticketmaster" && event.classifications && event.classifications.length > 0) {
            const classification = event.classifications[0]
            return classification.segment?.name || classification.genre?.name || "Event"
        }
        return event.category || event.eventCategory || "Event"
    })()

    // Get price range
    const priceRange = (() => {
        if (isFree) return null

        if (event.priceRanges && event.priceRanges.length > 0) {
            return `$${event.priceRanges[0].min}${event.priceRanges[0].max > event.priceRanges[0].min ? ` - $${event.priceRanges[0].max}` : ""}`
        }

        if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
            const prices = event.tickets
                .filter((ticket) => ticket && typeof ticket.price !== "undefined" && ticket.price !== null)
                .map((ticket) => Number(ticket.price))

            if (prices.length > 0) {
                const min = Math.min(...prices)
                const max = Math.max(...prices)
                return min === max ? `$${min}` : `$${min} - $${max}`
            }
        }

        return null
    })()

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                width: "100%",
                borderRadius: "8px",
                backgroundColor: darkMode ? "#2a2a2a" : "white",
                border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                borderLeft: `4px solid #FF5757`,
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
                },
                display: "flex",
                height: "110px",
                padding: 0,
                overflow: "hidden",
                position: "relative",
            }}
        >
            {/* Image section */}
            <Box
                sx={{
                    width: "150px",
                    minWidth: "150px",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={event.title || event.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </Box>

            {/* Content section */}
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%", overflow: "hidden" }}>
                <CardContent
                    sx={{
                        padding: "8px 10px",
                        "&:last-child": { paddingBottom: "8px" },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Title and price */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography
                            variant="h5"
                            component="div"
                            sx={{
                                fontSize: "1.15rem",
                                lineHeight: 1.2,
                                fontWeight: "700",
                                color: "#FF5757",
                                textAlign: "left",
                                marginRight: 1,
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {event.title || event.name}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                            {/* Free Event tag */}
                            {isFree && (
                                <Chip
                                    label="Free"
                                    size="small"
                                    sx={{
                                        backgroundColor: "green",
                                        color: "white",
                                        fontSize: "0.65rem",
                                        height: "20px",
                                        fontWeight: "bold",
                                        display: "inline-flex",
                                    }}
                                />
                            )}

                            {/* Price range */}
                            {!isFree && priceRange && (
                                <Chip
                                    label={priceRange}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#6b21a8",
                                        color: "white",
                                        fontSize: "0.65rem",
                                        height: "20px",
                                        fontWeight: "bold",
                                        display: "inline-flex",
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Event details */}
                    <Box sx={{ mb: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "2px", mb: 0.5 }}>
                            <CalendarMonthIcon
                                sx={{
                                    fontSize: "0.85rem",
                                    marginRight: "2px",
                                    color: "#FF5757",
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {formattedDate}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: "2px", mb: 0.5 }}>
                            <AccessTimeIcon
                                sx={{
                                    fontSize: "0.85rem",
                                    marginRight: "2px",
                                    color: "#FF5757",
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {time}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: "2px", mb: 0.5 }}>
                            <LocationOnIcon
                                sx={{
                                    fontSize: "0.85rem",
                                    marginRight: "2px",
                                    color: "#FF5757",
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {location}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Box>

            {event.source === "ticketmaster" && (
                <Chip
                    label="Sold on Ticketmaster"
                    size="small"
                    sx={{
                        position: "absolute",
                        bottom: 5,
                        right: 5,
                        backgroundColor: "#026CDF",
                        color: "white",
                        fontSize: "0.65rem",
                        height: "20px",
                        fontWeight: "500",
                        zIndex: 2,
                    }}
                />
            )}

            {isSoldOut && (
                <Chip
                    label="Sold Out"
                    size="small"
                    sx={{
                        position: "absolute",
                        bottom: 5,
                        right: event.source === "ticketmaster" ? 140 : 5,
                        backgroundColor: "red",
                        color: "white",
                        fontSize: "0.65rem",
                        height: "20px",
                        fontWeight: "bold",
                        zIndex: 2,
                    }}
                />
            )}

            {!isSoldOut && hasLimitedSpace && (
                <Chip
                    label="Limited Space"
                    size="small"
                    sx={{
                        position: "absolute",
                        bottom: 5,
                        right: event.source === "ticketmaster" ? 140 : 5,
                        backgroundColor: "orange",
                        color: "black",
                        fontSize: "0.65rem",
                        height: "20px",
                        fontWeight: "bold",
                        zIndex: 2,
                    }}
                />
            )}
        </Card>
    )
}

export default EventPageCard
