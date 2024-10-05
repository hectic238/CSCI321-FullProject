import React, { useEffect, useState } from 'react';

const ProfileDetails = () => {
    const [user, setUser] = useState(null);

    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // State for editing mode
    const [validationErrors, setValidationErrors] = useState({}); // For error messages


    const fetchUserDetails = async () => {
        const token = localStorage.getItem('accessToken'); // Retrieve the JWT token
        

        try {
            const response = await fetch(`http://localhost:5144/api/User/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserDetails(data); // Store user details in state
            } else {
                console.error('Failed to fetch user details:', response.status);
                setError('Failed to fetch user details.');
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
            setError('An error occurred while fetching user details.');
        }
    }

    useEffect(() => {
        // Get user data from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) {
        return <div>Loading...</div>; // Or redirect to login if user is not found
    }

    return (
        <div className="profile-details">
            <h1>Profile Details</h1>
            <h2>Name: {user.name}</h2>
            <h2>Email: {user.email}</h2>
            {user.userType === 'organiser' && <h2>Company: {user.company}</h2>}
            {user.userType === 'attendee' && <h2>Preferences: {user.preferences}</h2>}

            <button>Edit Profile</button>
        </div>
    );
};

export default ProfileDetails;
