import React, { useState, useEffect } from 'react';
import banner from '../../assets/exploreEvent.png';



const Banner = ({ eventDetails, onImageChange,onPreviousPage, onNextPage }) => {
    const image = eventDetails.image || ''; // Get the image from eventDetails


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageChange(reader.result); // Update the parent component with the new image
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!image) {
            alert('Please select an image file');
            return;
        }

        // Handle form submission for banner image
        console.log('Image submitted:', image); // For debugging purposes
        console.log('Event Details:', eventDetails); // Check if event details are correct
        onNextPage(); // Move to ticketing page
    };

    return (
        <div className="host-event-banner">
            <img src={banner} alt="Banner" className="banner-image"/>
            <div className="host-event-headings">
                <h1 className="event-title">{eventDetails.title || "Event Title"}</h1>
                <h2 className="event-location">{eventDetails.location || "Location"}</h2>
                <h3 className="event-time">{eventDetails.startDate} {eventDetails.startTime} - {eventDetails.endTime}</h3>
            </div>
            <div className="progress-bar">
                <div className="progress" style={{width: '50%'}}></div>
            </div>

            <div className="events-grid">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-container">
                            <label htmlFor="banner-upload">Upload Banner Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {image && (
                        <div className="form-group">
                            <div className="input-container">
                                <h3>Preview:</h3>
                                <img src={image} alt="Banner Preview" style={{width: '100%', maxHeight: '200px'}}/>
                            </div>
                        </div>
                    )}

                    <p>Feature Image must be at least 1170 pixels wide by 504 pixels high.</p>
                    <p>Valid file formats: JPG, GIF, PNG.</p>

                    <div className="button-container">
                        <button type="button" className="back-button" onClick={onPreviousPage}>Back</button>
                        <button type="submit" className="continue-button">Save and Continue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Banner;
