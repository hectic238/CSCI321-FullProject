import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Drawer, Button } from 'antd'; 
import './EventDetails.css';
import {getCookie} from "@/components/Cookie.jsx";
import {getEvent, updateEvent} from "@/components/eventFunctions.jsx";
import {useAuth} from "react-oidc-context";
import {createOrder} from "@/components/orderFunctions.jsx";
import {generateObjectId} from "@/components/Functions.jsx";

const EventDetails = () => {
    const { eventName, eventId } = useParams(); 
    const [eventDetails, setEventDetails] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [attendeeCount, setAttendeeCount] = useState(0); 
    const [isEventInPast, setIsEventInPast] = useState(false);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    
    const auth = useAuth();
    
    

    const handleAddTicket = (ticket) => {
        if (ticket.soldOut) {
            console.log(`${ticket.name} is sold out.`);
            return; 
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
    
    const handleCheckout =  async () => {
        
        // If user isnt logged in, force them to the login page
        if(!auth.isAuthenticated) {
            alert("User is not logged in, and will not go to checkout -- PLEASE ADD STYLING")
        }
        // If the user is not an attendee, alert user is on the wrong account
        if(getCookie("userType") !== "attendee") {
            alert("User type not allowed or user is not logged in -- PLEASE ADD STYLING");
            return;
        }
        if (totalTickets === 0) {
            alert("No tickets selected for checkout.");
            return;
        }
        navigate(`/checkout/${eventId}`, { state: { selectedTickets, eventDetails } });
        
    };

    const handleAttendClick = async () => {
        if (!isEventInPast) {
            eventDetails.numberAttendees += totalTickets;
            eventDetails.tickets[0].count -= totalTickets;
            eventDetails.tickets[0].bought += totalTickets;
            const data = await updateEvent(eventDetails);
            
            
            const body = {
                orderId: generateObjectId(),
                eventId: eventDetails.eventId,
                totalPrice: 0,
                eventDate: eventDetails.startDate,
                tickets: selectedTickets,
            }
            
            console.log(body);

            const orderData = await createOrder(body);
            if(orderData) {
                window.location.href = '/';           
            }
        }
    };

    useEffect(() => {

        getEvent(eventId).then(event => {
            if (event) {
                // Parse tickets array
                if (typeof event.tickets === "string") {
                    try {
                        event.tickets = JSON.parse(event.tickets);
                    } catch (err) {
                        console.error("Failed to parse tickets:", err);
                        event.tickets = []; 
                    }
                }
                
                setEventDetails(event);
                console.log(event);
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
            <div className="event-header">
                <img src={eventDetails.image} alt={eventDetails.title} className="event-image" />
                <div className="event-info">
                    <h1 className="event-title">{eventDetails.title}</h1>
                    <p className="event-date-time">{eventDetails.startDate} | {eventDetails.startTime} - {eventDetails.endTime}</p>
                    <p className="event-location">{eventDetails.location}</p>
                </div>
                <Button onClick={() => setIsDrawerVisible(true)} style={{width: "100px"}}>More Info</Button>

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
                        <div>{eventDetails.tickets.map((ticket, index) => (
                            <div key={ticket.name} className="ticket-item">
                                <p>{ticket.name} {ticket.count < 1 ?
                                    <span style={{color: 'red'}}>(Sold Out)</span> : null}</p>
                                <div className="ticket-quantity">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleRemoveTicket(ticket)}
                                        disabled={ticket.count < 1 || isEventInPast}
                                    >
                                        -
                                    </button>
                                    <span>{selectedTickets.find(t => t.name === ticket.name)?.quantity || 0}</span>

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
                                <p>Total Tickets: {totalTickets}</p>
                                <Button
                                    onClick={handleAttendClick}
                                    disabled={totalTickets === 0 || isEventInPast || !auth.isAuthenticated}
                                    style={{width: "100px"}}
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
                    ) : (
                        <div>{eventDetails.tickets.map((ticket, index) => (
                            <div key={ticket.name} className="ticket-item">
                                <p>{ticket.name} {ticket.count < 1 ?
                                    <span style={{color: 'red'}}>(Sold Out)</span> : null}</p>
                                <p>Price: ${ticket.price}</p>
                                <div className="ticket-quantity">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleRemoveTicket(ticket)}
                                        disabled={ticket.count < 1 || isEventInPast}
                                    >
                                        -
                                    </button>
                                    <span>{selectedTickets.find(t => t.name === ticket.name)?.quantity || 0}</span>

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
                                <p>Total Tickets: {totalTickets}</p>
                                <p>Total Price: ${totalPrice}</p>
                                <Button
                                    onClick={handleCheckout}
                                    disabled={totalTickets === 0 || isEventInPast}
                                    style={{width: "100px"}}
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
