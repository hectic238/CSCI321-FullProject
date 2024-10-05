import React, { useState, useEffect } from 'react';
import mockEvents from "../mockEvents.jsx";
import draftEvents from "../mockEvents.jsx";
import EventCardLarge from "../components/EventCardLarge.jsx";



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

            console.log('User ID:', parsedUser.userId);

            const userEvents = mockEvents.filter(event => event.userId === parsedUser.userId);


            // Categorize events into active, draft, and past
            const now = new Date();
            const past = userEvents.filter(event => new Date(event.endDate) < now);

            // Update state
            setPastEvents(past);
        }



    }, []);



    return (
        <div>
            <div className='events-grid'>
            <h1>My Events</h1>
                <div className="button">
                    <button onClick={() => setCurrentTab('active')} className={currentTab === 'active' ? 'active-tab' : ''}>Active</button>
                    <button onClick={() => setCurrentTab('draft')} className={currentTab === 'draft' ? 'active-tab' : ''}>Draft</button>
                    <button onClick={() => setCurrentTab('past')} className={currentTab === 'past' ? 'active-tab' : ''}>Past</button>
                </div>

                {/* Render events based on the selected tab */}
                <div className="event-list">
                {currentTab === 'active' && activeEvents.length === 0 && (
                    <p>No Active Events</p>
                )}
                {currentTab === 'active' && activeEvents.map(event => (
                    <EventCardLarge key={event.id} event={event} />
                ))}
                
                {currentTab === 'draft' && draftEvents.length === 0 && (
                    <p>No Draft Events</p>
                )}
                {currentTab === 'draft' && draftEvents.map(event => (
                    <EventCardLarge key={event.id} event={event} />
                ))}
                
                {currentTab === 'past' && pastEvents.length === 0 && (
                    <p>No Past Events</p>
                )}
                {currentTab === 'past' && pastEvents.map(event => (
                    <EventCardLarge key={event.id} event={event} />
                ))}
            </div>
            </div>
        </div>
    );
};

export default MyEvents;
