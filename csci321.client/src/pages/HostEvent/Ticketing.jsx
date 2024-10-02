import React, {useEffect, useState} from "react";
import ticketedEvent from "../../assets/ticketedEvent.png"
import freeEvent from "../../assets/freeEvent.png"

function Ticketing ({eventDetails, handleTicketFormChange, setEventDetails}) {
    const [tickets, setTickets] = useState(eventDetails.tickets || []);
    const [eventTicketType, setEventTicketType] = useState(eventDetails.eventTicketType || '');
    const [showPopup, setShowPopup] = useState(false);


    useEffect(() => {
        handleTicketFormChange('eventTicketType', eventTicketType); // Update the eventTicketType in eventDetails
    }, [eventTicketType]);

    const handleEventTypeChange = (type) => {
        setEventTicketType(type); // Update local state on change
        handleTicketFormChange('eventTicketType', type); // Ensure correct field and value are passed
    };

    const handleAddTicket = () => {
        setTickets([...tickets, { name: '', price: '', count: '' }]);
    };

    const handleTicketChange = (index, field, value) => {
        const updatedTickets = tickets.map((ticket, i) =>
            i === index ? { ...ticket, [field]: value } : ticket
        );
        setTickets(updatedTickets);
        handleTicketFormChange('tickets', updatedTickets); // Update the tickets in eventDetails
    };

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
            <h3 className="event-time">{eventDetails.startDate} {eventDetails.startTime} - {eventDetails.endTime}</h3>
        </div>


        <div className="events-grid">
            <form>
                <h2>What type of event are you running?</h2>
                <div className="event-type">
                    <label className={`image-radio ${eventTicketType === 'ticketed' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="eventType"
                            value="ticketed"
                            checked={eventTicketType === 'ticketed'}
                            onChange={() => handleEventTypeChange('ticketed')}
                            style={{display: 'none'}} // Hide the actual radio button
                        />
                        <img className="radio-image" src={ticketedEvent} alt="Ticketed Event"/>
                    </label>
                    <label className={`image-radio ${eventTicketType === 'free' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="eventType"
                            value="free"
                            checked={eventTicketType === 'free'}
                            onChange={() => handleEventTypeChange('free')}
                            style={{display: 'none'}} // Hide the actual radio button
                        />
                        <img className="radio-image" src={freeEvent} alt="Free Event"/>
                    </label>
                </div>

                {eventTicketType === 'ticketed' && (
                <div className="ticket-section">
                    <h2>What tickets are you selling?</h2>
                    <div className="ticket-header">
                        <div className="ticket-column">Ticket Name</div>
                        <div className="ticket-column">Price</div>
                        <div className="ticket-column">Count</div>
                        <div className="ticket-column"></div>
                        {/* Empty column for delete button */}
                    </div>
                    {tickets.map((ticket, index) => (
                        <div className="ticket-row" key={index}>
                            <div className="ticket-column">
                                <input
                                    type="text"
                                    value={ticket.name}
                                    onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                    placeholder="Ticket Name"
                                />
                            </div>
                            <div className="ticket-column">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    className="with-currency"
                                    value={ticket.price}
                                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                                    placeholder="Price"
                                />
                            </div>
                            <div className="ticket-column">
                                <input
                                    type="number"
                                    value={ticket.count}
                                    onChange={(e) => handleTicketChange(index, 'count', e.target.value)}
                                    placeholder="Count"
                                />
                            </div>
                            <div className="ticket-column">
                                <button type="button" onClick={() => handleDeleteTicket(index)}>Delete</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddTicket}>Add Ticket</button>
                </div>
                    )}
                
            </form>
        </div>
        {/* Pop-up for disabled button warning */}
        {showPopup && (
            <div className="popup">
                <p>Please fill in all ticket fields before continuing.</p>
                <button onClick={() => setShowPopup(false)}>Close</button>
            </div>
        )}
    </div>
);

}export default Ticketing;