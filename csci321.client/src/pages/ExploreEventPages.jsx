import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar.jsx";
import {fetchEventsByCategory, fetchEventSummaries} from "@/components/Functions.jsx";
import banner from "@/assets/exploreEvent.png";
import EventCard from "@/components/EventCard.jsx";
import EventPageCard from "@/components/EventPageCard.jsx";
const ExploreEventPages = () => {
    const category = useParams(); // Extract eventName and eventId from the URL
    const [events, setEvents] = useState([]);

    const [page, setPage] = useState(1);

    const fetchTicketMasterEvents = async (size = 10, page = 1) => {
        const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
        const API_KEY = "bGImLf75hE3oDCJaWIGTpjjH1TuizHnA";

        let params;
        
        if(category.categoryName === "popular") {
            params = `?dmaId=702&size=${size}&page=${page}&apikey=${API_KEY}`;
        }
        else {
            console.log(category.categoryName);
            params = `?dmaId=702&classificationName=${category.categoryName}&size=${size}&page=${page}&apikey=${API_KEY}`;
        }
        // DMAID only shows Events from NSW and ACT
        console.log(`${API_URL}${params}`);
        try {
            const response = await fetch(`${API_URL}${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);



            return data._embedded?.events;

        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError(err.message);
        }
    };

    const fetchEvent = async (type, category, page = 1, searchTerm) => {
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
            websiteEvents = await fetchEventsByCategory(category.categoryName, 5);
            modifiedWebsiteEvents = websiteEvents.map(event => ({
                ...event,
                source: 'local'  // Mark these events as 'local'
            }));
        }

        const numberWebsiteEvents = websiteEvents.length;
        const numberEventsNeeded = 5 - numberWebsiteEvents;
        console.log(numberEventsNeeded);

        const ticketmasterTickets = await fetchTicketMasterEvents(numberEventsNeeded, page);
        console.log(ticketmasterTickets + "page" + page);
        if (Array.isArray(ticketmasterTickets)) {
            modifiedTicketmasterEventsData = ticketmasterTickets.map(event => ({
                ...event,
                source: 'ticketmaster'  // Mark these events as 'ticketmaster'
            }));
            console.log("after");

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
            const popularEvents = await fetchEvent("popular","popular", 1, "");
            setEvents(popularEvents);
            
            if(category.categoryName === "music") {
                const concertsData = await fetchEvent("category",'music');
                setEvents(concertsData);
            }
            else if(category.categoryName === "theatre") {
                const theatreEventsData = await fetchEvent("category",'theatre');
                setEvents(theatreEventsData);
            }
            else if(category.categoryName === "family") {
                const familyEventsData = await fetchEvent("category",'family');
                setEvents(familyEventsData);
            }
            else if(category.categoryName === "comedy") {
                const comedyEventsData = await fetchEvent("category",'comedy');
                setEvents(comedyEventsData);
            }

            // Add more categories as needed
        } catch (error) {
            console.log(category);
            console.error('Error fetching events:', error);
        }
    };
    
    const handleViewMore = async () => {
        try {
            const nextPage = page + 1;
            setPage(nextPage);

            const newEvents = await fetchEvent("category", category, nextPage,"" );
            setEvents(prevEvents => [...prevEvents, ...newEvents]); // Append new events
        } catch (error) {
            console.error("Error loading more events:", error);
        }
    }
    
    
    useEffect( () => {

        loadEvents();

        console.log(events);

    }, [])

    return (
        <>
            <Navbar/>
            <div className="explore-events">
                {/* Photo Bar across the top */}
                <div className="photo-bar">
                    <img src={banner} alt="Event Banner" className="top-banner"/>
                </div>

                    <div className="events-section">



                        <div>
                            {events.map(event => (
                                <EventPageCard key={event.id} event={event}/>
                            ))}

                            <div>
                                <button onClick={handleViewMore}>View More</button>
                            </div>
                        </div>
                    </div>
            </div>
        </>
    )
}

export default ExploreEventPages;