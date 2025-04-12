import {APIWithToken} from "@/components/API.js";

export const getUsersEvents = async () => {
    try {

        const response = await APIWithToken("event/fetchByUser", "GET")

        if (!response.ok) {
            throw new Error("Failed to fetch user events");
        }
        
        
        const data = await response.json();
        
        console.log(data);
        return data;  // this will return all the users created events
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getUsersDraftEvents = async () => {
    try {

        const response = await APIWithToken("event/fetchDraftsByUser", "GET")

        if (!response.ok) {
            throw new Error("Failed to fetch userType");
        }
        const data = await response.json();
        return data;  // this will return all the users created events
    } catch (error) {
        console.error("Error:", error);
    }
}

export const createEvent = async (body) => {
    try {

        const response = await APIWithToken("event/create", "PUT", body)

        if (!response.ok) {
            throw new Error("Failed to upload event");
        }
        const data = await response.json();
        return data;  // this will return a message if the event was successfully created
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getEventsByCategory = async (category, lastKey, limit = 5) => {
    try {

        const response = await APIWithToken(`event/category?category=${category}&limit=${limit}&lastKey=${lastKey || ""}`, "GET")

        if (!response.ok) {
            throw new Error("Failed to fetch events based on category");
        }
        const data = await response.json();
        return data;  // this will return an array of events if successful
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getEventsBySearchTerm = async (searchTerm, lastKey, limit = 5) => {
    try {

        const response = await APIWithToken(`event/search?keyword=${searchTerm}&limit=${limit}&lastKey=${lastKey || ""}`, "GET")

        if (!response.ok) {
            throw new Error("Failed to fetch events based on searchTerm");
        }
        const data = await response.json();
        return data;  // this will return an array of events if successful
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getEvent = async (eventId) => {
    try {

        const response = await APIWithToken(`event/fetch/${eventId}`, "GET")

        if (!response.ok) {
            throw new Error("Failed to fetch event");
        }
        const data = await response.json();
        return data;  // this will return a single event
    } catch (error) {
        console.error("Error:", error);
    }
}

