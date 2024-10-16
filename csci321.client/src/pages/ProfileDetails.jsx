import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar.jsx";
import {RefreshToken} from "@/components/RefreshToken.jsx";

const ProfileDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        fetchUserDetails();  // Pass userId to fetch function
    }, []);

    const fetchUserDetails = async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            console.error('No access token found. Please log in.');
            return;
        }
        
        try {
            
            await RefreshToken();
            const response = await fetch(`https://localhost:5144/api/User/get`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // Include the token
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch user details:', response.status);
                setError('Failed to fetch user details.');
                return;
            }

            const data = await response.json(); // Only call this once
            console.log(data);
            setUserDetails(data); // Store user details in state
        } catch (err) {
            console.error('An error occurred while fetching user details:', err);
            setError('An error occurred while fetching user details.');
        }
    };

    if (!userDetails) {
        return <div>Loading...</div>; // Or redirect to login if user is not found
    }

    return (
        <div className="profile-details">
            <Navbar />
            <h1>Profile Details</h1>
            <h2>Name: {userDetails.name}</h2>
            <h2>Email: {userDetails.email}</h2>
            {userDetails.userType === 'organiser' && <h2>Company: {userDetails.company}</h2>}
            {userDetails.userType === 'attendee' && <h2>Preferences: {userDetails.preferences}</h2>}

            <button>Edit Profile</button>
        </div>
    );
};

export default ProfileDetails;
