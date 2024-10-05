import React, { useState } from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import { signUpUser } from '../mockBackend'; // Import the mock backend
import Register from '../components/register.jsx'

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
        userId: "3b8ec461c8d8753c60a166ff",
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

        const loginModel = {
            Email: formData.email,
            Password: formData.password,
            UserType: userType,
        };


        try {
            const response = await fetch('http://localhost:5144/api/User', {
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
        <Register />
    );
};

export default SignUp;
