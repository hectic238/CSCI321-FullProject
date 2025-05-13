import React from "react";
import { Link } from 'react-router-dom';
import './EventPageCard.css';
import { CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';

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
    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${ampm}`;
};

function EventCard({ event }) {
    
    let isSoldOut;
    let totalTicketsLeft;
    let isLimitedSpace;
    let isFreeEvent;
    if (event.source === 'local') {
        isFreeEvent = event.eventTicketType === 'free';
    }

    if (event.tickets && event.eventTicketType !== 'free') {
        totalTicketsLeft = event.tickets.reduce((total, ticket) => total + ticket.count, 0);
        isLimitedSpace = totalTicketsLeft > 0 && totalTicketsLeft < 50;
        isSoldOut = totalTicketsLeft <= 0;
    }

    const venue = event._embedded?.venues?.[0] || {};
    const address = venue.address?.line1 || "";
    const city = venue.city?.name || "";
    const state = venue.state?.stateCode || "";

    const iconStyle = { color: '#FF5757', verticalAlign: 'middle', marginRight: '8px' };
    const infoStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        margin: '8px 0',
        padding: 0
    };

    return (
        <div key={event.id} className="event-card">
            {event.source === 'local' ? (
                <div className="card-content" style={{ marginTop: 0 }}>
                    <img src={event.image} alt={event.title} style={{ width: "250px", height: "141px" }} />
                    <Link to={`/event/${event.title.replace(/\s+/g, '-')}/${event.eventId}`}>
                        <h3 style={{ lineHeight: 1.2, minHeight: '2.4em' }}>{event.title}</h3>
                    </Link>
                    <p style={infoStyle}>
                        <CalendarToday style={iconStyle} />
                        {formatDate(event.startDate)}
                    </p>
                    <p style={infoStyle}>
                        <AccessTime style={iconStyle} />
                        {formatTime(event.startTime) + (formatTime(event.endTime) ? ` – ${formatTime(event.endTime)}` : '')}
                    </p>
                    <p style={infoStyle}>
                        <LocationOn style={iconStyle} />
                        {event.location}
                    </p>
                    <div style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px"
                    }}>
                        {isFreeEvent &&
                            <div style={{ backgroundColor: "green", color: "white", fontSize: "0.8rem", fontWeight: "bold", padding: "5px 10px", borderRadius: "5px" }}>
                                Free Attendance
                            </div>
                        }
                        {isLimitedSpace &&
                            <div style={{ backgroundColor: "orange", color: "white", fontSize: "0.8rem", fontWeight: "bold", padding: "5px 10px", borderRadius: "5px" }}>
                                Limited Spaces Left
                            </div>
                        }
                        {isSoldOut &&
                            <div style={{ backgroundColor: "red", color: "white", fontSize: "0.8rem", fontWeight: "bold", padding: "5px 10px", borderRadius: "5px" }}>
                                Sold Out
                            </div>
                        }
                    </div>

                </div>
            ) : (
                <div className="card-content" style={{ marginTop: 0 }}>
                    <img src={event.images[0].url} alt={event.name} style={{ width: "250px", height: "141px" }} />
                    <Link to={`/event/${event.id}`}>
                        <h3 style={{ lineHeight: 1.2, minHeight: '2.4em' }}>{event.name}</h3>
                    </Link>
                    <p style={infoStyle}>
                        <CalendarToday style={iconStyle} />
                        {formatDate(event.dates.start.localDate)}
                    </p>
                    <p style={infoStyle}>
                        <AccessTime style={iconStyle} />
                        {formatTime(event.dates.start.localTime)}
                    </p>
                    <p style={infoStyle}>
                        <LocationOn style={iconStyle} />
                        {`${address}, ${city}, ${state}`}
                    </p>
                    <div style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        backgroundColor: "blue",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        padding: "5px 10px",
                        borderRadius: "5px"
                    }}>
                        Hosted By Ticketmaster
                    </div>
                </div>
            )}
        </div>
    );
}
export default EventCard;
