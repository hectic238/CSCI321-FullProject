// src/pages/Login.jsx
import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom';
import './AttendeeLogin.css'; // Import CSS for the login page
import Navbar from '../components/Navbar'; // Import Navbar
import logo from '../assets/logo_slogan.png';
import {signInUser} from "../mockBackend.jsx"; // Assuming your image is in src/assets


const AttendeeLogin = () => {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const signUpButton = (userType) => {

        navigate('/signUp', { state: { userType } });
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        try {

            const loginModel = {
                Email: email,
                Password: password,
                UserType: "attendee",
            };
            const response = await fetch('http://localhost:5144/api/User/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginModel), // Ensure userType is needed
            });

            if (response.ok) {
                const data = await response.json();

                // Save token to localStorage
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
        
                navigate('/home'); // Redirect on successful login
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Invalid email or password');
            }
        } catch (err) {
            console.error("Login error:", err.response.data); // Log the error response for debugging
            setError('Invalid email or password');
        }

        // TODO: STUFF FOR WHEN BACKEND IS IN
        // const credentials = {
        //     username,
        //     password
        // };
        //
        // try {
        //     const response = await fetch('/api/login', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(credentials),
        //     });
        //
        //     if (response.ok) {
        //         const data = await response.json();
        //         localStorage.setItem('token', data.token); // Store token in localStorage
        //         localStorage.setItem('user', JSON.stringify(data.user)); // Store user info
        //
        //         // Redirect user based on their type (attendee or organizer)
        //         if (data.user.type === 'attendee') {
        //             navigate('/attendee-dashboard'); // Redirect to attendee dashboard
        //         } else if (data.user.type === 'organizer') {
        //             navigate('/organizer-dashboard'); // Redirect to organizer dashboard
        //         }
        //     } else {
        //         setError('Invalid login credentials. Please try again.');
        //     }
        // } catch (err) {
        //     setError('An error occurred. Please try again later.');
        // }
    };


    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container">
                {/* Logo and slogan */}
                <img src={logo} alt="Logo" className="logo" tabIndex="-1"/>

                <h2>Attendee Login</h2>

                {/* Input fields for username and password */}
                <form onSubmit={handleLogin} className="input-section">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        className="input-field"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        className="input-field"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Error message */}
                    {error && <p className="error">{error}</p>}

                    {/* Login button */}
                    <button type="submit" className="login-button">Login</button>
                </form>

                {/* Forgot password and sign up links */}
                <div className="options">
                    <button className="option-button">Forgot Password?</button>
                    <button className="option-button" onClick={() => signUpButton('attendee')}>Sign Up</button>
                </div>
            </div>
        </div>
    );


};



export default AttendeeLogin;
