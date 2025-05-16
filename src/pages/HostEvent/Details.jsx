import React, {useEffect, useState} from 'react';
import './HostEvent.css';

const Details = ({ eventDetails, onFormChange}) => {


    const [details, setDetails] = useState({
        title: eventDetails.title,
        category: eventDetails.category,
        eventType: eventDetails.eventType,
        startDate: eventDetails.startDate,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
        location: eventDetails.location,
        additionalInfo: eventDetails.additionalInfo,
        recurrenceFrequency: eventDetails.recurrenceFrequency, // Add this line
        recurrenceEndDate: eventDetails.recurrenceEndDate
    });

    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        onFormChange(details); // Update parent component with current details
    }, [details]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'eventType') {
            setIsRecurring(value === 'recurring');
        }

        setDetails({ ...details, [name]: value });
    };
    

    return (
        <div className="host-event-details">
            <h1 style={{
                textDecoration: 'underline',
                textDecorationColor: '#FF5757',
                textUnderlineOffset: '4px',
                borderBottom: '2px solid #ccc',
                paddingBottom: '0.75rem',
                marginBottom: '1.5rem',
                color: '#333',
            }}>Create a New Event</h1>

            <div className="events-grid">

                <form>
                    <div className="form-group">
                        <h2 className="heading">Event Details</h2>
                        <div className="input-container">
                            <label htmlFor="event-title">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={details.title}
                                onChange={handleInputChange}
                                placeholder="Event Title"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-container">
                            <label htmlFor="event-category">Event Category</label>
                            <select
                                name="category"
                                value={details.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Music">Music</option>
                                <option value="Art">Arts & Culture</option>
                                <option value="Food">Food & Drink</option>
                                <option value="Theatre">Theatre</option>
                                <option value="Sports">Sports & Fitness</option>
                                <option value="Business">Business & Networking</option>
                                <option value="Family">Family & Kids</option>
                                <option value="Technology">Technology</option>
                                <option value="Comedy">Comedy & Entertainment</option>
                                <option value="Art">Charity & Causes</option>
                                <option value="Education">Education & Learning</option>
                                <option value="Travel">Travel & Adventures</option>
                            </select>
                        </div>
                    </div>

                    <h2 className="heading">Date & Time</h2>

                    <div className="form-group">
                        <div className="input-container">
                            <label>Session</label>
                            <div className="date-time-wrapper">
                                <div className="date-time-headings">
                                    <span>Start Date</span>
                                    <span>Start Time</span>
                                    <span>End Time</span>
                                </div>
                                <div className="date-time-inputs">
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={details.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={details.startTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={details.endTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="heading">Location</h2>

                    <div className="form-group">
                        <div className="input-container">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={details.location}
                                onChange={handleInputChange}
                                placeholder="Location Event Takes Place"
                                required
                            />
                        </div>
                    </div>

                    <h2 className="heading">Additional Information</h2>

                    <div className="form-group">
                        <div className="input-container">
                            <label htmlFor="additional-info">Event Description</label>
                            <textarea
                                name="additionalInfo"
                                value={details.additionalInfo}
                                onChange={handleInputChange}
                                placeholder="Please include any additional information required for the event."
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Details;
