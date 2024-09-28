import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar.jsx"; // Add necessary styles here
import banner from '../assets/exploreEvent.png'; // Assuming your image is in src/assets
import './MyTickets.css';
import mockEvents from "../mockEvents.jsx"; // Create a CSS file for styles

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        // Fetch user tickets from localStorage or a mock backend
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Assuming you have a mockEvents file to fetch tickets for the user
            const userTickets = mockEvents.filter(event => event.userId === parsedUser.user.userId);
            setTickets(userTickets);
        }
    }, []);

    return (
        <div>
            <Navbar />
            <img src={banner} alt="Banner" className="banner-image" />

            <h1 className="tickets-title">Your Tickets</h1>

            <div className="tickets-container">
                {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <div className="ticket-row" key={ticket.id}>
                            <div className="ticket-image">
                                <img src={ticket.image} alt={ticket.name} />
                            </div>
                            <div className="ticket-details">
                                <div className="ticket-name">{ticket.name}</div>
                                <div className="ticket-time">{ticket.startTime}</div>
                                <div className="ticket-date">{ticket.date}</div>
                                <div className="ticket-location">{ticket.location}</div>
                            </div>
                            <div className="ticket-actions">
                                <button>Download Info</button>
                                <button>Add to Apple Wallet</button>
                                <button>Add to Google Wallet</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-tickets">
                        <p>No current events.</p>
                        <Link to="/explore">Explore Events</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
