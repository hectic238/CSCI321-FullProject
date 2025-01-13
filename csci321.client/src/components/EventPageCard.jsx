import React from "react";
import { Link } from 'react-router-dom';
import './EventPageCard.css';
import {useNavigate, useParams} from "react-router-dom";

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
function EventPageCard({ event }) {

    let isSoldOut;
    let totalTicketsLeft;
    let isLimitedSpace;
    let isFreeEvent;
    const navigate = useNavigate();

    if(event.source === 'local') {
        isFreeEvent = event.eventTicketType === 'free';
    }

    return (
        <div key={event.id} className="event-page-card-large">

            {event.source === 'local' ? (
                <div className="event-page-card-large">
                    <div className="event-page-Card-Column-image">
                        <img src={event.image} alt={event.title} className="event-image"/>
                    </div>
                    <div className="event-page-Card-Column-details">
                        <Link to={`/${event.title.replace(/\s+/g, '-')}/${event.id}`}><h3>{event.title}</h3></Link>
                        <p><strong>Date:</strong> {formatDate(event.startDate)}</p>
                        <p><strong>Time:</strong> {formatTime(event.startTime) + " - " + formatTime(event.endTime)}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                    </div>
                    <div className="event-page-Card-Column-details">

                        <p><strong>Hosted By PLANIT</strong></p>

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
            ) : (
                <div className="event-page-card-large">
                        <div className="event-page-card-large-column-image">
                            <img src={event.images[0].url} alt={event.name} className="event-image"/>

                        </div>

                        <div className="event-page-Card-Column-details">
                            <Link to={`/${event.id}`}><h3>{event.name}</h3></Link>
                            <p><strong>Date:</strong> {formatDate(event.dates.start.localDate)}</p>
                            <p><strong>Time:</strong> {formatTime(event.dates.start.localTime)}</p>
                            <p>
                                <strong>Location:</strong> {event._embedded.venues[0].address.line1 + ", " + event._embedded.venues[0].city.name + ", " + event._embedded.venues[0].state.stateCode}
                            </p>


                        </div>
                        <div className="event-page-Card-Column-details">
                            <p><strong>Hosted By Ticketmaster</strong></p>
                        </div>
                    </div>
                    )}

                </div>
            );
            }

            export default EventPageCard;
