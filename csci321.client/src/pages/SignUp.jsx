import React, { useState } from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {generateObjectId} from "@/components/Functions.jsx";
import {getURL} from "@/components/URL.jsx";
import {TextField, FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import dayjs from 'dayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MuiTelInput } from 'mui-tel-input'


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
        refreshTokenExpiry: '',
        tickets: [],
        title: '',
        phoneNumber: '',
        dateOfBirth: ''
    });

    const navigate = useNavigate();

    // Handle input changes
    const handleInputChange = (field, value) => {
        if (field === 'dateOfBirth') {
            // Convert value to dayjs object if it's a valid date string
            value = value ? dayjs(value) : null;
        }
        
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
                
                <TextField
                    required
                    fullWidth
                    label="Full Name"
                    type="input"
                    defaultValue="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                />

                <div className="form-group">
                    <TextField
                        required
                        fullWidth
                        label="Email Address"
                        type="email"
                        defaultValue="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                </div>

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

                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Title</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={formData.title}
                        type="input"
                        label="Title"
                        onChange={(e) => handleInputChange('title', e.target.value)}
                    >
                        <MenuItem value={"Mr"}>Mr</MenuItem>
                        <MenuItem value={"Mrs"}>Mrs</MenuItem>
                        <MenuItem value={"Ms"}>Ms</MenuItem>
                    </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateField']}>
                        <DateField
                            label="Date of Birth"
                            value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                            onChange={(newValue) => handleInputChange('dateOfBirth', newValue)}
                        />
                    </DemoContainer>
                </LocalizationProvider>

                <MuiTelInput
                    value={formData.phoneNumber}  // Ensure the value is in correct format
                    defaultCountry="AU"  // Set a default country if needed
                    onChange={(value) => handleInputChange('phoneNumber', value)}  // Use the value directly, not event.target.value
                />


                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;
