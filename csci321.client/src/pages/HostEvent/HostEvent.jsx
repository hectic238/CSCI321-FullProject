import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import Details from './Details.jsx';
import Banner from './Banner';
import Ticketing from './Ticketing';
import Review from "./Review.jsx";
import { Button, message, Steps, theme } from 'antd';
import banner from '../../assets/exploreEvent.png';
import Navbar from "../../components/Navbar.jsx";
import Home from "@/pages/Home.jsx"; // Import your CSS file
import {generateObjectId} from "@/components/Functions.jsx";
import {RefreshToken} from "@/components/RefreshToken.jsx";
const HostEvent = () => {
    
    const location = useLocation();
    const passedEvent = location.state || {};

    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const [formErrors, setFormErrors] = useState({});  // Track form errors
    const [freeTicket, setFreeTicket] = useState([{}]);
    const [eventDetails, setEventDetails] = useState({
        eventTicketType: '',
        tickets:  [],
        eventId:  generateObjectId(),
        userId:  '',
        title:  passedEvent.title || '',
        category:  'Music',
        eventType:  'single',
        startDate:  '2024-09-09',
        startTime:  '16:10',
        endTime:  '18:10',
        location:  'Sydney',
        additionalInfo:  'Hi',
        recurrenceFrequency:  '', 
        recurrenceEndDate:  '',
        numberAttendees: 0,
        isDraft: false,
    });

    useEffect(() => {
        if (passedEvent && Object.keys(passedEvent).length > 0) {
            setEventDetails(passedEvent);
        }
    }, [passedEvent]);

    const handleFormChange = (newDetails) => {
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            ...newDetails, // Spread the new details to update the state
        }));
    };

    const handleImageChange = (image) => {
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            image: image, // Add image to eventDetails
        }));
    };

    const handleTicketFormChange = (field, value) => {
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            [field]: value, // Correctly assign the field as a key and the value as its value
        }));
    };

    // Logic to handle publishing or saving the event
    const handlePublishEvent = async () => {
        
        await RefreshToken();
        
        
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            console.error('No access token found. Please log in.');
            return;
        }
        
        try {
            const response = await fetch('https://localhost:5144/api/Event/createEvent', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventDetails),
            })
            if(!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (error) {
                    throw new Error("Failed to parse error response");
                }
                throw new Error(errorData.message || "Publish Event Failed!");
            }
            
            await response.json();
            navigate('/home');
            alert("Sign up successful!");
            // const response = await addEvent(eventDetails);
            //
            // if (response.success) {
            //     console.log('Event successfully added!', response);
            //     navigate("/home"); // Navigate to home on success
            // }
        } catch (error) {
            console.error('Error adding event:', error);

            // Display an error message to the user
            alert(`Error: ${error.message}`);
        }
    };

    const handleSaveDraft =  async () => {
        // Add save draft logic here
        // console.log('Event Saved as Draft', eventDetails);
        // try {
        //     const response = await addDraftEvent(eventDetails);
        //
        //     if (response.success) {
        //         console.log('Event draft successfully added!', response);
        //         navigate("/home"); // Navigate to home on success
        //     }
        // } catch (error) {
        //     console.error('Error adding event:', error);
        // }
        
    };
    
    const steps = [
        {
            title: 'Event Details',
            content: <Details
                onFormChange={handleFormChange}
                eventDetails={eventDetails}
            />,
        },
        {
            title: 'Banner',
            content: <Banner
                eventDetails={eventDetails}
                onImageChange={handleImageChange}
            />,
        },
        {
            title: 'Ticketing',
            content: <Ticketing
                eventDetails={eventDetails}
                handleTicketFormChange={handleTicketFormChange}
                setEventDetails={setEventDetails}
                setFreeTicket={setFreeTicket}
            />,
        },
        {
            title: 'Review',
            content: <Review
                eventDetails={eventDetails}
            />,
        },
    ];



    const next = () => {
        const isValid = validateCurrentPage();

        if (isValid) {
            setCurrent(current + 1);
        }
    };
    const prev = () => {
        setCurrent(current - 1);
    };
    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));
    const contentStyle = {
        textAlign: 'center',
        borderRadius: token.borderRadiusLG,
        marginTop: 20,
    };

    // Validation function for the Details page
    const validateDetailsPage = () => {
        const errors = {};
        if (!eventDetails.title) {
            errors.title = "Title";
        }
        if (!eventDetails.category) {
            errors.eventType = "Category";
        }
        if (eventDetails.eventType === 'recurring') {
            if (!eventDetails.recurrenceEndDate) {
                errors.recurrenceEndDate = "End Date";
            }
            if (!eventDetails.recurrenceFrequency) {
                errors.recurrenceFrequency = "Recurrence Frequency";
            }
        }

        if (!eventDetails.location) {
            errors.location = "location";
        }
        if (!eventDetails.additionalInfo) {
            errors.additionalInfo = "Additional Information";
        }
        // Add other field validations as necessary
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors).join(', ');
            message.error(`Please complete all required fields: ${errorMessages}`);
        }
        return Object.keys(errors).length === 0; // If no errors, form is valid
    };

    // Validation function for the Banner page
    const validateBannerPage = () => {
        const errors = {};
        if (!eventDetails.image) {
            errors.image = "Banner Image";
        }
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors).join(', ');
            message.error(`Please complete all required fields: ${errorMessages}`);
        }
        return Object.keys(errors).length === 0;
    };

    // Validation function for the Ticketing page
    const validateTicketingPage = () => {
        const errors = {};
        if(!eventDetails.eventTicketType) {
            errors.eventTicketType = "Ticket Type";
        }

        if (eventDetails.eventTicketType === 'ticketed' && (eventDetails.tickets.length === 0 || eventDetails.tickets.some(ticket => !ticket.name || !ticket.price || !ticket.count))) {
            errors.tickets = "Tickets";
        }
        
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors).join(', ');
            message.error(`Please complete all required fields: ${errorMessages}`);
        }

        if(eventDetails.eventTicketType === 'free') {
            setEventDetails((prevDetails) => ({
                    ...prevDetails,
                    tickets: freeTicket,
                }

            ));
        }
        
        return Object.keys(errors).length === 0;
    };

    // Call validation functions based on the current page
    const validateCurrentPage = () => {
        if (current === 0) {
            return validateDetailsPage();
        } else if (current === 1) {
            return validateBannerPage();
        } else if (current === 2) {
            return validateTicketingPage();
        }
        return true;
    };

    return (
        <>
            <Navbar/>
            <img src={banner} alt="Banner" className="banner-image"/>
            <Steps style={{
                width: '90%',
                margin: 'auto',
            }} current={current} items={items}/>
            <div style={contentStyle}>{steps[current].content}</div>
            <div
                style={{
                    marginBottom: 24,
                }}
            >
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>
                        Save and Continue
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button
                        type="primary"
                        onClick={() => handlePublishEvent()}
                    >
                        Publish Event
                    </Button>
                    
                )}
                {current === steps.length - 1 && (
                    <Button
                        type="primary"
                        onClick={() => handleSaveDraft()}
                    >
                        Save as Draft
                    </Button>

                )}
                {current > 0 && (
                    <Button
                        style={{
                            margin: '0 8px',
                        }}
                        onClick={() => prev()}
                    >
                        Back
                    </Button>
                )}
            </div>
        </>
    );
};

export default HostEvent;
