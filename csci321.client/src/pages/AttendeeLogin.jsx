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

                console.log(data);
                // Save token to localStorage
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                const userType = "attendee";
                localStorage.setItem('userType', userType);

                navigate('/home'); // Redirect on successful login
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Invalid email or password');
            }

            // Redirect to the dashboard or other actions here
        } catch (error) {
            alert(error.message || "Sign in failed!");
        }


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
