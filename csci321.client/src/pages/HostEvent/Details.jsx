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
            <h1>Create a New Event</h1>

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
                                <option value="Sports">Sports</option>
                                <option value="Art">Art</option>
                                {/* Add more categories as needed */}
                            </select>
                        </div>
                    </div>

                    <h2 className="heading">Date & Time</h2>

                    <div className="form-group">
                        <div className="input-container">
                            <label>Event Type</label>
                            <div className="radio-group">
                                <input
                                    type="radio"
                                    name="eventType"
                                    value="single"
                                    className="radio-input"
                                    checked={details.eventType === 'single'}
                                    onChange={handleInputChange}
                                    required
                                />
                                <label htmlFor="single-event" className="radio-button">Single Event</label>
                                <input
                                    type="radio"
                                    name="eventType"
                                    value="recurring"
                                    className="radio-input"
                                    checked={details.eventType === 'recurring'}
                                    onChange={handleInputChange}
                                    required
                                />
                                <label htmlFor="recurring-event" className="radio-button">Recurring Event</label>
                            </div>
                        </div>
                    </div>

                    {/* First row with headings only */}
                    <div className="form-group">
                        <div className="input-container">
                            <label>Session(s)</label>
                            <div className="date-time-headings">
                                <span>Start Date</span>
                                <span>Start Time</span>
                                <span>End Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Second row for the input fields without labels */}
                    <div className="form-group">
                        <div className="date-time-inputs">
                            <div className="date-input">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={details.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="time-input">
                                <input
                                    type="time"
                                    name="startTime"
                                    value={details.startTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="time-input2">
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

                    {isRecurring && (
                        <div className="form-group">
                            <div className="input-container">
                                <label>Recurring Frequency</label>
                                <select
                                    name="recurrenceFrequency"
                                    value={details.recurrenceFrequency}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Frequency</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {isRecurring && (
                        <div className="form-group">
                            <div className="input-container">
                                <label htmlFor="recurrence-end-date">End Date</label>
                                <input
                                    type="date"
                                    name="recurrenceEndDate"
                                    value={details.recurrenceEndDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    <h2 className="heading">Location</h2>

                    <div className="form-group">
                        <div className="input-container">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={details.location}
                                onChange={handleInputChange}
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
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Details;
