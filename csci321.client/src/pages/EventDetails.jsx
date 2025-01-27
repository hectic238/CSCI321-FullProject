import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar.jsx"; // Add necessary styles here
import { Drawer, Button } from 'antd'; // Ant Design imports
import './EventDetails.css';
import {fetchEvent, getUserIdFromToken, editEvent} from "@/components/Functions.jsx"; // Assuming you will style with this CSS file

const EventDetails = () => {
    const { eventName, eventId } = useParams(); // Extract eventName and eventId from the URL
    const [eventDetails, setEventDetails] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [attendeeCount, setAttendeeCount] = useState(0); // State for free event attendees
    const [isEventInPast, setIsEventInPast] = useState(false);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [userId, setUserId] = useState(null);

    const handleAddTicket = (ticket) => {
        if (ticket.soldOut) {
            console.log(`${ticket.name} is sold out.`);
            return; // Prevent adding if the ticket is sold out
        }
        const newSelectedTickets = [...selectedTickets];
        const ticketIndex = newSelectedTickets.findIndex(t => t.name === ticket.name);
        if (ticketIndex !== -1) {
            newSelectedTickets[ticketIndex].quantity += 1;
        } else {
            newSelectedTickets.push({ ...ticket, quantity: 1 });
        }
        setSelectedTickets(newSelectedTickets);
        setTotalTickets(prev => prev + 1);
        setTotalPrice(prev => prev + Number(ticket.price));
    };

    const handleRemoveTicket = (ticket) => {
        const newSelectedTickets = [...selectedTickets];
        const ticketIndex = newSelectedTickets.findIndex(t => t.name === ticket.name);
        if (ticketIndex !== -1 && newSelectedTickets[ticketIndex].quantity > 0) {
            newSelectedTickets[ticketIndex].quantity -= 1;
            if (newSelectedTickets[ticketIndex].quantity === 0) {
                newSelectedTickets.splice(ticketIndex, 1);
            }
            setSelectedTickets(newSelectedTickets);
            setTotalTickets(prev => prev - 1);
            setTotalPrice(prev => prev - Number(ticket.price));
        }
    };

    const navigate = useNavigate();
    
    const handleCheckout = () => {
        if (totalTickets === 0) {
            console.log("No tickets selected for checkout.");
            return; 
        }
        console.log(eventDetails);
        navigate(`/checkout/${eventId}`, { state: { selectedTickets, eventDetails } });
        
    };

    const handleAttendeeCountChange = (increment) => {
        setAttendeeCount(prev => Math.max(0, prev + increment));
    };

    const handleAttendClick = () => {
        if (!isEventInPast) {
            eventDetails.numberAttendees += attendeeCount;
            eventDetails.tickets[0].count -= attendeeCount;
            eventDetails.tickets[0].bought += attendeeCount;
            editEvent(eventDetails);
        }
    };

    useEffect(() => {

        setUserId(getUserIdFromToken());
        fetchEvent(eventId).then(event => {
            if (event) {
                setEventDetails(event);
                const now = new Date();
                const eventDateTime = new Date(`${event.startDate}T${event.startTime}`);
                setIsEventInPast(eventDateTime < now);
                document.title = event.title + " | PLANIT";
            }
        });
        
    }, [eventId]);
    

    if (!eventDetails) {
        return <p>Loading event details...</p>;
    }

    return (
        <div className="event-details-container">
            <Navbar />
            <div className="event-header">
                <img src={eventDetails.image} alt={eventDetails.title} className="event-image" />
                <div className="event-info">
                    <h1 className="event-title">{eventDetails.title}</h1>
                    <p className="event-date-time">{eventDetails.startDate} | {eventDetails.startTime} - {eventDetails.endTime}</p>
                    <p className="event-location">{eventDetails.location}</p>
                </div>
                <Button onClick={() => setIsDrawerVisible(true)}>More Info</Button>

            </div>
            
            <Drawer
                title={eventDetails.title}
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                width={350}
            >
                <h2>{eventDetails.title}</h2>
                <p>{eventDetails.startDate} | {eventDetails.startTime} - {eventDetails.endTime}</p>
                <p>{eventDetails.location}</p>
                <p>{eventDetails.additionalInfo}</p>
            </Drawer>

            <div className="event-body">
                <div className="venue-info">
                    {eventDetails.eventTicketType === 'free' ? (
                        <div className="general-admission">
                            <div>Free Event</div>

                        </div>
                    ) : (
                        <div className="venue-map">Venue Map Placeholder</div>
                    )}
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
                        <div>{eventDetails.tickets.map((ticket, index) => (
                            <div key={ticket.name} className="ticket-item">
                                <p>{ticket.name} {ticket.count < 1 ? <span style={{ color: 'red' }}>(Sold Out)</span> : null}</p>
                                <p>Price: ${ticket.price}</p>
                                <div className="ticket-quantity">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleRemoveTicket(ticket)}
                                        disabled={ticket.count < 1 || isEventInPast} // Disable if sold out or event passed
                                    >
                                        -
                                    </button>
                                    <span>{selectedTickets.find(t => t.name === ticket.name)?.quantity || 0}</span>

                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleAddTicket(ticket)}
                                        disabled={ticket.count < 1 || isEventInPast} // Disable if sold out or event passed
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                            <div className="total-section">
                                <p>Total Tickets: {totalTickets}</p>
                                <p>Total Price: ${totalPrice}</p>
                                <Button
                                    onClick={handleCheckout}
                                    disabled={totalTickets === 0 || isEventInPast} // Disable checkout if event passed
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
