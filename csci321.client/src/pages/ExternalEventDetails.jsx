import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { Drawer, Button } from 'antd';
import Navbar from "../components/Navbar.jsx"; // Ant Design imports

const ExternalEventDetails = () => {
    const { eventId } = useParams(); // Extract eventId from the URL
    const [eventDetails, setEventDetails] = useState(null);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const navigate = useNavigate();
    
    const fetchExternalEventDetails =  async () => {
        const API_URL = `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json`;
        const API_KEY = "bGImLf75hE3oDCJaWIGTpjjH1TuizHnA";

        let params = `?apikey=${API_KEY}`;

        try {
            const response = await fetch(`${API_URL}${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            
            setEventDetails(data);
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError(err.message);
        }
    }

    const handleAttendClick = () => {
        console.log(`Added  attendees to the event.`);
        
    };
    
    
    useEffect( () => {

        fetchExternalEventDetails();

        console.log(eventDetails);
    },  []);

    if (!eventDetails) {
        // Render a loading state while waiting for data
        return <div>Loading...</div>;
    }
    
    return (
        <div className="event-details-container">
            <Navbar/>
            <div className="event-header">
                <img src={eventDetails.images[0].url} alt={eventDetails.name} className="event-image"/>
                <div className="event-info">
                    <h1 className="event-title">{eventDetails.name}</h1>
                    <p className="event-date-time">{eventDetails.dates.start.localDate} | {eventDetails.dates.start.localTime}</p>
                    <p className="event-location">{eventDetails._embedded.venues[0].address.line1}</p>
                </div>
                <Button onClick={() => setIsDrawerVisible(true)}>More Info</Button>

            </div>

            <Drawer
                title={eventDetails.name}
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                width={350}
            >
                <h2>{eventDetails.name}</h2>
                <p>{eventDetails.dates.start.localDate} | {eventDetails.dates.start.localTime}</p>
                <p>{eventDetails._embedded.venues[0].address.line1}</p>
                <p>{eventDetails.info}</p>
                <p><div
                    dangerouslySetInnerHTML={{ __html: eventDetails.description }}
                /></p>
            </Drawer>

            {/* Main Body Section */}
            <div className="event-body">
                <div className="venue-info">
                    {eventDetails.eventTicketType === 'free' ? (
                        <div className="general-admission">
                            <div>Free Event</div>

                        </div>
                    ) : (
                        <div className="venue-map">Venue Map Placeholder</div>
                    )}
                </div>

                <div className="ticket-info">

                    <div className="general-admission">
                        <div>Free Event</div>
                        <Button
                            onClick={handleAttendClick}
                            
                        >
                            Attend
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default ExternalEventDetails;