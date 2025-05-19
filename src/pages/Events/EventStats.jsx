import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getEvent } from "@/components/eventFunctions.jsx"

function EventStats() {
    const { eventId } = useParams()
    const [eventDetails, setEventDetails] = useState(null)

    useEffect(() => {
        getEvent(eventId).then((event) => {
            if (event) {
                console.log(event)
                if (typeof event.tickets === "string") {
                    event.tickets = JSON.parse(event.tickets)
                }
                setEventDetails(event)
            }
        })
    }, [eventId])

    if (!eventDetails) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    backgroundColor: "#f5f5f5",
                }}
            >
                <p
                    style={{
                        fontSize: "18px",
                        color: "#555",
                        padding: "20px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    Loading event details...
                </p>
            </div>
        )
    }

    const getTotalAttendees = () => {
        var totalAttendees = 0
        for (var ticket of eventDetails.tickets) {
            totalAttendees += ticket.bought
        }
        return totalAttendees
    }

    const renderTicketStats = () => {
        if (eventDetails.eventTicketType === "ticketed" && eventDetails.tickets) {
            console.log(eventDetails.tickets)
            return eventDetails.tickets.map((ticket, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "20px",
                        marginBottom: "15px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            marginTop: "0",
                            marginBottom: "15px",
                            color: "#333",
                        }}
                    >
                        {ticket.name}
                    </h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                            gap: "15px",
                        }}
                    >
                        <p
                            style={{
                                margin: "0",
                                fontSize: "15px",
                            }}
                        >
                            <strong style={{ color: "#555" }}>Price:</strong>{" "}
                            <span style={{ color: "#2ecc71", fontWeight: "600" }}>${ticket.price}</span>
                        </p>
                        <p
                            style={{
                                margin: "0",
                                fontSize: "15px",
                            }}
                        >
                            <strong style={{ color: "#555" }}>Sold:</strong>{" "}
                            <span style={{ fontWeight: "600" }}>{ticket.bought}</span>
                        </p>
                        <p
                            style={{
                                margin: "0",
                                fontSize: "15px",
                            }}
                        >
                            <strong style={{ color: "#555" }}>Available:</strong>{" "}
                            <span style={{ fontWeight: "600" }}>{ticket.count}</span>
                        </p>
                    </div>
                    <div
                        style={{
                            height: "8px",
                            backgroundColor: "#eee",
                            borderRadius: "4px",
                            marginTop: "15px",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${Math.min(100, (ticket.bought / ticket.count) * 100)}%`,
                                backgroundColor: "#3498db",
                                borderRadius: "4px",
                            }}
                        ></div>
                    </div>
                </div>
            ))
        } else {
            return eventDetails.tickets.map((ticket, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "20px",
                        marginBottom: "15px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            marginTop: "0",
                            marginBottom: "15px",
                            color: "#333",
                        }}
                    >
                        {ticket.name}
                    </h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                            gap: "15px",
                        }}
                    >
                        <p
                            style={{
                                margin: "0",
                                fontSize: "15px",
                            }}
                        >
                            <strong style={{ color: "#555" }}>Attending:</strong>{" "}
                            <span style={{ fontWeight: "600" }}>{ticket.bought}</span>
                        </p>
                        <p
                            style={{
                                margin: "0",
                                fontSize: "15px",
                            }}
                        >
                            <strong style={{ color: "#555" }}>Spaces Left:</strong>{" "}
                            <span style={{ fontWeight: "600" }}>{ticket.count}</span>
                        </p>
                    </div>
                    <div
                        style={{
                            height: "8px",
                            backgroundColor: "#eee",
                            borderRadius: "4px",
                            marginTop: "15px",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${Math.min(100, (ticket.bought / ticket.count) * 100)}%`,
                                backgroundColor: "#3498db",
                                borderRadius: "4px",
                            }}
                        ></div>
                    </div>
                </div>
            ))
        }
    }

    return (
        <div className="host-event-page-wrapper">
            <div className="stats-event-card">
         <div
            style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                backgroundColor: "#f5f5f5",
                minHeight: "20vh",
                padding: "20px",
                color: "#333",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginBottom: "25px",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        height: "200px",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src={eventDetails.image || "/placeholder.svg"}
                        alt={eventDetails.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            right: "0",
                            padding: "20px",
                            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                            color: "white",
                        }}
                    >
                        <h1
                            style={{
                                margin: "0 0 5px 0",
                                fontSize: "24px",
                                fontWeight: "600",
                            }}
                        >
                            {eventDetails.title}
                        </h1>
                        <p
                            style={{
                                margin: "0",
                                fontSize: "14px",
                                opacity: "0.9",
                            }}
                        >
                            {eventDetails.startDate} | {eventDetails.startTime} - {eventDetails.endTime}
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        padding: "20px",
                    }}
                >
                    <p
                        style={{
                            margin: "0",
                            fontSize: "16px",
                            color: "#555",
                        }}
                    >
                        <strong>Location:</strong> {eventDetails.location}
                    </p>
                </div>
            </div>
            </div>

            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    padding: "25px",
                    marginBottom: "25px",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                }}
            >
                <h2
                    style={{
                        margin: "0 0 20px 0",
                        fontSize: "22px",
                        fontWeight: "600",
                        color: "#FF5757",
                        borderBottom: "2px solid #f0f0f0",
                        paddingBottom: "10px",
                    }}
                >
                    Event Statistics
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                        marginBottom: "20px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#f8f9fa",
                            padding: "20px",
                            borderRadius: "8px",
                            textAlign: "center",
                        }}
                    >
                        <h3
                            style={{
                                margin: "0 0 10px 0",
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "#666",
                            }}
                        >
                            Total Attendees
                        </h3>
                        <p
                            style={{
                                margin: "0",
                                fontSize: "28px",
                                fontWeight: "700",
                                color: "#FF5757",
                            }}
                        >
                            {getTotalAttendees()}
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: "30px",
                    }}
                >
                    <h3
                        style={{
                            margin: "0 0 20px 0",
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#FF5757",
                        }}
                    >
                        Ticket Sales
                    </h3>
                    {renderTicketStats()}
                </div>
            </div>
        </div>
        </div>    
    )
}

export default EventStats