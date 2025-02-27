import React from "react";
import { Link } from 'react-router-dom';
import './EventPageCard.css';

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

    let isSoldOut;
    let totalTicketsLeft;
    let isLimitedSpace;
    let isFreeEvent;

    if(event.source === 'local') {
        isFreeEvent = event.eventTicketType === 'free'; 
    }
    
    if (event.tickets && event.eventTicketType !== 'free') {
        totalTicketsLeft = event.tickets.reduce((total, ticket) => {
            return total + ticket.count;
        }, 0);
        isLimitedSpace = totalTicketsLeft > 0 && totalTicketsLeft < 50;
        isSoldOut = totalTicketsLeft <= 0;
    }
    
    
    return (
        <div key={event.id} style={{"position":"relative","padding":"20px","borderRadius":"10px","boxShadow":"0 4px 8px rgba(0, 0, 0, 0.1)","width":"300px","margin":"10px"}}>

            {event.source === 'local' ? (
                <div>

                    <div style={{
                        position: "absolute",
                        top: "10px",
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
                        

                        <img src={event.image} alt={event.title} style={{"width": "250px", "height": "141px"}}/>
                        <Link to={`/event/${event.title.replace(/\s+/g, '-')}/${event.id}`}><h3>{event.title}</h3>
                        </Link>
                        <p><strong>Date:</strong> {formatDate(event.startDate)}</p>
                        <p><strong>Time:</strong> {formatTime(event.startTime) + " - " + formatTime(event.endTime)}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                    
                    </div>
                    ) : (
                    <div>
                        <div style={{
                            "position": "absolute",
                            "top": "10px",
                            "right": "10px",
                            "backgroundColor": "blue",
                            "color": "white",
                            "fontSize": "0.8rem",
                            "fontWeight": "bold",
                            "padding": "5px 10px",
                            "borderRadius": "5px"
                        }}>
                            Hosted By Ticketmaster
                        </div>
                        <div>
                            <img src={event.images[0].url} alt={event.name} style={{"width": "250px", "height": "141px"}}/>
                            <Link to={`/event/${event.id}`}><h3>{event.name}</h3></Link>
                            <p><strong>Date:</strong> {formatDate(event.dates.start.localDate)}</p>
                            <p><strong>Time:</strong> {formatTime(event.dates.start.localTime)}</p>
                            <p>
                                <strong>Location:</strong> {event._embedded.venues[0].address.line1 + ", " + event._embedded.venues[0].city.name + ", " + event._embedded.venues[0].state.stateCode}
                            </p>
                        </div>
                    </div>
                    )}

                </div>
            );
            }

            export default EventCard;
