import React, { useState, useEffect } from 'react';
import './MyEvents.css';
import Navbar from "../components/Navbar.jsx"; // Add necessary styles here
import mockEvents from "../mockEvents.jsx";
import draftEvents from "../mockEvents.jsx";
import EventCard from "./EventCard.jsx";



const MyEvents = () => {
    const [activeEvents, setActiveEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [currentTab, setCurrentTab] = useState('active'); // To handle tab switching


    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            console.log('User ID:', parsedUser.user.userId);

            const userEvents = mockEvents.filter(event => event.userId === parsedUser.user.userId);


            // Categorize events into active, draft, and past
            const now = new Date();
            const past = userEvents.filter(event => new Date(event.endDate) < now);

            // Update state
            setPastEvents(past);
        }



    }, []);



    return (
        <div>
            <Navbar />
            <h1>My Events</h1>
            <div className="tab-buttons">
                <button onClick={() => setCurrentTab('active')} className={currentTab === 'active' ? 'active-tab' : ''}>Active</button>
                <button onClick={() => setCurrentTab('draft')} className={currentTab === 'draft' ? 'active-tab' : ''}>Draft</button>
                <button onClick={() => setCurrentTab('past')} className={currentTab === 'past' ? 'active-tab' : ''}>Past</button>
            </div>

            {/* Render events based on the selected tab */}
            <div className="event-list">
                {currentTab === 'active' && activeEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
                {currentTab === 'draft' && draftEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
                {currentTab === 'past' && pastEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

export default MyEvents;
