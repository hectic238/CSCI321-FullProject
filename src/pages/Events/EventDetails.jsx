import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar.jsx";
import { Drawer, Button } from 'antd';
import './EventDetails.css';
import { getCookie } from "@/components/Cookie.jsx";
import { getEvent } from "@/components/eventFunctions.jsx";
import { useAuth } from "react-oidc-context";
import { CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';

const EventDetails = () => {
    const { eventId } = useParams();
    const [eventDetails, setEventDetails] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [isEventInPast, setIsEventInPast] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();

    const iconStyle = {
        color: '#FF5757',
        verticalAlign: 'middle',
        marginRight: '8px',
        fontSize: '1.2rem'
    };

    const infoItemStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        fontSize: '1rem',
        margin: '4px 0'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '24px'
    };

    const imageStyle = {
        width: '300px',
        height: '170px',
        objectFit: 'cover',
        borderRadius: '8px',
        flexShrink: 0
    };

    const infoContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1
    };

    const titleStyle = {
        fontSize: '2rem',
        margin: 0,
        color: '#FF5757',
        lineHeight: 1.2
    };

    const handleAddTicket = (ticket) => {
        if (ticket.soldOut) return;
        const copy = [...selectedTickets];
        const idx = copy.findIndex(t => t.name === ticket.name);
        if (idx > -1) copy[idx].quantity++;
        else copy.push({ ...ticket, quantity: 1 });
        setSelectedTickets(copy);
        setTotalTickets(prev => prev + 1);
        setTotalPrice(prev => prev + Number(ticket.price));
    };

    const handleRemoveTicket = (ticket) => {
        const copy = [...selectedTickets];
        const idx = copy.findIndex(t => t.name === ticket.name);
        if (idx > -1 && copy[idx].quantity > 0) {
            copy[idx].quantity--;
            if (copy[idx].quantity === 0) copy.splice(idx, 1);
            setSelectedTickets(copy);
            setTotalTickets(prev => prev - 1);
            setTotalPrice(prev => prev - Number(ticket.price));
        }
    };

    const handleCheckout = async () => {
        if (!auth.isAuthenticated) {
            alert("Please log in to checkout.");
            return;
        }
        if (getCookie("userType") !== "attendee") {
            alert("Your account is not permitted to purchase tickets.");
            return;
        }
        if (totalTickets === 0) {
            alert("Select at least one ticket.");
            return;
        }
        navigate(`/checkout/${eventId}`, { state: { selectedTickets, eventDetails } });
    };

    const handleAttendeeCountChange = (inc) => {
        setAttendeeCount(prev => Math.max(0, prev + inc));
    };

    const handleAttendClick = () => {
        if (!isEventInPast) {
            eventDetails.numberAttendees += attendeeCount;
            eventDetails.tickets[0].count -= attendeeCount;
            eventDetails.tickets[0].bought += attendeeCount;
        }
    };

    useEffect(() => {
        getEvent(eventId).then(event => {
            if (!event) return;
            if (typeof event.tickets === 'string') {
                try { event.tickets = JSON.parse(event.tickets); }
                catch { event.tickets = []; }
            }
            setEventDetails(event);
            const now = new Date();
            const when = new Date(`${event.startDate}T${event.startTime}`);
            setIsEventInPast(when < now);
            document.title = `${event.title} | PLANIT`;
        });
    }, [eventId]);

    if (!eventDetails) {
        return <p>Loading event details…</p>;
    }

    return (
        <div className="event-details-container">
            <Navbar />

            <div className="event-header" style={headerStyle}>
                <img
                    src={eventDetails.image}
                    alt={eventDetails.title}
                    style={imageStyle}
                />

                <div className="event-info" style={infoContainerStyle}>
                    <h1 className="event-title" style={titleStyle}>
                        {eventDetails.title}
                    </h1>
                    <p className="event-date" style={infoItemStyle}>
                        <CalendarToday style={iconStyle} />
                        {eventDetails.startDate}
                    </p>
                    <p className="event-time" style={infoItemStyle}>
                        <AccessTime style={iconStyle} />
                        {eventDetails.startTime} – {eventDetails.endTime}
                    </p>
                    <p className="event-location" style={infoItemStyle}>
                        <LocationOn style={iconStyle} />
                        {eventDetails.location}
                    </p>
                </div>

                <Button
                    onClick={() => setIsDrawerVisible(true)}
                    style={{ width: '100px', height: '40px', alignSelf: 'start' }}
                >
                    More Info
                </Button>
            </div>

            <Drawer
                title={<span style={{ color: '#FF5757', fontSize: '1.5rem' }}>{eventDetails.title}</span>}
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                width={360}
            >
                <h2 style={{ color: '#FF5757', marginBottom: '16px' }}>
                    {eventDetails.title}
                </h2>
                <p style={infoItemStyle}>
                    <CalendarToday style={iconStyle} />
                    {eventDetails.startDate}
                </p>
                <p style={infoItemStyle}>
                    <AccessTime style={iconStyle} />
                    {eventDetails.startTime} – {eventDetails.endTime}
                </p>
                <p style={infoItemStyle}>
                    <LocationOn style={iconStyle} />
                    {eventDetails.location}
                </p>
                <p style={{ marginTop: '16px', lineHeight: 1.4 }}>
                    {eventDetails.additionalInfo}
                </p>
            </Drawer>

            <div className="event-body">
                <div className="venue-info">
                    <div className="venue-map">Venue Map Placeholder</div>
                </div>

                <div className="ticket-info">
                    {eventDetails.eventTicketType === 'free' ? (
                        <div className="general-admission">
                            <div>Free Event</div>
                            <div>
                                <button onClick={() => handleAttendeeCountChange(-1)}>-</button>
                                <span>{attendeeCount}</span>
                                <button onClick={() => handleAttendeeCountChange(1)}>+</button>
                            </div>
                            <Button
                                onClick={handleAttendClick}
                                disabled={isEventInPast}
                            >
                                Attend
                            </Button>
                            {isEventInPast && (
                                <p className="event-message">
                                    This event has already happened. Tickets can no longer be purchased or attended.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            {eventDetails.tickets.map(ticket => (
                                <div key={ticket.name} className="ticket-item">
                                    <p>
                                        {ticket.name}
                                        {ticket.count < 1 && <span style={{ color: 'red' }}>(Sold Out)</span>}
                                    </p>
                                    <p>Price: ${ticket.price}</p>
                                    <div className="ticket-quantity">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleRemoveTicket(ticket)}
                                            disabled={ticket.count < 1 || isEventInPast}
                                        >
                                            -
                                        </button>
                                        <span>
                      {selectedTickets.find(t => t.name === ticket.name)?.quantity || 0}
                    </span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleAddTicket(ticket)}
                                            disabled={ticket.count < 1 || isEventInPast}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="total-section">
                                <p>
                                    <span className="total-label">Total Tickets:</span>
                                    <span className="total-value">{totalTickets}</span>
                                </p>
                                <p>
                                    <span className="total-label">Total Price:</span>
                                    <span className="total-value">${totalPrice}</span>
                                </p>
                                <Button
                                    onClick={handleCheckout}
                                    disabled={totalTickets === 0 || isEventInPast}
                                    style={{ width: "100px" }}
                                >
                                    Checkout
                                </Button>
                                {isEventInPast && (
                                    <p className="event-message">
                                        This event has already happened. Tickets can no longer be purchased or attended.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
