import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar.jsx";
import {RefreshToken} from "@/components/RefreshToken.jsx";
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import './ProfileDetails.css'
import {TextField, FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import { DateField } from '@mui/x-date-pickers/DateField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MuiTelInput } from 'mui-tel-input'
import {enrichOrdersWithEventDetails} from "@/components/Functions.jsx";
import OrdersList from "@/components/OrdersList.jsx";
import {getURL} from "@/components/URL.jsx";
import {APIWithToken} from "@/components/API.js";

const ProfileDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [title, setTitle] = useState(null);
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    
    const fetchUserDetails = async () => {
        var baseUrl = getURL();

        let url = `${baseUrl}/api/User/get`;

        let response =  await APIWithToken(url, 'Get');
        
        setUserDetails(response);
    };

    
    const updateUserDetails = async () => {
        var baseUrl = getURL();

        let url = `${baseUrl}/api/User/updateUser`;

        
        
        
        const updatedDetails = {
            ...userDetails,
            dateOfBirth: userDetails.dateOfBirth
                ? dayjs(userDetails.dateOfBirth).toUTCString() // Convert to Sydney timezone
                : null, 
        };

        
        
        console.log(updatedDetails);
        
        
        let response = await APIWithToken(url, 'PUT', updatedDetails)
        
    }

    const [tab, setTab] = useState("profile"); // current active tab

    // Handle form change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    useEffect(() => {const fetchOrders = async () => {
        const enrichedOrders = await enrichOrdersWithEventDetails(true);
        setOrders(enrichedOrders || []);
    };
        fetchOrders();
    }, []);

    const handleChange = (event) => {
        const { value } = event.target; // Extract the selected value
        setUserDetails((prevDetails) => ({
            ...prevDetails, // Preserve other fields
            title: value, // Update the title
        }));
    };
    const handlePhoneChange = (value) => {
        setUserDetails((prevDetails) => ({
            ...prevDetails, // Preserve other fields
            phoneNumber: value, // Update the phone number
        }));
    };

    const handleDateChange = (newValue) => {
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            dateOfBirth: newValue, // Update the date of birth
        }));
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // Options for formatting
        const options = { day: 'numeric', month: 'long', year: 'numeric' };

        // Get formatted date
        return date.toLocaleDateString('en-GB', options);
    };

    const formatTime = (timeString) => {
        if(timeString === undefined){
            return '';
        }
        const [hours, minutes] = timeString.split(':');
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format
        const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
        return `${formattedHours}:${minutes} ${ampm}`; // Return formatted time
    };

    // Toggle notifications
    const handleToggleNotifications = () => {
        setUserDetails({ ...userDetails, notifications: !userDetails.notifications });
    };

    // Form submission handler
    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log("Updated User Details: ", userDetails);
        
        updateUserDetails()
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
                                    value={userDetails.title}
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
                                        onChange={handleDateChange}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>

                            <MuiTelInput 
                                value={userDetails.phoneNumber}                 
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
                        <div className="tickets-container">

                            {orders.length === 0 ? (
                                <div className="no-tickets">
                                    <p>No current tickets to display.</p>
                                    <Link to="/explore">Explore Events</Link>
                                </div>
                            ) : (
                                <OrdersList orders={orders} formatDate={formatDate} formatTime={formatTime}/>
                            )}
                        </div>
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
