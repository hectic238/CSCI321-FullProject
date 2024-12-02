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

export const updateUser = async (updatedUser) => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('No access token found. Please log in.');
        return;
    }

    try {
        const response = await fetch('https://localhost:5144/api/User/updateUser', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update user!");
        }

        const updatedUserResponse = await response.json();

        // Optionally update local storage or state with the new user information
        localStorage.setItem('user', JSON.stringify(updatedUserResponse));
        console.log("User updated successfully:", updatedUserResponse);

        return updatedUserResponse;
    } catch (error) {
        console.error('Error updating user:', error);
        alert(`Error: ${error.message}`);
    }
    
    
};

export const handlePublishOrder = async (orderDetails) => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('No access token found. Please log in.');
        alert('No access token found. Please log in.');
        return;
    }
    

    try {
        const response = await fetch('https://localhost:5144/api/Order/publish', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDetails),
        });
        

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (error) {
                throw new Error('Failed to parse error response');
            }
            throw new Error(errorData.message || 'Order publish failed!');
        }

        await response.json();
        alert('Order successfully published!');
    } catch (error) {
        console.error('Error publishing order:', error);
        alert(`Error: ${error.message}`);
    }
    
    
};

export const fetchOrdersByUserId = async (userId) => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('No access token found. Please log in.');
        return;
    }

    try {
        const response = await fetch(`https://localhost:5144/api/Order/getOrdersByUserId/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new Error('Failed to parse error response');
            }
            throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const orders = await response.json();
        return orders; // This will return the list of orders
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert(`Error: ${error.message}`);
    }
};

export const enrichOrdersWithEventDetails = async (userId) => {
    try {
        const orders = await fetchOrdersByUserId(userId);

        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const eventDetails = await fetchEvent(order.eventId);

                return {
                    ...order,
                    title: eventDetails?.title || 'Unknown Event',
                    image: eventDetails?.image || 'default.jpg',
                    location: eventDetails?.location || 'Unknown Location',
                    startDate: eventDetails?.startDate || '',
                    startTime: eventDetails?.startTime || '',
                    endTime: eventDetails?.endTime || '',
                    
                };
            })
        );
        console.log(enrichedOrders);
        return enrichedOrders;
    } catch (error) {
        console.error('Error enriching orders:', error);
        return [];
    }
};









