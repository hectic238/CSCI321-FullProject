import Header from "../components/Header";
import Navbar from "../components/Navbar";
import React, { useState, useEffect } from 'react';
import './AboutUs.css'
import { generateObjectId } from "@/components/Functions.jsx";

const AboutUs = () => {
    return (
        <>
            <Header />
            <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>About Us</h1>
            <p>Welcome to <strong>PlanIt</strong>, your go-to platform for managing and discovering exciting events!</p>
            <p>
                At PlanIt, our mission is to provide an easy-to-use and powerful event management platform
                that brings people together through memorable experiences. Whether you're an event organizer or
                a passionate attendee, we strive to offer a seamless, user-friendly interface that makes
                event planning and participation effortless.
            </p>
            <p>
                We believe in the power of community and connections, and we're committed to supporting event organizers
                by providing them with the tools they need to host successful and engaging events.
            </p>
            <p>
                Our platform allows users to browse events, get the latest updates, and buy tickets for a variety of
                events from concerts to conferences. We're here to make sure you never miss out on something amazing happening in your city.
            </p>
            <h2>Our Values</h2>
            <ul style={{ textAlign: "left", margin: "0 auto", width: "50%" }}>
                <li><strong>Innovation:</strong> We continuously innovate to improve the event experience.</li>
                <li><strong>Community:</strong> Building strong connections through events is at the core of our platform.</li>
                <li><strong>Support:</strong> We support event organizers with tools and resources to make their events successful.</li>
                <li><strong>Engagement:</strong> We focus on creating engaging, enjoyable experiences for every user.</li>
            </ul>
            <p>Thank you for choosing PlanIt to discover and manage your events. We’re excited to be part of your journey!</p>
            </div>
        </>
    );
};

export default AboutUs;