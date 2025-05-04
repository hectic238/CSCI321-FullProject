import Header from "../components/Header";
import Navbar from "../components/Navbar";
import React, { useState, useEffect } from 'react';
import './PrivacyPolicy.css'
import { generateObjectId } from "@/components/Functions.jsx";

const PrivacyPolicy = () => {
    return (
        <>
            <Header />
            <Navbar />
            <div className="privacy-policy-container">
                <h1>Privacy Policy</h1>
                <p>Last updated: May 4, 2025</p>

                <h2>1. Introduction</h2>
                <p>
                    We value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.
                </p>

                <h2>2. Information We Collect</h2>
                <ul>
                    <li>Personal details (e.g., name, email address, payment information)</li>
                    <li>Event participation and ticket purchase history</li>
                    <li>Usage data (e.g., device info, browser type, IP address)</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <ul>
                    <li>To process ticket purchases and send confirmations</li>
                    <li>To provide customer support and service updates</li>
                    <li>To improve user experience and platform functionality</li>
                </ul>

                <h2>4. Data Sharing</h2>
                <p>
                    We do not sell your personal data. We may share limited data with third parties like payment processors and event organizers as needed to provide services.
                </p>

                <h2>5. Data Security</h2>
                <p>
                    We implement industry-standard security measures to protect your information from unauthorized access or disclosure.
                </p>

                <h2>6. Your Rights</h2>
                <p>
                    You may access, update, or request deletion of your personal data by contacting us.
                </p>

                <h2>7. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, you can contact us at <a href="mailto:help.planitevents@outlook.com">help.planitevents@outlook.com</a></p>
            </div>
        </>
    );
};

export default PrivacyPolicy;