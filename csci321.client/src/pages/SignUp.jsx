import React, { useState } from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import { signUpUser } from '../mockBackend'; // Import the mock backend
import {generateObjectId} from "@/components/Functions.jsx";
import {getURL} from "@/components/URL.jsx";

const SignUp = () => {
    const location = useLocation();
    const userType = location.state?.userType; // Get userType from the passed state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: '', // Only for organizers
        preferences: '', // Only for attendees
        userType: location.state?.userType,
        userId: generateObjectId(),
        refreshToken: '',
        refreshTokenExpiry: '2024-10-21T05:41:09.675+00:00',
        tickets: [],
    });

    const navigate = useNavigate();

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        //
        try {

            var baseUrl = getURL();
            
            const response = await fetch(`${baseUrl}/api/User/signUp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            // Check if the response is successful
        if (!response.ok) {
            // Handle errors based on the status code
            const errorData = await response.json();
            throw new Error(errorData.message || 'Sign up failed!');
        }

        // If successful, navigate to home and alert success
        await response.json(); // Optionally handle the response data if needed
        navigate('/home');
        alert("Sign up successful!");
    } catch (error) {
        alert("Sign up failed! " + error.message);
    }};


    return (
        <div className="sign-up-container">
            {/* Toggle between organizer and attendee */}
            <div>
                <h1>{userType === 'organiser' ? 'Organizer Sign Up' : 'Attendee Sign Up'}</h1>
                {/* Add your sign-up form here */}
                {/* You can use userType for form validation or customization */}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="sign-up-form">
                <label>
                    Name:
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                    />
                </label>

                <label>
                    Email:
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                    />
                </label>

                <label>
                    Password:
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                    />
                </label>

                {/* Organizer-specific field */}
                {userType === 'organiser' && (
                    <label>
                        Company Name:
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            required
                        />
                    </label>
                )}

                {/* Attendee-specific field */}
                {userType === 'attendee' && (
                    <label>
                        Preferences:
                        <textarea
                            value={formData.preferences}
                            onChange={(e) => handleInputChange('preferences', e.target.value)}
                        />
                    </label>
                )}

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;
