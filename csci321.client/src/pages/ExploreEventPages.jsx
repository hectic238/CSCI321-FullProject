import {useLocation, useParams} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar.jsx";
import {fetchEventsByCategory, fetchEventSummaries} from "@/components/Functions.jsx";
import banner from "@/assets/exploreEvent.png";
import EventPageCard from "@/components/EventPageCard.jsx";

const ExploreEventPages = () => {
    const category = useParams();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [currentWebsiteEventCount, setCurrentWebsiteEventCount] = useState(5);
    const [totalPages, setTotalPages] = useState(null);
    const [totalElements, setTotalElements] = useState( null);
    const [page, setPage] = useState(0);
    const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
    const API_KEY = "bGImLf75hE3oDCJaWIGTpjjH1TuizHnA";
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false);
    const [ticketMasterEventsFetched, setTicketMasterEventsFetched] = useState(null);
    const PAGE_SIZE = 5;
    const isCategory = location.pathname.includes('/explore/category/');
    const isSearch = location.pathname.includes('/explore/search/');
    const [allAvailableEvents, setAllAvailableEvents] = useState([]);
    const [modifiedWebsiteEvents, setModifiedWebsiteEvents] = useState([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [ticketmasterEvents, setTicketmasterEvents] = useState([]);
    const [storedTicketmasterEvents, setStoredTicketmasterEvents] = useState([]);
    
    let noMoreLocalEvents = false;
    
    
    const fetchTicketMasterEvents = async (size = 10, page = 0) => {
        setTicketMasterEventsFetched(true);

        let params;
        
        if(category.categoryName === "popular") {
            params = `?dmaId=702&size=${size}&page=${page}&apikey=${API_KEY}`;
        }
        else if (isSearch) {
            params = `?dmaId=702&keyword=${category.searchTerm}&page=${page}&size=${size}&apikey=${API_KEY}`;
        }
        else {
            console.log(category.categoryName);
            params = `?dmaId=702&classificationName=${category.categoryName}&size=${size}&page=${page}&apikey=${API_KEY}`;
        }
        
        const url = `${API_URL}${params}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            // Setting minus 1 as the last page returns nothing
            setTotalPages(data.page.totalPages - 1);
            return data._embedded?.events;

        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError(err.message);
        }
    };
    
    
    const calculateTotalPage = async (size, searchTerm) => {
        let params;

        if(category.categoryName === "popular") {
            params = `?dmaId=702&size=${size}&apikey=${API_KEY}`;
        }
        else if (isSearch) {
            params = `?dmaId=702&keyword=${searchTerm}&size=${size}&apikey=${API_KEY}`;
        }
        else {
            console.log(category.categoryName);
            params = `?dmaId=702&classificationName=${category.categoryName}&size=${size}&apikey=${API_KEY}`;
        }

        const url = `${API_URL}${params}`;
        
        console.log(url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        console.log(data)
        setTotalPages(data.page.totalPages);
        

    }
    
    useEffect(() => {
        
        if(modifiedWebsiteEvents.length > 0) {
            // Splice the allavailableevents array based on the first (PAGE_SIZE - numberWebsiteEvents) events leaving the extra items inside that array
            const splicedTicketMasterEvents = allAvailableEvents.splice(0, PAGE_SIZE - modifiedWebsiteEvents.length);
            console.log(splicedTicketMasterEvents);
            console.log(modifiedWebsiteEvents)
            console.log(allAvailableEvents)
            console.log(events);
            setEvents((prevEvents) => [
                
                ...modifiedWebsiteEvents, // Local events first
                ...splicedTicketMasterEvents, // Ticketmaster events next
            ]);
        }
    }, [allAvailableEvents, modifiedWebsiteEvents])
    
    const fetchEvent = async (type, category, searchTerm) => {
        // Fetch local events, 
        
        await calculateTotalPage(PAGE_SIZE, searchTerm);
        
        let websiteEvents = [];
        
        let newWebsiteEvents = [];
        
        if(!noMoreWebsiteEvents) {
            console.log("Fetching Events " + noMoreWebsiteEvents);
            let data;
            if (type === "popular") {
                data = await fetchEventSummaries(searchTerm, PAGE_SIZE, lastEvaluatedKey);
            } else if (type === "category") {
                data = await fetchEventsByCategory(category, PAGE_SIZE, lastEvaluatedKey);
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

        return newWebsiteEvents;
    }

    const fetchEvent2 = async (type, category, page = 0, searchTerm, websiteEventCount = 5) => {
        
        await calculateTotalPage(PAGE_SIZE, searchTerm);
        let websiteEvents = [];
        
        
        if(!noMoreLocalEvents) {
            

            let data;
            if (type === "popular") {
                data = await fetchEventSummaries(searchTerm, PAGE_SIZE, lastEvaluatedKey);
            } else if (type === "category") {
                data = await fetchEventsByCategory(category, PAGE_SIZE, lastEvaluatedKey);
            }

            websiteEvents = data.events;

            setLastEvaluatedKey(data.lastEvaluatedKey);

            setModifiedWebsiteEvents(websiteEvents.map(event => ({
                ...event,
                source: 'local'  // Mark these events as 'local'
            })));
        }
        
        const numberWebsiteEvents = websiteEvents.length;
        let newTicketMasterEvents = [];
        let splicedTicketMasterEvents = [];
        
        
        console.log(numberWebsiteEvents);
        
        // If local websites doesnt equal 5, then change a variable to then skip fetching local events for the rest 
        if(numberWebsiteEvents !== 5) {
            
            noMoreLocalEvents = true;

            console.log(noMoreLocalEvents);
            
            console.log(PAGE_SIZE - numberWebsiteEvents);
            
            // Fetch next 5 events
            const ticketmasterTickets = await fetchTicketMasterEvents(5, page);
            if (Array.isArray(ticketmasterTickets)) {
                // Store all 5 new ticketmaster events inside the newTicketMasterEvents array 
                newTicketMasterEvents = ticketmasterTickets.map(event => ({
                    ...event,
                    source: 'ticketmaster'  // Mark these events as 'ticketmaster'
                }));
                
                // Store these new events into allAvailableEvents which holds the new 5 and old events
                setAllAvailableEvents((prevItems) => {
                    return [...prevItems, ...newTicketMasterEvents];
                
                });
                
                
                
                
                console.log(allAvailableEvents);
                console.log(ticketmasterTickets);
                console.log(splicedTicketMasterEvents);
                
                
                // Get all 5 new events, and store in array with either empty or prior leftover events array
                
                // Retrieve the first 5 of these events in this array and add to splicedEvents array
                
                // Then combine these new spliced events with the rest of the websites events

                // events = [
                //     ...modifiedWebsiteEvents, // Local events first
                //     ...splicedTicketMasterEvents, // Ticketmaster events next
                // ];


                // console.log(events);
                // return events;
    
            }else {
                console.error('Ticketmaster events data is not an array:', ticketmasterTickets);
            }
        
        }
        
        return modifiedWebsiteEvents;
        
        
    }

    const loadEvents = async (searchTerm, category) => {
        try {
            
            if(isSearch) {
                const searchedEvents = await fetchEvent("popular","popular", 0, searchTerm);
                console.log(searchedEvents);
                setEvents(searchedEvents);
                return;
            }
            const popularEvents = await fetchEvent("popular","popular", 0, "");
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
            
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };
    
    const handleViewMore = async () => {
        if(loading) return;
        setLoading(true);
        try {
            if(page >= totalPages) {
                console.log("No more pages");
                return;
            }
            
            
            const updatedCount = currentWebsiteEventCount + 5;
            setCurrentWebsiteEventCount(updatedCount);
            let nextPage = 0;
            if(ticketMasterEventsFetched) {
                nextPage = page + 1;
                setPage(nextPage);
            }
            
            console.log(page);

            try {
                if(isSearch) {
                    const searchedEvents = await fetchEvent("popular","popular", page, category.searchTerm);
                    
                    setEvents(prevEvents => [...prevEvents, ...searchedEvents]);
                    setLoading(false);
                    return;
                    
                }
                
                if(category.categoryName === "popular") {
                    const newEvents = await fetchEvent("popular", "popular", nextPage, "", updatedCount);
                    setEvents(prevEvents => [...prevEvents, ...newEvents]); 
                    
                }
                if(category.categoryName === "music") {
                    const newEvents = await fetchEvent("category",'music', nextPage, "", updatedCount);
                    console.log(newEvents);
                    setEvents(prevEvents => [...prevEvents, ...newEvents]); 
                }
                else if(category.categoryName === "theatre") {
                    const newEvents = await fetchEvent("category",'theatre', nextPage, "", updatedCount);
                    setEvents(prevEvents => [...prevEvents, ...newEvents]); 
                }
                else if(category.categoryName === "family") {
                    const newEvents = await fetchEvent("category",'family', nextPage, "", updatedCount);
                    setEvents(prevEvents => [...prevEvents, ...newEvents]); 
                }
                else if(category.categoryName === "comedy") {
                    const newEvents = await fetchEvent("category",'comedy', nextPage, "", updatedCount);
                    setEvents(prevEvents => [...prevEvents, ...newEvents]); 
                }

            } catch (error) {
                console.error('Error fetching events:', error);
            }

            
        } catch (error) {
            console.error("Error loading more events:", error);
        }
        setPage(page + 1);
        
        setLoading(false);
    }
    
    
    useEffect( () => {
        
        if(isSearch) {
            let searchTerm = category.searchTerm;
            let category2 = "";

            console.log("Search Term " + searchTerm + " Category " + category2);

            loadEvents(searchTerm, category2);

        }

        if(isCategory) {
            let searchTerm = "";
            let category2 = category.categoryName;

            console.log("Search Term " + searchTerm + " Category " + category2);
            loadEvents(searchTerm, category2);
        }
        
    }, [])

    return (
        <>
            <Navbar/>
            <div className="explore-events">
                {/* Photo Bar across the top */}
                <div className="photo-bar">
                    <img src={banner} alt="Event Banner" className="top-banner"/>
                </div>
                    <div className="events-section" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}>
                        <div>
                            {events.map(event => (
                                <EventPageCard key={event.id} event={event}/>
                            ))}

                            <div style={{"margin":"10px", "justifyContent":"center","display":"flex" }}>
                                <button onClick={handleViewMore} disabled={loading} style={{"backgroundColor":"red","width":"200px"}}>{loading ? "Loading..." : "View More"}</button>
                            </div>
                        </div>
                    </div>
            </div>
        </>
    )
}

export default ExploreEventPages;