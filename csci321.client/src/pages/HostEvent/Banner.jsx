import React, { useState, useEffect } from 'react';

const Banner = ({ eventDetails, onImageChange}) => {
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

    return (
        <div className="host-event-banner">
            <div className="host-event-headings">
                <h1 className="event-title">{eventDetails.title || "Event Title"}</h1>
                <h2 className="event-location">{eventDetails.location || "Location"}</h2>
                <h3 className="event-time">{eventDetails.startDate} {eventDetails.startTime} - {eventDetails.endTime}</h3>
            </div>

            <div className="events-grid">
                <form>
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

                </form>
            </div>
        </div>
    );
};

export default Banner;
