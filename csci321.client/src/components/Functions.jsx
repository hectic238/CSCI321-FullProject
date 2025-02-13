import {jwtDecode} from 'jwt-decode';
import {getURL} from "@/components/URL.jsx"; // Import the jwt-decode library
import {accessTokenIsExpired, RefreshToken} from "@/components/RefreshToken.jsx"
import {APIWithToken} from "@/components/API.js";

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

const tryRefreshToken = () => {
    if(accessTokenIsExpired()) {
        console.log("AccessToken is expired!!!")

        RefreshToken();
    }
    
}

export const generateObjectId = () =>  {
    const timestamp = (Math.floor(new Date().getTime() / 1000)).toString(16);
    const randomHex = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.floor(Math.random() * 16)).toString(16);
    });

    return timestamp + randomHex;
}

export const fetchEventSummaries = async (searchTerm, pageSize = 10, lastEvaluatedKey) => {
    var baseUrl = getURL();
    const response = await fetch(`${baseUrl}/api/Event/search?searchTerm=${searchTerm || ''}&pageSize=${pageSize}&lastKey=${lastEvaluatedKey || ""}`);
    if (!response.ok) {
        throw new Error('Failed to fetch event summaries');
    }
    return await response.json();
};

export const fetchEventsByCategory = async (category, pageSize = 10, lastEvaluatedKey) => {
    var baseUrl = getURL();
    const response = await fetch(`${baseUrl}/api/Event/category/${category}?pageSize=${pageSize}&lastEvaluatedKey=${lastEvaluatedKey || ""}`);
    if (!response.ok) {
        throw new Error('Failed to fetch events by category');
    }
    return await response.json();
};

export const fetchEvent = async (eventId) => {
    var baseUrl = getURL();

    try {
        const response = await fetch(`${baseUrl}/api/Event/${eventId}`);

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
    
    tryRefreshToken();
    
    var baseUrl = getURL();
    console.log(updatedEventDetails);
    try {
        const response = await fetch(`${baseUrl}/api/Event/${updatedEventDetails.eventId}`, {
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
    var baseUrl = getURL();

    try {
        const response = await fetch(`${baseUrl}/api/Event/byUser/${userId}`);

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
    var baseUrl = getURL();

    try {
        const response = await fetch(`${baseUrl}/api/Event/byUser/${userId}/drafts`);

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
    var baseUrl = getURL();

    try {
        const response = await fetch(`${baseUrl}/api/User/updateUser`, {
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
    // const accessToken = localStorage.getItem('accessToken');
    //
    // if (!accessToken) {
    //     console.error('No access token found. Please log in.');
    //     alert('No access token found. Please log in.');
    //     return;
    // }

    var baseUrl = getURL();
    
    let url = `${baseUrl}/api/Order/publish`;

    let response = APIWithToken(url, 'Get');
    
    alert('Order successfully published!');


    // tryRefreshToken();
    //
    // try {
    //     const response = await fetch(`${baseUrl}/api/Order/publish`, {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${accessToken}`,
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(orderDetails),
    //     });
    //    
    //
    //     if (!response.ok) {
    //         let errorData;
    //         try {
    //             errorData = await response.json();
    //         } catch (error) {
    //             throw new Error('Failed to parse error response');
    //         }
    //         throw new Error(errorData.message || 'Order publish failed!');
    //     }
    //
    //     await response.json();
    // } catch (error) {
    //     console.error('Error publishing order:', error);
    //     alert(`Error: ${error.message}`);
    // }
    //
    
};

export const fetchOrdersByUserId = async (userId) => {
    const baseUrl = getURL();
    tryRefreshToken();
    
    let url = `${baseUrl}/api/Order/getOrdersByUserId/${userId}`;
    
    let response = APIWithToken(url, 'Get');

    return await response;
};

export const enrichOrdersWithEventDetails = async (includePastOrders = true) => {
    try {
        const userId = getUserIdFromToken()
        const orders = await fetchOrdersByUserId(userId);

        const now = new Date();

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


        // Filter orders based on event date and time
        const filteredOrders = enrichedOrders.filter((order) => {
            const startDate = order.startDate;
            const startTime = order.startTime;
            const eventDate = new Date(`${startDate}T${startTime}`);
            return includePastOrders ? true : eventDate >= now;
        });
        
        return filteredOrders
        
        
    } catch (error) {
        console.error('Error enriching orders:', error);
        return [];
    }
};









