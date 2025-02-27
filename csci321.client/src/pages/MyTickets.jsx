import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar.jsx"; // Add necessary styles here
import banner from '../assets/exploreEvent.png'; // Assuming your image is in src/assets
import './MyTickets.css';
import {getUserIdFromToken, enrichOrdersWithEventDetails} from "@/components/Functions.jsx";
import OrdersList from "@/components/OrdersList.jsx"; // Create a CSS file for styles
import {useAuth0} from "@auth0/auth0-react";

const MyTickets = () => {
    const [orders, setOrders] = useState([]);
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();



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

    useEffect(() => {
        if(isAuthenticated) {
            const fetchOrders = async () => {
                const enrichedOrders = await enrichOrdersWithEventDetails(false, await getAccessTokenSilently(), user.sub);
                setOrders(enrichedOrders || []);
            };
            fetchOrders();
        }
    }, [user]);
    
    useEffect(()=> {
        document.title = "My Tickets | PLANIT"
    })

    return (
        <div>
            <Navbar />
            <img src={banner} alt="Banner" className="banner-image" />

            <h1 className="tickets-title">Your Tickets</h1>

            <div className="tickets-container">

                {orders.length === 0 ? (
                    <div className="no-tickets">
                        <p>No current tickets to display.</p>
                        <Link to="/explore">Explore Events</Link>
                    </div>
                ) : (
                    <OrdersList orders={orders} formatDate={formatDate} formatTime={formatTime} />
                )}
            </div>
        </div>
    );
};

export default MyTickets;
