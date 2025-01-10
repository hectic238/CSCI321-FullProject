import Navbar from '../components/Navbar';
import mockEvents from "../mockEvents.jsx";
import './ExploreEvents.css';
import React, { useEffect, useState } from 'react';

import EventCard from "../components/EventCard.jsx";

import banner from '../assets/exploreEvent.png';
import {fetchEventSummaries, fetchEventsByCategory} from "../components/Functions.jsx"; // Assuming your image is in src/assets

function ExploreEvents() {
    const [popularEvents, setPopularEvents] = useState([]); 
    const [concerts, setConcerts] = useState([]); 
    const [theatreEvents, setTheatreEvents] = useState([]); 
    const [familyEvents, setFamilyEvents] = useState([]); 
    const [comedyEvents, setComedyEvents] = useState([]); 
    const [events, setEvents] = useState([]);
    const [combinedEvents, setCombinedEvents] = useState([]);

    const [error, setError] = useState([]);
    

    const fetchTicketMasterEvents = async (size = 10, category = "") => {
        const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
        const API_KEY = "bGImLf75hE3oDCJaWIGTpjjH1TuizHnA";
        // DMAID only shows Events from NSW and ACT
        const params = `?dmaId=702&size=${size}&apikey=${API_KEY}`;

        try {
            const response = await fetch(`${API_URL}${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            
            if(category = "popular") {
                setPopularEvents(prevEvents => [
                    ...prevEvents,   
                    ...data._embedded?.events         
                ]);
            }
            setEvents(data._embedded?.events || []);
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError(err.message);
        }
    };
        

        useEffect(() => {
            
            console.log(events)
            const loadEvents = async () => {
                try {
                    // Fetch general event summaries
                    const allEventsData = await fetchEventSummaries("", 5);
                    
                    // Set events from website published events and then get the rest from ticketmaster for a total of 5
                    setPopularEvents(allEventsData);
                    const numberEvents = popularEvents.length;
                    
                    const eventsNeeded = 5 - numberEvents;
                    
                    fetchTicketMasterEvents(eventsNeeded, "Popular");
                    
                    
                    const concertsData = await fetchEventsByCategory('Concert',5);
                    setConcerts(concertsData);
                    
                    const theatreEventsData = await fetchEventsByCategory('Theatre', 5);
                    setTheatreEvents(theatreEventsData);
                    
                    const familyEventsData = await fetchEventsByCategory('Family', 5);
                    setFamilyEvents(familyEventsData);
                    
                    const comedyEventsData = await fetchEventsByCategory('Comedy', 5);
                    setComedyEvents(comedyEventsData);
                    

                    // Add more categories as needed...
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            };

            loadEvents();
        }, []);

    
    
    return (
        <>

            <Navbar/>
            <div className="explore-events">
                {/* Photo Bar across the top */}
                <div className="photo-bar">
                    <img src={banner} alt="Event Banner" className="top-banner" />
                </div>

                {/* Four categories with headings and rows of events */}
                <div className="events-section">
                    {/* 1. Search by Category */}
                    <div>
                        <h2>Popular Events</h2>
                        <button onClick={() => navigate('/events/concerts')}>View More</button>
                    </div>


                    <div className="events-grid">
                        {popularEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>

                    <h2>Concerts</h2>
                    <div className="events-grid">
                        {concerts.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>

                    <h2>Family</h2>
                    <div className="events-grid">
                        {familyEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>

                    <h2>Theatre</h2>
                    <div className="events-grid">
                        {theatreEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>

                    <h2>Comedy</h2>
                    <div className="events-grid">
                        {comedyEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>


                </div>
            </div>
        </>
    )
}

export default ExploreEvents;