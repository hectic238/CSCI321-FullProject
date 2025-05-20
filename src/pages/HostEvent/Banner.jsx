import React, { useState, useEffect } from 'react';

const Banner = ({ eventDetails, onImageChange, editing}) => {
    
    let image = null;
    if(!editing) {
        image = eventDetails.image || ''; // Get the image from eventDetails

    }


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 512 * 1024; // 512KB

        // Check file type
        if (!validTypes.includes(file.type)) {
            alert("Only JPG, PNG, or GIF files are allowed.");
            return;
        }

        // Check file size
        if (file.size > maxSize) {
            alert("File size must be under 512KB.");
            return;
        }

        // Check image dimensions
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                if (img.width !== 1200 || img.height !== 400) {
                    alert("Image must be exactly 1200x400 pixels.");
                    return;
                }
                onImageChange(reader.result); // Pass valid image to parent
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };


    return (
        <div className="host-event-banner">
            <div className="host-event-headings">
                <h1 className="event-title">{eventDetails.title || "Event Title"}</h1>
                <h2 className="event-location">{eventDetails.location || "Location"}</h2>
                <h3 className="event-time">
                    {eventDetails.startDate} {eventDetails.startTime} - {eventDetails.endTime}
                </h3>
            </div>

            <div className="events-grid">
                <form>
                    <div className="form-group">
                        <div className="upload-container">
                            <div className="upload-box">
                                <div className="upload-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                                        <line x1="16" y1="5" x2="22" y2="5"></line>
                                        <line x1="19" y1="2" x2="19" y2="8"></line>
                                        <circle cx="9" cy="9" r="2"></circle>
                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                    </svg>
                                </div>
                                <label htmlFor="banner-upload" className="upload-label">
                                    Upload Banner Image
                                </label>
                                <input
                                    type="file"
                                    id="banner-upload"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-input"
                                />
                            </div>

                            <div className="image-requirements">
                                <div className="requirement">
                                    <span className="requirement-icon">📏</span>
                                    <span>1200 × 400 pixels</span>
                                </div>
                                <div className="requirement">
                                    <span className="requirement-icon">🖼️</span>
                                    <span>JPG, GIF, PNG formats</span>
                                </div>
                                <div className="requirement">
                                    <span className="requirement-icon">📦</span>
                                    <span>Max size: 512KB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {image && (
                        <div className="form-group">
                            <div className="preview-container">
                                <h3 className="preview-title">Preview:</h3>
                                <div className="image-preview">
                                    <img src={image || "/placeholder.svg"} alt="Banner Preview" />
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Banner;
