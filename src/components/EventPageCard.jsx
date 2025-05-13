import React from "react";
import { Link } from 'react-router-dom';
import './EventPageCard.css';
import { useNavigate, useParams } from "react-router-dom";
import { CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';


const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Options for formatting
    const options = { day: 'numeric', month: 'long', year: 'numeric' };

    // Get formatted date
    return date.toLocaleDateString('en-GB', options);
};

const formatTime = (timeString) => {
    if (timeString === undefined) {
        return '';
    }
    const [hours, minutes] = timeString.split(':');
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    return `${formattedHours}:${minutes} ${ampm}`; // Return formatted time
};

function EventPageCard({ event }) {
    let isFreeEvent;
    const navigate = useNavigate();
    const params = useParams();

    if (event.source === 'local') {
        isFreeEvent = event.eventTicketType === 'free';
    }

    const iconStyle = {
        verticalAlign: 'middle',
        marginRight: '8px',
        color: '#FF5757'
    };

    return (
        <div key={event.eventId} className="event-page-card-large">

            {event.source === 'local' ? (
                <>
                    <div className="event-page-Card-Column-image" style={{ width: "20%" }}>
                        <img src={event.image} alt={event.title} className="event-image" />
                    </div>

                    <div className="event-page-Card-Column-details" style={{ width: "500px", marginLeft: "20px" }}>
                        <Link to={`/event/${event.title.replace(/\s+/g, '-')}/${event.eventId}`}>
                            <h3>{event.title}</h3>
                        </Link>
                        <p>
                            <CalendarToday style={iconStyle} />
                            {formatDate(event.startDate)}
                        </p>
                        <p>
                            <AccessTime style={iconStyle} />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </p>
                        <p>
                            <LocationOn style={iconStyle} />
                            {event.location}
                        </p>
                    </div>

                    <div className="event-page-Card-Column-details" style={{ width: "25%" }}>
                        <p><strong>Hosted By PLANIT</strong></p>

                        {isFreeEvent && (
                            <div className="free-event-tag">
                                <p><strong>Free Event</strong></p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="event-page-card-large-column-image" style={{ width: "20%" }}>
                        <img src={event.images[0].url} alt={event.name} className="event-image" />
                    </div>

                    <div className="event-page-Card-Column-details" style={{ width: "500px", marginLeft: "20px" }}>
                        <Link to={`/event/${event.id}`}>
                            <h3>{event.name}</h3>
                        </Link>
                        <p>
                            <CalendarToday style={iconStyle} />
                            {formatDate(event.dates.start.localDate)}
                        </p>
                        <p>
                            <AccessTime style={iconStyle} />
                            {formatTime(event.dates.start.localTime)}
                        </p>
                        <p>
                            <LocationOn style={iconStyle} />
                            {event._embedded.venues[0].address.line1}, {event._embedded.venues[0].city.name}, {event._embedded.venues[0].state.stateCode}
                        </p>
                    </div>

                    <div className="event-page-Card-Column-details" style={{ width: "25%" }}>
                        <p><strong>Hosted By Ticketmaster</strong></p>
                    </div>
                </>
            )}

        </div>
    );
}

export default EventPageCard;
