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

