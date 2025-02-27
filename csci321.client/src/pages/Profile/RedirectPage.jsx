import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import {getURL} from "@/components/URL.jsx";
import {TextField, FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import dayjs from 'dayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MuiTelInput } from 'mui-tel-input'
import {setCookie} from "@/components/Cookie.jsx";
const RedirectPage = () => {
    const [token, setToken] = useState(null);
    const [userType, setUserType] = useState('');
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState("");
    const [state, setState] = useState("");


    const [formData, setFormData] = useState({
        name: '',
        company: '', 
        preferences: '', 
        userType: '',
        userId: '',
        refreshToken: '',
        //refreshTokenExpiry: '',
        tickets: [],
        title: '',
        phoneNumber: '',
        dateOfBirth: ''
    });

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

    useEffect(() => {
        
        const urlParams = new URLSearchParams(window.location.search);
        const sessionToken = urlParams.get('session_token');
        setState(urlParams.get('state'));
        if (sessionToken) {
            setAccessToken(sessionToken);
            
            try {
                const decodedToken = jwtDecode(sessionToken);
                setToken(decodedToken);
            } catch (error) {
                console.error("Token decoding failed:", error);
            }
        }
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //
        try {

            

            var baseUrl = getURL();

            formData.userId = token.sub;

            console.log(formData);
            
            setCookie("userType",formData.userType);

            const response = await fetch(`${baseUrl}/api/User/signUp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sign up failed!');
            }

            const continueURL = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/continue?state=${state}&userType=${formData.userType}`;
            console.log(continueURL);
            window.location.href = continueURL;
            await response.json(); 
            alert("Sign up successful!");
        } catch (error) {
            alert("Sign up failed! " + error.message);
        }};

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Welcome, {token.name}</h2>
            <p>We just need a bit more information before you're all set! <br/> Please enter information in the spaces below.</p>

            <form onSubmit={handleSubmit}>
                <label>
                    User Type:
                    <select
                        value={formData.userType}
                        onChange={(e) => handleInputChange("userType",e.target.value)}
                        required
                    >
                        <option value="" disabled>Select an option</option>
                        <option value="attendee">Attendee</option>
                        <option value="organiser">Organiser</option>
                    </select>
                </label>

                <TextField
                    required
                    fullWidth
                    label="Full Name"
                    type="input"
                    defaultValue="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                />

                {/* Organizer-specific field */}
                {formData.userType === 'organiser' && (
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
                {formData.userType === 'attendee' && (
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
                    <DemoContainer components={['DateField']} >
                        <DateField
                            label="Date of Birth"
                            style={{height: "50px"}}
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
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default RedirectPage;
