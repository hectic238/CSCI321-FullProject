// src/pages/Login.jsx
import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import Navbar
import logo from '../assets/logo_slogan.png'; // Assuming your image is in src/assets
import { signInUser } from '../mockBackend'; // Import the mock backend



const OrganiserLogin = () => {

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
            const user = await signInUser(email, password, "organiser"); // Use the mock backend to sign in
            if(user) {

                localStorage.setItem('user', JSON.stringify(user)); // Store user in localStorage
                navigate('/home')
            }
            else {
                alert('Invalid credentials'); // Show error message
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

                <h2>Organiser Login</h2>

                {/* Input fields for username and password */}
                <form onSubmit={handleLogin} className="input-section">
                    <input
                        type="email"
                        placeholder="Username"
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
                    <button className="option-button" onClick={() => signUpButton('organiser')}>Sign Up</button>
                </div>
            </div>
        </div>
    );


};



export default OrganiserLogin;
