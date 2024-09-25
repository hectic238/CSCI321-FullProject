import React, { useState } from 'react';
import Details from './Details.jsx';
import Banner from './Banner';
import Ticketing from './Ticketing';
import Review from "./Review.jsx";

const HostEvent = () => {
    const [currentPage, setCurrentPage] = useState('details');
    const [eventDetails, setEventDetails] = useState({
        eventTicketType: '',
        tickets: [],
        id: '',
        userId: ''
    });
    console.log('Current Form Data:', eventDetails);

    const handleNextPage = () => {
        if (currentPage === 'details') {
            setCurrentPage('banner');
        } else if (currentPage === 'banner') {
            setCurrentPage('ticketing');
        } else if (currentPage === 'ticketing') {
            setCurrentPage('review');
        }

    };

    const handlePreviousPage = () => {
        if (currentPage === 'banner') {
            setCurrentPage('details');
        } else if (currentPage === 'ticketing') {
            setCurrentPage('banner');
        } else if (currentPage === 'review') {
            setCurrentPage('ticketing');
        }
    };

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
    const handlePublishEvent = () => {
        // Add publish logic here
        console.log('Event Published', eventDetails);
    };

    const handleSaveDraft = () => {
        // Add save draft logic here
        console.log('Event Saved as Draft', eventDetails);
    };


    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'details':
                return (
                    <Details
                        onFormChange={handleFormChange}
                        onNextPage={handleNextPage} // Pass onNextPage to Details
                        eventDetails={eventDetails}
                    />
                );
            case 'banner':
                return (
                    <Banner
                        eventDetails={eventDetails}
                        onImageChange={handleImageChange}
                        onPreviousPage={handlePreviousPage}
                        onNextPage={handleNextPage} // Pass onNextPage to Details
                    />
                );
            case 'ticketing':
                return (
                    <Ticketing
                        eventDetails={eventDetails}
                        onPreviousPage={handlePreviousPage}
                        onNextPage={handleNextPage}
                        handleTicketFormChange={handleTicketFormChange}
                        setEventDetails={setEventDetails}
                    />
                );
            case 'review':
                return (
                    <Review
                        eventDetails={eventDetails}
                        onPreviousPage={handlePreviousPage}
                        onSaveDraft={handleSaveDraft}
                        onPublish={handlePublishEvent}
                    />
                );
            default:
                return null;
        }
    };






    return (
        <div>
            {renderCurrentPage()}

        </div>
    );
};

export default HostEvent;
