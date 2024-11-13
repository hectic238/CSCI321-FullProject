import Navbar from "@/components/Navbar.jsx";
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import mockEvents, {getEventById} from '../mockEvents';
import { Drawer, Button } from 'antd';
import {fetchEvent} from "@/components/Functions.jsx"; // Ant Design imports


function EventStats() {
    const { eventId } = useParams(); // Extract eventName and eventId from the URL

    const [eventDetails, setEventDetails] = useState(null);

    useEffect(() => {
        fetchEvent(eventId).then(event => {
            if (event) {
                setEventDetails(event);
            }
        });
    }, [eventId]);

    if (!eventDetails) {
        return <p>Loading event details...</p>;
    }

    const getTotalAttendees = () => {
        return eventDetails.numberAttendees;
    };

    const renderTicketStats = () => {
        if (eventDetails.eventTicketType === 'ticketed' && eventDetails.tickets) {
            return eventDetails.tickets.map((ticket, index) => (
                <div key={index} className="ticket-info">
                    <p><strong>Ticket Type:</strong> {ticket.name}</p>
                    <p><strong>Price:</strong> ${ticket.price}</p>
                    <p><strong>Sold:</strong> {ticket.bought}</p>
                    <p><strong>Available:</strong> {ticket.count}</p>
                </div>
            ));
        } else {
            return <p>This event is free to attend.</p>;
        }
    };
    
    

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

            </div>
            

            {/* Main Body Section */}
            <div className="event-body">
                <h2>Event Statistics</h2>
                <div className="attendee-count">
                    <p><strong>Total Attendees:</strong> {getTotalAttendees()}</p>
                </div>

                <div className="ticket-stats">
                    <h3>Ticket Sales</h3>
                    {renderTicketStats()}
                </div>
            </div>
        </div>
    );
}

export default EventStats;