import Navbar from '../components/Navbar';
import mockEvents from "../mockEvents.jsx";
import './ExploreEvents.css';

import EventCard from "../components/EventCard.jsx";

import banner from '../assets/exploreEvent.png';
import React from "react"; // Assuming your image is in src/assets

const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Options for formatting
    const options = { day: 'numeric', month: 'long', year: 'numeric' };

    // Get formatted date
    return date.toLocaleDateString('en-GB', options);
};

const formatTime = (timeString) => {
    if(timeString === undefined){
        return '';
    }
    const [hours, minutes] = timeString.split(':');
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    return `${formattedHours}:${minutes} ${ampm}`; // Return formatted time
};


function ExploreEvents() {
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
                        {mockEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>

                    {/* 2. You May Be Interested In */}
                    <h2>You May Be Interested In</h2>
                    <div className="events-grid">
                        {mockEvents.slice(0, 3).map(event => ( // Adjust the slicing as necessary
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>

                    {/* 3. Popular in Sydney */}
                    <h2>Popular in Sydney</h2>
                    <div className="events-grid">
                        {mockEvents.filter(event => event.location === "Sydney").map(event => ( // Filter for Sydney events
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>

                    {/* 4. Trending Concerts at the Moment */}
                    <h2>Trending Concerts at the Moment</h2>
                    <div className="events-grid">
                        {mockEvents.filter(event => event.category === 'music').map(event => ( // Filter for concert events
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ExploreEvents;