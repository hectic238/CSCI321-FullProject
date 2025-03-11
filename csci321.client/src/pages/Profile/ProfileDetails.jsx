import React, { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar.jsx";
import {RefreshToken} from "@/components/RefreshToken.jsx";
import { Link } from 'react-router-dom';

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
import dayjs from "dayjs";
import {APIWithToken} from "@/components/API.js";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import {useAuth0} from "@auth0/auth0-react";
import InterestedPage from "@/components/InterestedPage.jsx";


dayjs.extend(utc);
dayjs.extend(timezone);


const ProfileDetails = () => {
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const fetchUserDetails = async () => {
        var baseUrl = getURL();

        const token = await getAccessTokenSilently({});

        let url = `${baseUrl}/api/User/get`;

        let response =  await APIWithToken(token, url, 'Get');

        document.title = response.name + " | PLANIT";

        setUserDetails(response);
    };

    const [tab, setTab] = useState("profile");


    const handleChange = (field, value) => {
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            [field]: value,
        }));
    };

    const handleInputChange = (field, value) => {
        if (field === 'dateOfBirth') {
            // Convert value to dayjs object if it's a valid date string
            value = value ? dayjs(value) : null;
        }

        if (field === 'interests') {
            setUserDetails(prevData => ({
                ...prevData,
                interests: prevData.interests.includes(value)
                    ? prevData.interests.filter(item => item !== value)
                    : [...prevData.interests, value]
            }));
        } else {
            setUserDetails(prevData => ({
                ...prevData,
                [field]: value
            }));
        }
    };


    useEffect(() => {
        if(isAuthenticated) {
            const fetchOrders = async () => {
                const enrichedOrders = await enrichOrdersWithEventDetails(true, await getAccessTokenSilently(), user.sub);
                setOrders(enrichedOrders || []);
            }
            fetchOrders();
        };

    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const formatTime = (timeString) => {
        if(timeString === undefined){
            return '';
        }
        const [hours, minutes] = timeString.split(':');
        const formattedHours = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formattedHours}:${minutes} ${ampm}`;
    };


    const handleToggleNotifications = () => {
        setUserDetails({ ...userDetails, notifications: !userDetails.notifications });
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        var baseUrl = getURL();
        

        let url = `${baseUrl}/api/User/updateUser`;

        userDetails.dateOfBirth = dayjs(userDetails.dateOfBirth).utc();
        const sanitizedDetails = Object.fromEntries(
            Object.entries(userDetails).filter(([_, value]) => value !== null)
        );

        console.log(sanitizedDetails);

        await APIWithToken(await getAccessTokenSilently({}), url, 'Put', sanitizedDetails);
        alert("User updated successfully.");
    };

    const handlePasswordFormSubmit = async (e) => {
        e.preventDefault();

        if(newPassword !== confirmPassword) {
            setError("New Passwords do not match");
            alert("Passwords do not match");
        }

        var baseUrl = getURL();

        let url = `${baseUrl}/api/User/updateUserPassword`;

        const passwordForm = {
            userId: userDetails.userId,
            newPassword: newPassword,
            oldPassword: oldPassword,
        }

        await APIWithToken(url, 'Put', passwordForm);
        alert("User updated successfully.");
    };



    useEffect(() => {
        fetchUserDetails();
    }, []);

    if (!userDetails) {
        return <div>Loading...</div>;
    }

    return (
        isAuthenticated &&  (<div>
                <Navbar />
                <div className="profile-page">
                    <div className="sidebar">
                        <div className="sidebar-header">
                            <h2>{user.name}</h2>
                        </div>

                        <div className="tabs">
                            <div className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
                                Profile Details
                            </div>

                            <div className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
                                Order History
                            </div>
                            <div className={`tab ${tab === "notifications" ? "active" : ""}`}
                                 onClick={() => setTab("notifications")}>
                                Notifications
                            </div>
                            <div className={`tab ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>
                                Change Password
                            </div>
                            {userDetails.userType === 'attendee' && (
                                <div className={`tab ${tab === "interests" ? "active" : ""}`}
                                     onClick={() => setTab("interests")}>
                                    Interests
                                </div>
                            )}

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
                                            name="email"
                                            disabled={true}
                                            value={user.email}
                                        />
                                    </div>

                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Title</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={userDetails.title}
                                            type="input"
                                            name="title"
                                            label="Title"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
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
                                        name="name"

                                        value={userDetails.name}
                                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                                    />

                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateField']}>
                                            <DateField
                                                label="Date of Birth"
                                                value={dayjs(userDetails.dateOfBirth)}
                                                type="input"
                                                format="DD/MM/YYYY"
                                                timezone="UTC"
                                                onChange={(e) => handleChange("dateOfBirth", e)}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>

                                    <MuiTelInput
                                        value={userDetails.phoneNumber}
                                        defaultCountry="AU"
                                        onChange={(e) => handleChange("phoneNumber", e)}
                                    />

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

                        {tab === "interests" && (
                            <div className="interests">
                                <form onSubmit={handleFormSubmit}> 
                                    <InterestedPage
                                    interests={userDetails.interests}
                                    onInterestsChange={handleInputChange}
                                />
                                    <button type="submit">Save Changes</button>
                                </form>

                            </div>
                        )}

                        {tab === "password" && (
                            <div className="change-password">
                                <h2>Change Password</h2>
                                <form onSubmit={handlePasswordFormSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="oldPassword">Old Password</label>
                                        <input
                                            type="password"
                                            id="oldPassword"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newPassword">New Password</label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
        )
    );
};


export default ProfileDetails;
