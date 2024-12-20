import React from "react";
import './EventCardLarge.css';
import {useNavigate} from "react-router-dom";
import mockEvents, {getEventById} from "@/mockEvents.jsx";
import editIcon from '../assets/editIcon.png';

function EventCardLarge({ event, isDraft }) {
    const navigate = useNavigate();
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

    let isActive = null;
    let isPast = null;
    
    
    if(!isDraft){
        isActive = new Date(event.startDate) >= new Date();
        isPast = new Date(event.startDate) < new Date();
    }

    


    const editEvent = () => {
        
        navigate('/host', { state: event });
    };

    const viewStatistics = () => {
        // Navigate to the statistics page for this event
        navigate(`/events/${event.eventId}/statistics`);
    };
    
    
    return (
        <div key={event.eventId} className="event-card-large">
            <div className="event-card-large-column-image">
                <img src={event.image} alt={event.title} className="event-image"/>
            </div>

            <div className="event-Card-Column-details">
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {formatDate(event.startDate)}</p>
                <p><strong>Time:</strong> {formatTime(event.startTime) + " - " + formatTime(event.endTime)}</p>
                <p><strong>Location:</strong> {event.location}</p>
            </div>

            <div className="event-Card-Column-buttons">
                {isActive && (
                    <div>
                        <img src={editIcon} alt={event.title} className="edit-image"/>
                        <button onClick={viewStatistics} className="edit-button">View Statistics</button>
                    </div>
                )}
                {isPast && (
                    <div>
                        <img src={editIcon} alt={event.title} className="edit-image"/>
                        <button onClick={viewStatistics} className="edit-button">View Statistics</button>
                    </div>
                )}
                {isDraft && (
                    <div>
                    <img src={editIcon} alt={event.title} className="edit-image"/>
                    <button onClick={editEvent} className="edit-button">Edit Event Details</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventCardLarge;
