import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation} from "react-router-dom";
import Details from './Details.jsx';
import Banner from './Banner';
import Ticketing from './Ticketing';
import Review from "./Review.jsx";
import { Button, message, Steps, theme } from 'antd';
import banner from '../../assets/exploreEvent.png';
import {generateObjectId} from "@/components/Functions.jsx";
import {useAuth0} from "@auth0/auth0-react";
import {createEvent, updateEvent} from "@/components/eventFunctions.jsx";
import {useAuth} from "react-oidc-context";

const HostEvent = () => {

    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();


    const location = useLocation();
    const {passedEvent, editing} = location.state || {};
    const auth = useAuth();

    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const [formErrors, setFormErrors] = useState({});
    const [freeTicket, setFreeTicket] = useState([{ name: "Free Admission", price: 0, count: 0, soldOut: false, bought: 0 }]);
    const [eventDetails, setEventDetails] = useState(() => {
        const safeEvent = passedEvent || {};

        return {
            eventTicketType: safeEvent.eventTicketType || '',
            tickets: safeEvent.tickets || [],
            eventId: safeEvent.eventId || generateObjectId(),
            userId: safeEvent.userId || '',
            title: safeEvent.title || '',
            category: safeEvent.category || '',
            eventType: safeEvent.eventType || 'single',
            startDate: safeEvent.startDate || '',
            startTime: safeEvent.startTime || '',
            endTime: safeEvent.endTime || '',
            location: safeEvent.location || '',
            additionalInfo: safeEvent.additionalInfo || '',
            recurrenceFrequency: '',
            recurrenceEndDate: '',
            numberAttendees: safeEvent.numberAttendees || 0,
            isDraft: safeEvent.isDraft || false,
        };
    });

    // Sets event details and free tickets state when a valid passed event is received.
    useEffect(() => {
        if (passedEvent && Object.keys(passedEvent).length > 0) {
            setEventDetails(passedEvent);
            if(passedEvent.eventTicketType === 'free') {
                setFreeTicket(passedEvent.tickets);
                console.log(passedEvent.tickets);
            }
        }
    }, [passedEvent]);

    useEffect(() => {
        console.log(freeTicket)
    }, [freeTicket])

    const handleFormChange = (newDetails) => {
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            ...newDetails,
        }));
    };

    const handleImageChange = (image) => {
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            image: image,
        }));
    };

    const handleTicketFormChange = (field, value) => {
        setEventDetails((prevDetails) => ({
            ...prevDetails,
            [field]: value,
        }));
    };

    const handlePublishEvent = async () => {
        eventDetails.isDraft = false;
        await handleUploadEvent(false)
    }

    // Handles creating or updating an event, resetting ticket quantities for edits and navigating home after success.
    const handleUploadEvent = async (isDraft) => {

        try {



            if(editing) {

                const updatedTickets = eventDetails.tickets.map(ticket => ({
                    ...ticket,
                    quantity: 0  // Add default quantity
                }));

                // Send this in your API request body:
                const updatePayload = {
                    ...eventDetails,
                    tickets: updatedTickets
                };

                const response = await updateEvent(updatePayload);

                if(response) {
                    alert(response.message);
                    navigate('/home');
                }
            }
            else {
                const response = await createEvent(eventDetails)
                if (response) {
                    let message = "Successfully created event"
                    if (isDraft) {
                        message = "Successfully created draft"
                    }
                    alert(message);
                    navigate('/home');
                }
            }


        } catch (error) {
            console.error('Error adding event:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleSaveDraft =  async () => {

        eventDetails.isDraft = true;
        await handleUploadEvent(true)

    };

    // Steps array defining the sequence and content components for the multi-step event creation form
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
                editing={editing}
            />,
        },
        {
            title: 'Ticketing',
            content: <Ticketing
                eventDetails={eventDetails}
                handleTicketFormChange={handleTicketFormChange}
                setEventDetails={setEventDetails}
                setFreeTicket={setFreeTicket}
                freeTicket={freeTicket}
            />,
        },
        {
            title: 'Review',
            content: <Review
                eventDetails={eventDetails}
                isAuthenticated={isAuthenticated}
                user={user}
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

        if(eventDetails.eventTicketType === 'free' && freeTicket[0].count === 0 ) {
            errors.tickets = "Free Ticket Count";
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
        <div className="host-event-page-wrapper">
            <div className="host-event-card">
                <h1 className="host-event-title">Host Your Event</h1>

                <img src={banner} alt="Banner" className="banner-image" />

                <Steps
                    current={current}
                    items={items}
                    style={{ width: '90%', margin: '20px auto' }}
                />

                <div className="host-event-step-content">{steps[current].content}</div>

                <div className="host-event-buttons">
                    {current < steps.length - 1 && (
                        <Button className="host-event-button" onClick={next}>
                            Save and Continue
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <>
                            <Button className="host-event-button" onClick={handlePublishEvent}>
                                Publish Event
                            </Button>
                            <Button
                                className="host-event-button-outlined"
                                onClick={handleSaveDraft}
                            >
                                Save as Draft
                            </Button>
                        </>
                    )}
                    {current > 0 && (
                        <Button className="host-event-button-outlined" onClick={prev}>
                            Back
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HostEvent;


