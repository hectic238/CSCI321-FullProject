import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar.jsx";

const ProfileDetails = () => {
    const [user, setUser] = useState(null);

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
            <Navbar />
            <h1>Profile Details</h1>
            <h2>Name: {user.user.name}</h2>
            <h2>Email: {user.user.email}</h2>
            {user.user.userType === 'organiser' && <h2>Company: {user.company}</h2>}
            {user.user.userType === 'attendee' && <h2>Preferences: {user.preferences}</h2>}

            <button>Edit Profile</button>
        </div>
    );
};

export default ProfileDetails;
