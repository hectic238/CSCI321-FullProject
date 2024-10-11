import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar.jsx";

const ProfileDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        fetchUserDetails();  // Pass userId to fetch function
    }, []);

    const fetchUserDetails = async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('No access token found. Please log in.');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5144/api/User/get`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserDetails(data); // Store user details in state
            } else if (response.status === 401) {
                console.error('Unauthorized: Invalid or expired token.');
                setError('Session expired. Please log in again.');
                // Handle token expiration: Redirect to login or clear local storage
            } else {
                console.error('Failed to fetch user details:', response.status);
                setError('Failed to fetch user details.');
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
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
