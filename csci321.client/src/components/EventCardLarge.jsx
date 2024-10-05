import React from "react";
import './EventCardLarge.css';
import {useNavigate} from "react-router-dom";
import mockEvents, {getEventById} from "@/mockEvents.jsx";
import editIcon from '../assets/editIcon.png';

function EventCardLarge({ event }) {
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

    const editEvent = () => {
        
        navigate('/host', { state: event });
    };
    
    
    return (
        <div key={event.id} className="event-card-large">
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
                <img src={editIcon} alt={event.title} className="edit-image"/>
                <button onClick={editEvent} className="edit-button">Edit Event Details</button>
            </div>
        </div>
    );
}

export default EventCardLarge;
