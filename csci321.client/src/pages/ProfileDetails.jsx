import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar.jsx";
import {RefreshToken} from "@/components/RefreshToken.jsx";
import './ProfileDetails.css'
import {TextField, FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import dayjs from 'dayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MuiTelInput } from 'mui-tel-input'

const ProfileDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    
    const [title, setTitle] = useState(null);
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    
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
            setUserDetails(data); // Store user details in state
        } catch (err) {
            console.error('An error occurred while fetching user details:', err);
            setError('An error occurred while fetching user details.');
        }
        
    };

    

    const [tab, setTab] = useState("profile"); // current active tab

    // Handle form change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    const handleChange = (event) => {
        setTitle(event.target.value); // Update state with the selected value
    };

    const handlePhoneChange = (value) => {
        setPhoneNumber(value);
    };

    // Toggle notifications
    const handleToggleNotifications = () => {
        setUserDetails({ ...userDetails, notifications: !userDetails.notifications });
    };

    // Form submission handler
    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log("Updated User Details: ", userDetails);
        // Make API call to save details here
    };

    // UseEffect should only run once when the component mounts, hence the empty dependency array
    useEffect(() => {
        fetchUserDetails();
        console.log("Profile details updated", userDetails);
    }, []); // Empty dependency array to run the effect once when the component mounts

    if (!userDetails) {
        return <div>Loading...</div>; // Or redirect to login if user is not found
    }

    return (
        <div>

            <Navbar />

        
        
        <div className="profile-page">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>{userDetails.name}</h2>
                </div>
                <div className="tabs">
                    <div className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
                        Profile Details
                    </div>
                    <div className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
                        Order History
                    </div>
                    <div className={`tab ${tab === "notifications" ? "active" : ""}`} onClick={() => setTab("notifications")}>
                        Notifications
                    </div>
                    <div className={`tab ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>
                        Change Password
                    </div>
                </div>
            </div>

            <div className="main-content">
                {tab === "profile" && (
                    <div className="profile-form">
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <TextField
                                    required
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    defaultValue="Email"
                                    value={userDetails.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Title</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={title}
                                    type="input"
                                    label="Title"
                                    onChange={handleChange}
                                >
                                    <MenuItem value={"Mr"}>Mr</MenuItem>
                                    <MenuItem value={"Mrs"}>Mrs</MenuItem>
                                    <MenuItem value={"Ms"}>Ms</MenuItem>
                                </Select>
                            </FormControl>

                            
                                <TextField
                                    required
                                    fullWidth
                                    label="Full Name" 
                                    type="input"
                                    defaultValue="Name"
                                    value={userDetails.name}
                                    onChange={handleInputChange}
                                />

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DateField']}>
                                    <DateField
                                        label="Date of Birth"
                                        value={dateOfBirth}
                                        type="input"
                                        onChange={(newValue) => setDateOfBirth(newValue)}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>

                            <MuiTelInput 
                                value={phoneNumber}                 
                                defaultCountry="AU" // Set a default country (optional)
                                onChange={handlePhoneChange} />
                            
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={userDetails.notifications}
                                        onChange={handleToggleNotifications}
                                    />
                                    Enable Notifications
                                </label>
                            </div>

                            <button type="submit">Save Changes</button>
                        </form>
                    </div>
                )}

                {tab === "orders" && (
                    <div className="order-history">
                        <h2>Order History</h2>
                        <p>No orders yet!</p>
                    </div>
                )}

                {tab === "notifications" && (
                    <div className="notifications">
                        <h2>Notifications</h2>
                        <p>Manage your notification preferences.</p>
                    </div>
                )}

                {tab === "password" && (
                    <div className="change-password">
                        <h2>Change Password</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={userDetails.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                />
                            </div>

                            <button type="submit">Change Password</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};


export default ProfileDetails;
