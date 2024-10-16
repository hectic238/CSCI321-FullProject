import React, { useState, useEffect } from 'react';
import './MyEvents.css';
import Navbar from "../components/Navbar.jsx"; // Add necessary styles here
import mockEvents, {mockDraftEvents} from "../mockEvents.jsx";
import EventCardLarge from "../components/EventCardLarge.jsx";
import {getUserIdFromToken, fetchEventsByUserId, fetchDraftEventsByUserId} from "@/components/Functions.jsx";



const MyEvents = () => {
    const [activeEvents, setActiveEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [draftEvents, setDraftEvents] = useState([]);
    const [currentTab, setCurrentTab] = useState('active'); // To handle tab switching
    const [userEvents, setUserEvents] = useState([]);
    

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            
            const userId = getUserIdFromToken(token);
            fetchEventsByUserId(userId).then(events => {
                if (events && events.length > 0) {
                    setUserEvents(events);
                }
            })
            
            fetchDraftEventsByUserId(userId).then(events => {
                if (events && events.length > 0) {
                    setDraftEvents(events);
                }
            })
        }
    }, []);
    
    useEffect(() => {
        const now = new Date();
        // Split user events into active and past based on their date
        const past = userEvents.filter(event => new Date(event.startDate) < now);
        const active = userEvents.filter(event => new Date(event.startDate) >= now);

        setActiveEvents(active);
        setPastEvents(past);
    }, [userEvents]);
    
    return (
        <div>
            <Navbar />
            
            <div className='events-grid'>

                <div className="buttons">
                    <h1>My Events</h1>
                    <div className="button-grid">
                        <button onClick={() => setCurrentTab('active')}
                                className={currentTab === 'active' ? 'active-tab' : ''}>Active
                        </button>
                        <button onClick={() => setCurrentTab('past')}
                                className={currentTab === 'past' ? 'active-tab' : ''}>Past
                        </button>
                        <button onClick={() => setCurrentTab('draft')}
                                className={currentTab === 'draft' ? 'active-tab' : ''}>Draft
                        </button>

                    </div>
                </div>

                {/* Render events based on the selected tab */}
                <div className="event-list">
                    {currentTab === 'active' && activeEvents.length === 0 && (
                    <p>No Active Events</p>
                )}
                {currentTab === 'active' && activeEvents.map(event => (
                    <EventCardLarge key={event.id} event={event} isDraft={false}/>
                ))}
                
                {currentTab === 'draft' && draftEvents.length === 0 && (
                    <p>No Draft Events</p>
                )}
                {currentTab === 'draft' && draftEvents.map(event => (
                    <EventCardLarge key={event.id} event={event} isDraft={true} />
                ))}
                
                {currentTab === 'past' && pastEvents.length === 0 && (
                    <p>No Past Events</p>
                )}
                {currentTab === 'past' && pastEvents.map(event => (
                    <EventCardLarge key={event.id} event={event} isDraft={false} />
                ))}
            </div>
            </div>
        </div>
    );
};

export default MyEvents;
