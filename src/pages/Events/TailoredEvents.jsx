import {APIWithToken} from "@/components/API.js";
import React, {useEffect, useState} from "react";
import {useAuth} from "react-oidc-context";
import EventCard from "@/components/EventCard.jsx";
import {useNavigate} from "react-router-dom";
import {getEventsByCategory, getEventsBySearchTerm, getTicketmasterEvents} from "@/components/eventFunctions.jsx";
import background from '@/assets/background.png';

const TailoredEvents = () => {

    const [userDetails, setUserDetails] = useState(null)
    const [categories, setCategories] = useState([])
    const auth = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [ticketmasterEventsPage, setTicketmasterEventsPage] = useState(0);

    const [eventsByCategory, setEventsByCategory] = useState({});


    const PAGE_SIZE = 5;
    const [modifiedWebsiteEvents, setModifiedWebsiteEvents] = useState([]);

    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [noMoreWebsiteEvents, setNoMoreWebsiteEvents] = useState(false);


    const fetchUserDetails = async () => {
        try {
            const response = await APIWithToken( `user/fetch`, "GET")

            if(!response.ok) {
                console.error("Could not fetch the user details");
            }
            const data = await response.json()

            const {userId, ...updatedData} = data
            setUserDetails(updatedData)

            document.title = `${updatedData.name} | PLANIT`
        } catch (error) {
            setError("Failed to fetch user details")
        }
    }
    const checkCategories = async () => {
        const categories = {
            "Music": ["Concerts", "Music Festivals", "Music Workshops", "DJ Nights"],
            "Art": ["Art Exhibitions", "Cultural Festivals", "Theater Plays", "Dance Performances"],
            "Food": ["Food Festivals", "Wine Tastings", "Cooking Classes", "Beer Festivals"],
            "Sports": ["Marathons", "Yoga Sessions", "Fitness Workshops", "Sporting Events"],
            "Business": ["Conferences", "Seminars", "Workshops", "Networking Events"],
            "Family": ["Family-Friendly Events", "Children's Workshops", "Kid-Friendly Shows", "Educational Activities"],
            "Technology": ["Tech Conferences", "Hackathons", "Startup Events", "Gadget Expos"],
            "Comedy": ["Stand-up Comedy", "Improv Nights", "Comedy Festivals", "Magic Shows"],
            "Charity": ["Fundraising Events", "Charity Galas", "Benefit Concerts", "Auctions & Fundraisers"],
            "Education": ["Lectures & Talks", "Education Workshops", "Educational Seminars", "Skill-Building Sessions"],
            "Travel": ["City Tours", "Adventure Travel", "Cultural Experiences", "Cruise Vacations"]
        };

        const selectedCategories = userDetails.interests;

        const matchedKeys = new Set();

        selectedCategories.forEach(category => {
            for (const [key, values] of Object.entries(categories)) {
                if (values.includes(category)) {
                    matchedKeys.add(key);
                    break; 
                }
            }
        });

        const result = Array.from(matchedKeys);
        setCategories(result);

        for(let category in result) {
            //const response = await APIWithToken(`event/category/${category}`, "GET");
            

            
            let cat  = result[category];
            
            const data = await fetchEvent("category", cat)
            
            setEventsByCategory(prev => ({
                ...prev,
                [cat]: data
            }));
        }


    }

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
            const body = {
                size: 5- numberWebsiteEvents,
                page: ticketmasterEventsPage,
                category: category
            }
            

            const response = await getTicketmasterEvents(body);
            
            
            if(response._embedded?.events) {
                ticketMasterEvents = response._embedded.events;
                //ticketMasterEvents = await fetchTicketMasterEvents(5 - numberWebsiteEvents, ticketmasterEventsPage, category);

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

            
        }

        return [...events, ...newWebsiteEvents];
    }

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUserDetails();
        }
    }, [auth.isAuthenticated]);

    useEffect(() => {
        if (userDetails) {
            checkCategories();
        }
    }, [userDetails]);



    return (
        <div style={{
            // Set the background image for the entire component
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed', // Optional: keeps the background fixed while scrolling
            padding: '20px', // Add some padding around the content
            minHeight: '100vh', // Make sure it covers the full viewport height
            // Add a dark background color that will show if the image is transparent or doesn't load
            backgroundColor: '#121212', // Dark background color
        }}>
            {/* Keep your existing banner with its styling */}
            <h2 style={{
                // Text styling
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px',

                // Container styling
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '80%',
                margin: '40px auto 32px auto',
                padding: '20px 40px',

                // Background styling - keep the gradient background for the banner
                background: 'linear-gradient(135deg, #FF5757, #FF8F66)',

                // Effects
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                borderBottom: '4px solid #FF5757',
            }}>
                EVENTS FOR YOU
            </h2>

            {/* Changed to a dark semi-transparent container */}
            <div style={{
                backgroundColor: 'rgba(18, 18, 18, 0.85)', // Semi-transparent dark background
                borderRadius: '10px',
                padding: '20px',
                maxWidth: '90%',
                margin: '0 auto',
                color: '#ffffff', // Change text color to white for better contrast
            }}>
                {categories.length > 0 ? (
                    <ul>
                        {categories.map((category, index) => (
                            <div key={index} className="explore-events">
                                <div style={{"flexDirection": "row","display": "flex","justifyContent": "space-between","alignItems": "center","maxHeight": "75px"}}>
                                    <h2 style={{
                                        display: "inline-block",
                                        borderBottom: "3px solid #ff5757",
                                        paddingBottom: "4px",
                                        fontWeight: "bold",
                                        fontSize: "1.5rem",
                                        marginTop: "5px",
                                        color: "#ffffff" // Ensure heading is white
                                    }}>
                                        {category}
                                    </h2>
                                    <button style={{
                                        backgroundColor: "#ff5757",
                                        color: "black",
                                        padding: "0.5rem 1.5rem",
                                        borderRadius: "9999px",
                                        border: "none",
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        transition: "background-color 0.2s",
                                    }} onClick={() => navigate(`/explore/category/${category}`)}>View More</button>
                                </div>
                                <div className="events-grid">
                                    {(eventsByCategory[category] || []).map(event => (
                                        <EventCard key={event.eventId || event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: "#ffffff" }}>No categories found based on your interests.</p>
                )}
            </div>
        </div>
    );
}

export default TailoredEvents;