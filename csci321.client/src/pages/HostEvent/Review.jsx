import React, {useEffect, useState} from 'react';
import './Review.css';
import {getUserIdFromToken} from "@/components/Functions.jsx"; // CSS for the Review Page


const Review = ({ eventDetails}) => {

    const {
        title,
        category,
        eventType,
        startDate,
        startTime,
        endTime,
        location,
        additionalInfo,
        eventTicketType,
        tickets = [],
        image,
        recurrenceFrequency, // Only for recurring events
        recurrenceEndDate,
        id,
        userId = '',
    } = eventDetails;

    const [user, setUser] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            eventDetails.userId = getUserIdFromToken(token)
        }
    }, [eventDetails])

    return (
        <div className="review-page">

            {/* Event Title */}

            <h1>Review Event</h1>


            {/* Event Details Summary */}
            <div className="review-details-box">
                <img src={image}/>
                <h1>{title}</h1>

                <h2>Date & Time</h2>
                <p><strong>Event Type:</strong> {eventType === 'single' ? 'Single Event' : 'Recurring Event'}</p>
                <p><strong>Start Date:</strong> {startDate}</p>
                <p><strong>Start Time:</strong> {startTime}</p>
                <p><strong>End Time:</strong> {endTime}</p>

                {/* Recurring Event Details */}
                {eventType === 'recurring' && (
                    <div>
                        <p><strong>Recurring:</strong> {recurrenceFrequency}</p>
                        <p><strong>Recurrence End Date:</strong> {recurrenceEndDate}</p>
                    </div>
                )}


                <h2>Location</h2>
                <p><strong>Location:</strong> {location}</p>


                <h2>Ticket Information</h2>
                <p><strong>Event Ticket Type:</strong> {eventTicketType === 'free' ? 'Free Event' : 'Ticketed Event'}
                </p>

                {/* Only display ticket information if the event is ticketed */}
                {eventTicketType === 'ticketed' && tickets.length > 0 ? (
                    <div className="ticket-section">
                        <div className="ticket-header">
                            <div className="ticket-column">Ticket Name</div>
                            <div className="ticket-column">Price</div>
                            <div className="ticket-column">Count</div>
                        </div>
                        {tickets.map((ticket, index) => (
                            <div className="ticket-row" key={index}>
                                <div className="ticket-column">{ticket.name}</div>
                                <div className="ticket-column">${ticket.price}</div>
                                <div className="ticket-column">{ticket.count}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>{eventTicketType === 'ticketed' ? 'No tickets added.' : 'No tickets required for free events.'}</p>
                )}

                <h2>Event Description</h2>
                <p>{additionalInfo}</p>
            </div>

        </div>
    );
};

export default Review;
