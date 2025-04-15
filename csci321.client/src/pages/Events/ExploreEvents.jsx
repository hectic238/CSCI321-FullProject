import Navbar from '@/components/Navbar';
import './ExploreEvents.css';
import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import EventCard from "@/components/EventCard.jsx";
import {getEventsByCategory, getEventsBySearchTerm} from "@/components/eventFunctions.jsx"; // Assuming your image is in src/assets

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

    
    const PAGE_SIZE = 5;
    const [modifiedWebsiteEvents, setModifiedWebsiteEvents] = useState([]);

    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false);


    const [ticketmasterEventsPage, setTicketmasterEventsPage] = useState(0);
    const fetchTicketMasterEvents = async (size = 10, page = 0, category = "") => {
        const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
        
        
        const API_KEY = `${import.meta.env.VITE_TICKETMASTER_KEY}`;
        
        let params;
        
        if(category === "popular") {
            params = `?dmaId=702&size=${size}&page=${page}&apikey=${API_KEY}`;
        }
        else {
            params = `?dmaId=702&classificationName=${category}&size=${size}&page=${page}&apikey=${API_KEY}`;
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
        // Fetch local events, 

        

        let websiteEvents = [];

        let newWebsiteEvents = [];

        if(!noMoreWebsiteEvents) {
            
            let data;
            
            if (type === "popular") {
                data = await getEventsBySearchTerm(" ", lastEvaluatedKey, PAGE_SIZE);
            } else if (type === "category") {
                data = await getEventsByCategory(category, lastEvaluatedKey, PAGE_SIZE);
            }

            if (data?.events?.length) {
                data.events = data.events.map(event => ({
                    ...event,
                    tickets: typeof event.tickets === "string" ? JSON.parse(event.tickets) : event.tickets
                }));
            }
            

            websiteEvents = data.events;
            
            setLastEvaluatedKey(data.lastEvaluatedKey);

            newWebsiteEvents = websiteEvents.map(event => ({
                ...event,
                source: 'local'  // Mark these events as 'local'
            }));

            setModifiedWebsiteEvents(websiteEvents.map(event => ({
                ...event,
                source: 'local'  // Mark these events as 'local'
            })));

            if(websiteEvents.length === 0) {
                setNoMoreWebsiteEvents(true)
            }
        }

        // Fetch PAGE_SIZE amount of ticketmaster events, then splice the remainder from the front of the ticketmaster array

        const numberWebsiteEvents = newWebsiteEvents.length;
        
        let ticketMasterEvents = [];

        let newTicketMasterEvents = [];

        // If the website events doesnt equal 5 then fetch ticketmasterEvents

        if(numberWebsiteEvents !== 5) {
            
            // fetch 5 ticketmaster events and store in array
            ticketMasterEvents = await fetchTicketMasterEvents(5 - numberWebsiteEvents, ticketmasterEventsPage, category);
            
            setTicketmasterEventsPage(ticketmasterEventsPage + 1);

            if (Array.isArray(ticketMasterEvents)) {

                // change ticketmasterEvents into new format with the source variable
                newTicketMasterEvents = ticketMasterEvents.map(event => ({
                    ...event,
                    source: 'ticketmaster'  // Mark these events as 'ticketmaster'
                }));

                // store these new events at the end of the allTicketMasterEvents array to get ready to splice
                
                return [...newWebsiteEvents, ...newTicketMasterEvents];

            }
        }

        return [...events, ...newWebsiteEvents];
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
                            <EventCard key={event.eventId || event.id} event={event}/>
                        ))}
                    </div>

                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Concerts</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/music')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {concerts.map(event => (
                            <EventCard key={event.eventId || event.id} event={event}/>
                        ))}
                    </div>

                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Family</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/family')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {familyEvents.map(event => (
                            <EventCard key={event.eventId || event.id} event={event}/>
                        ))}
                    </div>


                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Theatre</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/theatre')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {theatreEvents.map(event => (
                            <EventCard key={event.eventId || event.id} event={event}/>
                        ))}
                    </div>
                    
                    <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                        <h2>Comedy</h2>
                        <button style={{"width": "200px","height":"50px","backgroundColor":"red"}} onClick={() => navigate('/explore/category/comedy')}>View More</button>
                    </div>
                    <div className="events-grid">
                        {comedyEvents.map(event => (
                            <EventCard key={event.eventId || event.id} event={event}/>
                        ))}
                    </div>


                </div>
            </div>
        </>
    )
}

export default ExploreEvents;