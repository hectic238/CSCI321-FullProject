import Navbar from '../components/Navbar';
import './ExploreEvents.css';
import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from "react-router-dom";

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
    
    const navigate = useNavigate();
    const fetchTicketMasterEvents = async (size = 10, category = "") => {
        const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
        const API_KEY = "bGImLf75hE3oDCJaWIGTpjjH1TuizHnA";
        
        let params;
        
        if(category === "popular") {
            params = `?dmaId=702&size=${size}&apikey=${API_KEY}`;
        }
        else {
            params = `?dmaId=702&classificationName=${category}&size=${size}&apikey=${API_KEY}`;
        }
        // DMAID only shows Events from NSW and ACT

        try {
            const response = await fetch(`${API_URL}${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            return data._embedded?.events;
            
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError(err.message);
        }
    };
    
    const fetchEvent = async (type, category, searchTerm) => {
        let events;

        let websiteEvents;
        let modifiedWebsiteEvents;
        let modifiedTicketmasterEventsData;

        if (type === "popular") {
            websiteEvents = await fetchEventSummaries(searchTerm, 5);
            modifiedWebsiteEvents = websiteEvents.map(event => ({
                ...event,
                source: 'local'  // Mark these events as 'local'
            }));
        }
        else if (type === "category") {
            websiteEvents = await fetchEventsByCategory(category, 5);
            modifiedWebsiteEvents = websiteEvents.map(event => ({
                ...event,
                source: 'local'  // Mark these events as 'local'
            }));
        }
        
        const numberWebsiteEvents = websiteEvents.length;
        const numberEventsNeeded = 5 - numberWebsiteEvents;
        
        if(numberEventsNeeded === 0) {
            return modifiedWebsiteEvents;
        }

        const ticketmasterTickets = await fetchTicketMasterEvents(numberEventsNeeded, category);
        if (Array.isArray(ticketmasterTickets)) {
            modifiedTicketmasterEventsData = ticketmasterTickets.map(event => ({
                ...event,
                source: 'ticketmaster'  // Mark these events as 'ticketmaster'
            }));

            events = [
                ...modifiedWebsiteEvents, // Local events first
                ...modifiedTicketmasterEventsData, // Ticketmaster events next
            ];
            return events;

        }else {
            console.error('Ticketmaster events data is not an array:', ticketmasterTickets);
        }
    }
    const loadEvents = async () => {
        try {
            const popularEvents = await fetchEvent("popular","popular", "");
            setPopularEvents(popularEvents);

            const concertsData = await fetchEvent("category",'music');
            setConcerts(concertsData);

            const theatreEventsData = await fetchEvent("category",'theatre');
            setTheatreEvents(theatreEventsData);

            const familyEventsData = await fetchEvent("category",'family');
            setFamilyEvents(familyEventsData);

            const comedyEventsData = await fetchEvent("category",'comedy');
            setComedyEvents(comedyEventsData);


            // Add more categories as needed
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

        useEffect(() => {
            document.title = "Explore Events | PLANIT";

            loadEvents();
        }, []);

    
    
    return (
        <>

            <Navbar/>
            <div className="explore-events">
                
                <div className="events-section">
                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Popular Events</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/popular')}>View More</button>
                    </div>


                    <div className="events-grid">
                        {popularEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>

                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Concerts</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/music')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {concerts.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>

                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Family</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/family')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {familyEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>


                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Theatre</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/theatre')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {theatreEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>
                    
                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Comedy</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/comedy')}>View More</button>
                    </div>
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