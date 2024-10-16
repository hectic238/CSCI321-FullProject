import {jwtDecode} from 'jwt-decode'; // Import the jwt-decode library


export const getUserIdFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['sub'];
    }
}
export const getEmailFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['email'];
    }
}
export const getUserTypeFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['userType'];
    }
}

export const generateObjectId = () =>  {
    const timestamp = (Math.floor(new Date().getTime() / 1000)).toString(16);
    const randomHex = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.floor(Math.random() * 16)).toString(16);
    });

    return timestamp + randomHex;
}

export const fetchEventSummaries = async (searchTerm) => {
    const response = await fetch(`https://localhost:5144/api/Event/search?searchTerm=${searchTerm || ''}`);
    if (!response.ok) {
        throw new Error('Failed to fetch event summaries');
    }
    return await response.json();
};

export const fetchEventsByCategory = async (category) => {
    const response = await fetch(`https://localhost:5144/api/Event/category/${category}`);
    if (!response.ok) {
        throw new Error('Failed to fetch events by category');
    }
    return await response.json();
};

export const fetchEvent = async (eventId) => {
    try {
        const response = await fetch(`https://localhost:5144/api/Event/${eventId}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch event');
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching event:", error);
    }
};

export const editEvent = async (updatedEventDetails) => {

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('No access token found. Please log in.');
        return;
    }
    
    try {
        const response = await fetch(`https://localhost:5144/api/Event/${updatedEventDetails.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEventDetails),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update event');
        }

        // Handle success - You can show a success message or navigate
        alert('Event updated successfully');
    } catch (error) {
        console.error('Error updating event:', error);
    }
};

export const fetchEventsByUserId = async (userId) => {
    try {
        const response = await fetch(`https://localhost:5144/api/Event/byUser/${userId}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch events by userId');
        }

        const events = await response.json();
        return events;  // Return the events so it can be used in the UI
    } catch (error) {
        console.error("Error fetching events by userId:", error);
    }
};

export const fetchDraftEventsByUserId = async (userId) => {
    try {
        const response = await fetch(`https://localhost:5144/api/Event/byUser/${userId}/drafts`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch draft events by userId');
        }

        const draftEvents = await response.json();
        return draftEvents;  // Return the draft events for UI
    } catch (error) {
        console.error("Error fetching draft events by userId:", error);
    }
};




