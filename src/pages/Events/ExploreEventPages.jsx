import {useLocation, useParams, useSearchParams} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar.jsx";
import banner from "@/assets/exploreEvent.png";
import EventPageCard from "@/components/EventPageCard.jsx";
import {
    calculateTotalPages,
    getEventsByCategory,
    getEventsBySearchTerm,
    getTicketmasterEvents
} from "@/components/eventFunctions.jsx";

const ExploreEventPages = () => {
    const category = useParams();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [currentWebsiteEventCount, setCurrentWebsiteEventCount] = useState(5);
    const [totalPages, setTotalPages] = useState(null);
    const [page, setPage] = useState(0);
    const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
    const API_KEY = `${import.meta.env.VITE_TICKETMASTER_KEY}`;
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false);
    const [ticketMasterEventsFetched, setTicketMasterEventsFetched] = useState(null);
    const PAGE_SIZE = 5;
    const isCategory = location.pathname.includes('/explore/category/');
    const isSearch = location.pathname.includes('/explore/search');
    const [allAvailableEvents, setAllAvailableEvents] = useState([]);
    const [modifiedWebsiteEvents, setModifiedWebsiteEvents] = useState([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [noMorePages, setNoMorePages] = useState(false);
    const [searchParams] = useSearchParams();

    // build the dynamic heading text
    const displayNames = {
        popular: 'Popular Events',
        music:   'Concerts',
        theatre: 'Theatre',
        family:  'Family',
        comedy:  'Comedy',
    };
    let headingText = 'Results';
    if (isSearch) {
        const q = searchParams.get("q") || '';
        headingText = `Search: "${q}"`;
    } else if (isCategory) {
        headingText = displayNames[category.categoryName]
            || (category.categoryName.charAt(0).toUpperCase() + category.categoryName.slice(1));
    }

    const [ticketmasterEventsPage, setTicketmasterEventsPage] = useState(0);

    const fetchTicketMasterEvents = async (size = 10, page = 0) => {
        setTicketMasterEventsFetched(true);

        let params;

        if(category.categoryName === "popular") {
            params = `?dmaId=702&size=${size}&page=${page}&apikey=${API_KEY}`;
        }
        else if (isSearch) {
            params = `?dmaId=702&keyword=${searchParams.get("q")}&page=${page}&size=${size}&apikey=${API_KEY}`;
        }
        else {
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
            params = `?dmaId=702&classificationName=${category.categoryName}&size=${size}&apikey=${API_KEY}`;
        }

        const url = `${API_URL}${params}`;


        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        setTotalPages(data.page.totalPages);


    }

    const fetchEvent = async (type, category,page, searchTerm) => {
        // Fetch local events, 


        let websiteEvents = [];

        let newWebsiteEvents = [];

        if(!noMoreWebsiteEvents) {
            let data;
            if (type === "popular") {
                data = await getEventsBySearchTerm(searchTerm, lastEvaluatedKey, PAGE_SIZE);
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

        }


        const pageBody = {
            size: PAGE_SIZE,
            category: category,
            searchTerm: searchTerm,
            isSearch: isSearch
        }

        const pages = await calculateTotalPages(pageBody);

        setTotalPages(pages.totalPages)

        //await calculateTotalPage(PAGE_SIZE, searchTerm);


        // Fetch PAGE_SIZE amount of ticketmaster events, then splice the remainder from the front of the ticketmaster array

        const numberWebsiteEvents = newWebsiteEvents.length;

        let ticketMasterEvents = [];

        let newTicketMasterEvents = [];

        // If the website events doesnt equal 5 then fetch ticketmasterEvents

        if(numberWebsiteEvents !== 5) {

            setNoMoreWebsiteEvents(true)
            // fetch 5 ticketmaster events and store in array

            const body = {
                size: 5,
                page: ticketmasterEventsPage,
                category: category,
                searchTerm: searchTerm,
                isSearch: isSearch
            }

            const ticketData = await getTicketmasterEvents(body);

            if(ticketData) {
                setTicketMasterEventsFetched(true);
            }

            setTotalPages(ticketData.page.totalPages - 1);
            ticketMasterEvents = ticketData._embedded?.events;

            //ticketMasterEvents = await fetchTicketMasterEvents(5, ticketmasterEventsPage);

            setTicketmasterEventsPage(ticketmasterEventsPage + 1);

            if (Array.isArray(ticketMasterEvents)) {

                // change ticketmasterEvents into new format with the source variable
                newTicketMasterEvents = ticketMasterEvents.map(event => ({
                    ...event,
                    source: 'ticketmaster'  // Mark these events as 'ticketmaster'
                }));

                // store these new events at the end of the allTicketMasterEvents array to get ready to splice

                const availableEvents = [...allAvailableEvents, ...newTicketMasterEvents];

                // splice the availableEvents array with the neccessary amount of events to fill the page
                const ticketmasterEventsNeeded = PAGE_SIZE - numberWebsiteEvents;


                const splicedTicketmasterEvents = availableEvents.splice(0, ticketmasterEventsNeeded);

                setAllAvailableEvents(availableEvents);

                return [...newWebsiteEvents, ...splicedTicketmasterEvents];

            }
        }

        console.log(events)
        console.log(newWebsiteEvents);

        return [ ...newWebsiteEvents];
    }

    const loadEvents = async (searchTerm, category) => {
        try {

            if(isSearch) {
                const searchedEvents = await fetchEvent("popular","popular", 0,searchTerm);
                setEvents(searchedEvents);
                return;
            }

            if(category === "popular") {
                const popularEvents = await fetchEvent("popular","popular",0,  " ");
                setEvents(popularEvents);
            }

            if(category === "music") {
                const concertsData = await fetchEvent("category",'music');
                setEvents(concertsData);
            }
            else if(category === "theatre") {
                const theatreEventsData = await fetchEvent("category",'theatre');
                setEvents(theatreEventsData);
            }
            else if(category === "family") {
                const familyEventsData = await fetchEvent("category",'family');
                setEvents(familyEventsData);
            }
            else if(category === "comedy") {
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
                setNoMorePages(true);
                return;
            }


            const updatedCount = currentWebsiteEventCount + 5;
            setCurrentWebsiteEventCount(updatedCount);
            let nextPage = 0;
            if(ticketMasterEventsFetched) {
                nextPage = page + 1;
                setPage(nextPage);
            }


            try {
                if(isSearch) {
                    const searchedEvents = await fetchEvent("popular","popular", page, searchParams.get("q"));
                    console.log(searchedEvents)
                    setEvents(prevEvents => [...prevEvents, ...searchedEvents]);
                    setLoading(false);
                    return;

                }

                if(category.categoryName === "popular") {
                    const newEvents = await fetchEvent("popular", "popular", nextPage, " ", updatedCount);
                    setEvents(prevEvents => [...prevEvents, ...newEvents]);

                }

                if(category.categoryName === "music") {
                    const newEvents = await fetchEvent("category",'music', nextPage, "", updatedCount);
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

            const searchTerm = searchParams.get("q");
            //let searchTerm = category.searchTerm;
            let category2 = "";

            loadEvents(searchTerm, category2);

        }

        if(isCategory) {
            let searchTerm = "";
            let category2 = category.categoryName;

            loadEvents(searchTerm, category2);
        }

    }, [])

    return (
        <>
            <Navbar/>
            <div className="explore-events explore-event-pages">
                {/* Photo Bar across the top */}
                <div className="photo-bar">
                    <img src={banner} alt="Event Banner" className="top-banner"/>
                </div>
                <h1 className="results-title">{headingText}</h1>
                <div className="events-section" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}>
                    <div>
                        {events.map(event => (
                            <EventPageCard key={event.eventId} event={event}/>
                        ))}

                        <div style={{"margin":"10px", "justifyContent":"center","display":"flex" }}>

                            {noMorePages ? (
                                <div>
                                    No More Pages
                                </div>
                            ) : (
                                <button onClick={handleViewMore} disabled={loading || noMorePages}
                                        style={{
                                            "backgroundColor": loading ? "gray" : noMorePages ? "gray" : "red",
                                            "width": "200px"
                                        }}>
                                    {loading ? "Loading..." : "View More"}
                                </button>
                            )
                            }


                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ExploreEventPages;
