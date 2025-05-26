import React, {useEffect, useState} from "react";
import ticketedEvent from "../../assets/ticketedEvent.png"
import freeEvent from "../../assets/freeEvent.png"

function Ticketing ({eventDetails, handleTicketFormChange, setEventDetails, setFreeTicket, freeTicket}) {
    const [tickets, setTickets] = useState(eventDetails.tickets || []);
    const [eventTicketType, setEventTicketType] = useState(eventDetails.eventTicketType || '');
    const [showPopup, setShowPopup] = useState(false);
    const [freeTicketCount, setFreeTicketCount] = useState(freeTicket[0].count || 0);
    


    useEffect(() => {
        handleTicketFormChange('eventTicketType', eventTicketType); // Update the eventTicketType in eventDetails
        console.log(eventTicketType);
        if(eventDetails.eventTicketType === 'free') {
            console.log(freeTicket[0].count);
        }
    }, [eventTicketType]);

    const handleEventTypeChange = (type) => {
        setEventTicketType(type); // Update local state on change
        handleTicketFormChange('eventTicketType', type); // Ensure correct field and value are passed
    };

    const handleAddTicket = () => {
        setTickets([...tickets, { name: '', price: '', count: '', soldOut: false, bought: 0 }]);
    };
    
    const handleFreeTicketCount = (value) => {
        setFreeTicketCount(value);
        setFreeTicket([{ name: "Free Admission", price: 0, count: value, soldOut: false, bought: 0 }])

    }


// Updates a specific ticket's field and syncs the changes to the parent form state
    const handleTicketChange = (index, field, value) => {
        const updatedTickets = tickets.map((ticket, i) =>
            i === index ? { ...ticket, [field]: value } : ticket
        );
        setTickets(updatedTickets);
        handleTicketFormChange('tickets', updatedTickets); // Update the tickets in eventDetails
    };

    // Removes a ticket at the specified index and updates the event details and form state accordingly
    const handleDeleteTicket = (index) => {
        const updatedTickets = tickets.filter((_, i) => i !== index);
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            tickets: updatedTickets,
        }));

        setTickets(updatedTickets);

        handleTicketFormChange('tickets', updatedTickets); // Update the tickets in eventDetails

    };


    return (
        <div className="host-event-banner">
            <div className="host-event-headings">
                <h1 className="event-title">{eventDetails.title || "Event Title"}</h1>
                <h2 className="event-location">{eventDetails.location || "Location"}</h2>
                <h3 className="event-time">
                    {eventDetails.startDate} {eventDetails.startTime} - {eventDetails.endTime}
                </h3>
            </div>

            <div className="events-grid">
                <form className="ticketing-page">
                    <h2 className="text-2xl font-bold mb-6 text-[#ff4d4f]">What type of event are you running?</h2>

                    <div
                        className="event-type"
                        style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "30px" }}
                    >
                        <label
                            className={`image-radio ${eventTicketType === "ticketed" ? "selected" : ""}`}
                            style={{
                                flex: 1,
                                border: eventTicketType === "ticketed" ? "2px solid #ff4d4f" : "2px solid #ddd",
                                borderRadius: "8px",
                                padding: "15px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                backgroundColor: eventTicketType === "ticketed" ? "#fff8f8" : "#fff",
                            }}
                        >
                            <input
                                type="radio"
                                name="eventType"
                                value="ticketed"
                                checked={eventTicketType === "ticketed"}
                                onChange={() => handleEventTypeChange("ticketed")}
                                style={{ display: "none" }}
                            />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "48px", color: "#ff4d4f", marginBottom: "10px" }}>🎟️</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "5px" }}>Ticketed Event</h3>
                                <p style={{ fontSize: "14px", color: "#666" }}>Sell tickets with different pricing options</p>
                            </div>
                        </label>

                        <label
                            className={`image-radio ${eventTicketType === "free" ? "selected" : ""}`}
                            style={{
                                flex: 1,
                                border: eventTicketType === "free" ? "2px solid #ff4d4f" : "2px solid #ddd",
                                borderRadius: "8px",
                                padding: "15px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                backgroundColor: eventTicketType === "free" ? "#fff8f8" : "#fff",
                            }}
                        >
                            <input
                                type="radio"
                                name="eventType"
                                value="free"
                                checked={eventTicketType === "free"}
                                onChange={() => handleEventTypeChange("free")}
                                style={{ display: "none" }}
                            />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "48px", color: "#ff4d4f", marginBottom: "10px" }}>🏷️</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "5px" }}>Free Event</h3>
                                <p style={{ fontSize: "14px", color: "#666" }}>Offer free admission to your event</p>
                            </div>
                        </label>
                    </div>

                    {eventTicketType === "ticketed" && (
                        <div className="ticket-section">
                            <h2 className="text-xl font-bold text-[#ff4d4f] mb-4">What tickets are you selling?</h2>

                            <div className="ticket-header">
                                <div className="ticket-column">Ticket Name</div>
                                <div className="ticket-column">Price</div>
                                <div className="ticket-column">Count</div>
                                <div className="ticket-column"></div>
                            </div>

                            {tickets.map((ticket, index) => (
                                <div className="ticket-row" key={index}>
                                    <div className="ticket-column">
                                        <input
                                            type="text"
                                            value={ticket.name}
                                            onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                                            placeholder="Ticket Name"
                                        />
                                    </div>
                                    <div className="ticket-column" style={{ position: "relative" }}>
                                        <span className="currency-symbol">$</span>
                                        <input
                                            type="number"
                                            className="with-currency"
                                            value={ticket.price}
                                            onChange={(e) => handleTicketChange(index, "price", e.target.value)}
                                            placeholder="Price"
                                        />
                                    </div>
                                    <div className="ticket-column">
                                        <input
                                            type="number"
                                            value={ticket.count}
                                            onChange={(e) => handleTicketChange(index, "count", e.target.value)}
                                            placeholder="Count"
                                        />
                                    </div>
                                    <div className="ticket-column">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTicket(index)}
                                            style={{
                                                backgroundColor: "transparent",
                                                color: "#ff4d4f",
                                                border: "1px solid #ff4d4f",
                                                borderRadius: "4px",
                                                padding: "5px 10px",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fff8f8")}
                                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddTicket}
                                style={{
                                    backgroundColor: "#FF5757",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "10px 15px",
                                    marginTop: "15px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "auto",
                                }}
                            >
                                <span style={{ marginRight: "5px" }}>+</span> Add Ticket
                            </button>
                        </div>
                    )}

                    {eventTicketType === "free" && (
                        <div className="ticket-section">
                            <h2 className="text-xl font-bold text-[#ff4d4f] mb-4">How many tickets are available?</h2>

                            <div className="ticket-header">
                                <div className="ticket-column">Ticket Name</div>
                                <div className="ticket-column">Price</div>
                                <div className="ticket-column">Count</div>
                                <div className="ticket-column"></div>
                            </div>

                            <div className="ticket-row">
                                <div className="ticket-column">
                                    <input
                                        type="text"
                                        disabled={true}
                                        value="Free Admission"
                                        placeholder="Ticket Name"
                                        style={{ backgroundColor: "#f5f5f5" }}
                                    />
                                </div>
                                <div className="ticket-column">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        className="with-currency"
                                        disabled={true}
                                        value={0}
                                        placeholder="Price"
                                        style={{ backgroundColor: "#f5f5f5" }}
                                    />
                                </div>
                                <div className="ticket-column">
                                    <input
                                        type="number"
                                        value={freeTicketCount}
                                        onChange={(e) => handleFreeTicketCount(e.target.value)}
                                        placeholder="Count"
                                    />
                                </div>
                                <div className="ticket-column"></div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {showPopup && (
                <div className="popup">
                    <p>Please fill in all ticket fields before continuing.</p>
                    <button onClick={() => setShowPopup(false)}>Close</button>
                </div>
            )}
        </div>
    );

}export default Ticketing;