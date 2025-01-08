import Header from "../components/Header";
import Navbar from "../components/Navbar";
import React, { useState } from 'react';
import "./about.css";
import { getURL } from "@/components/URL.jsx";
import { APIWithToken } from "@/components/API.js"; 

function About() {
    const handleSubmit = async (e) => {
        e.preventDefault();
        let baseurl = getURL();
        let url = `${baseurl}/api/Message/submitMessage`
        let response = await APIWithToken(url, 'POST', formData);
        if (response.status === 200) {
            alert("Message Submitted")
        }

    }

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
    });

    const handleInputChange = (field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    return (
        <>
            <Header />
            <Navbar />
            <div className="contact-container">
                {/* Contact Header Section */}
                <div className="contact-header">
                    <h1>Contact us</h1>
                    <div className="contact-options">
                        <div className="option">
                            <span role="img" aria-label="email">✉️</span>
                            <h2>EMAIL</h2>
                            <p>
                                Send us an email here:<br />
                                <a href="mailto:help.planitevents@outlook.com" className="email-link">Our email</a>
                            </p>
                        </div>
                        <div className="option">
                            <span role="img" aria-label="call">📞</span>
                            <h2>CALL</h2>
                            <p>Call us here:<br />“Our business phone”</p>
                        </div>
                        <div className="option">
                            <span role="img" aria-label="chat">💬</span>
                            <h2>CHAT</h2>
                            <p>Chat with us Monday –<br />Friday 9am–5pm AEDT</p>
                        </div>
                    </div>
                </div>

                {/* Message Form Section */}
                <div className="message-section">
                    <h2>Message Us</h2>
                    <p>
                        If you have any issues or want to leave us a comment about our application,
                        please fill out this form.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <label>Name:</label>
                        <div className="input-row">
                            <div className="input-group"> 
                                <input type="text" placeholder="First" className="about-inputs" onChange={(e) => handleInputChange('firstName', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <input type="text" placeholder="Last" className="about-inputs" onChange={(e) => handleInputChange('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Email:</label>
                            <input type="email" placeholder="Enter your email" onChange={(e) => handleInputChange('email', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Message:</label>
                            <textarea onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Write your message here"></textarea>
                        </div>
                        <button type="submit" className="submit-button">Submit</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default About