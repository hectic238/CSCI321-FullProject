import Navbar from "@/components/Navbar.jsx";
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import mockEvents, {getEventById} from '../mockEvents';
import { Drawer, Button } from 'antd'; // Ant Design imports


function EventStats() {
    const { eventId } = useParams(); // Extract eventName and eventId from the URL

    const [eventDetails, setEventDetails] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await getEventById(eventId);  // Wait for the promise to resolve
                if (response.success) {
                    console.log(response.event);
                    setEventDetails(response.event);  // Set event details once the event is retrieved
                } else {
                    console.log('Event not found');
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            }
        };
    
        fetchEvent();  // Call the async function inside useEffect
    }, [eventId]);

    if (!eventDetails) {
        return <p>Loading event details...</p>;
    }

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
                
            </div>
        </div>
    );
}

export default EventStats;