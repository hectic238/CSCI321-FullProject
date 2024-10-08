import React from "react";
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Options for formatting
    const options = { day: 'numeric', month: 'long', year: 'numeric' };

    // Get formatted date
    return date.toLocaleDateString('en-GB', options);
};

const formatTime = (timeString) => {
    if(timeString === undefined){
        return '';
    }
    const [hours, minutes] = timeString.split(':');
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    return `${formattedHours}:${minutes} ${ampm}`; // Return formatted time
};
function EventCard({ event }) {

    const isSoldOut = event.eventTicketType === 'ticketed' && event.tickets.every(ticket => parseInt(ticket.count) === 0);

    // Calculate total tickets left
    const totalTicketsLeft = event.tickets?.length
        ? event.tickets.reduce((total, ticket) => total + parseInt(ticket.count, 10), 0)
        : 0;
    // Check if total tickets left is less than 100
    const isLimitedSpace = event.eventTicketType === 'ticketed' && totalTicketsLeft > 0 && totalTicketsLeft < 100;
    const isFreeEvent = event.eventTicketType === 'free'; // Check if it's a free event


    return (
        <div key={event.id} className="event-card">

            <div className="event-Card-Column-details">
            <img src={event.image} alt={event.title} className="event-image"/>
                <Link to={`/${event.title.replace(/\s+/g, '-')}/${event.id}`}><h3>{event.title}</h3></Link>
                <p><strong>Date:</strong> {formatDate(event.startDate)}</p>
                <p><strong>Time:</strong> {formatTime(event.startTime) + " - " + formatTime(event.endTime)}</p>
                <p><strong>Location:</strong> {event.location}</p>


                {isFreeEvent && (
                    <div className="free-event-tag">
                        <p><strong>Free Event</strong></p>
                    </div>
                )}
                
                
                {isSoldOut && (
                    <div className="sold-out-tag">
                        <p><strong>SOLD OUT</strong></p>
                    </div>
                )}

                {/* Conditionally render "Limited Spaces Left" tag if total tickets left is less than 100 */}
                {isLimitedSpace && (
                    <div className="limited-space-tag">
                        <p><strong>Limited Spaces Left!</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventCard;
