import Navbar from '../components/Navbar';
import mockEvents from "../mockEvents.jsx";
import './ExploreEvents.css';
import React, { useEffect, useState } from 'react';

import EventCard from "../components/EventCard.jsx";

import banner from '../assets/exploreEvent.png';
import {fetchEventSummaries, fetchEventsByCategory} from "@/components/Functions.jsx"; // Assuming your image is in src/assets

function ExploreEvents() {
        const [allEvents, setAllEvents] = useState([]); // For all events
        const [concerts, setConcerts] = useState([]); // For music events
        const [theatreEvents, setTheatreEvents] = useState([]); // For music events
        const [familyEvents, setFamilyEvents] = useState([]); // For music events
        const [comedyEvents, setComedyEvents] = useState([]); // For music events
        // Add more state variables for other categories as needed

        useEffect(() => {
            const loadEvents = async () => {
                try {
                    // Fetch general event summaries
                    const allEventsData = await fetchEventSummaries();
                    setAllEvents(allEventsData);
                    
                    const concertsData = await fetchEventsByCategory('Concert');
                    setConcerts(concertsData);
                    
                    const theatreEventsData = await fetchEventsByCategory('Theatre');
                    setTheatreEvents(theatreEventsData);
                    
                    const familyEventsData = await fetchEventsByCategory('Family');
                    setFamilyEvents(familyEventsData);
                    
                    const comedyEventsData = await fetchEventsByCategory('Comedy');
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
                    <h2>Search by Category</h2>
                    <div className="events-grid">
                        {allEvents.map(event => (
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