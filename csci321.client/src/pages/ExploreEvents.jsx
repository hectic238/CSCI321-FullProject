
import Navbar from '../components/Navbar';
import mockEvents from "../mockEvents.jsx";
import './ExploreEvents.css';

import banner from '../assets/exploreEvent.png'; // Assuming your image is in src/assets



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
                            <div key={event.id} className="event-card">
                                <img src={event.imageUrl} alt={event.title} className="event-image" />
                                <div className="event-details">
                                    <h3>{event.title}</h3>
                                    <p><strong>Date:</strong> {event.startDate}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. You May Be Interested In */}
                    <h2>You May Be Interested In</h2>
                    <div className="events-grid">
                        {mockEvents.slice(0, 3).map(event => ( // Adjust the slicing as necessary
                            <div key={event.id} className="event-card">
                                <img src={event.imageUrl} alt={event.title} className="event-image" />
                                <div className="event-details">
                                    <h3>{event.title}</h3>
                                    <p><strong>Date:</strong> {event.date}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Popular in Sydney */}
                    <h2>Popular in Sydney</h2>
                    <div className="events-grid">
                        {mockEvents.filter(event => event.location === "Sydney").map(event => ( // Filter for Sydney events
                            <div key={event.id} className="event-card">
                                <img src={event.imageUrl} alt={event.title} className="event-image" />
                                <div className="event-details">
                                    <h3>{event.title}</h3>
                                    <p><strong>Date:</strong> {event.date}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 4. Trending Concerts at the Moment */}
                    <h2>Trending Concerts at the Moment</h2>
                    <div className="events-grid">
                        {mockEvents.filter(event => event.category === 'music').map(event => ( // Filter for concert events
                            <div key={event.id} className="event-card">
                                <img src={event.imageUrl} alt={event.title} className="event-image" />
                                <div className="event-details">
                                    <h3>{event.title}</h3>
                                    <p><strong>Date:</strong> {event.date}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ExploreEvents;