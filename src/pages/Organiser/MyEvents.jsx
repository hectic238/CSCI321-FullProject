import React, { useState, useEffect } from 'react';
import './MyEvents.css';
import EventCardLarge from "../../components/EventCardLarge.jsx";
import {getUsersDraftEvents, getUsersEvents} from "@/components/eventFunctions.jsx";
import {useAuth} from "react-oidc-context";



const MyEvents = () => {
    const [activeEvents, setActiveEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [draftEvents, setDraftEvents] = useState([]);
    const [currentTab, setCurrentTab] = useState('active'); // To handle tab switching
    const [userEvents, setUserEvents] = useState([]);

    const auth = useAuth();
    

    useEffect(() => {
        
        if (auth.isAuthenticated) {
            
            getUsersEvents().then(events => {
                if (events && events.length > 0) {
                    setUserEvents(events);
                }
            })
            
            getUsersDraftEvents().then(events => {
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
                    <EventCardLarge key={event.eventId} event={event} isDraft={false}/>
                ))}
                
                {currentTab === 'draft' && draftEvents.length === 0 && (
                    <p>No Draft Events</p>
                )}
                {currentTab === 'draft' && draftEvents.map(event => (
                    <EventCardLarge key={event.eventId} event={event} isDraft={true} />
                ))}
                
                {currentTab === 'past' && pastEvents.length === 0 && (
                    <p>No Past Events</p>
                )}
                {currentTab === 'past' && pastEvents.map(event => (
                    <EventCardLarge key={event.eventId} event={event} isDraft={false} />
                ))}
            </div>
            </div>
        </div>
    );
};

export default MyEvents;
