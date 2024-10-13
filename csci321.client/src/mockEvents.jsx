// src/mockEvents.js
export const mockEvents = [
    {
        id: 1,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49b',
        title: "Music Festival",
        date: "2024-09-15",
        location: "Sydney",
        description: "A fun-filled day with live music performances.",
        imageUrl: "/images/music-festival.jpg",
        category: "music"
    },
    {
        id: 2,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49d',
        title: "Tech Conference",
        date: "2024-10-05",
        location: "Melbourne Convention Center",
        description: "A gathering of technology enthusiasts and professionals.",
        imageUrl: "/images/tech-conference.jpg",
        category: "tech"
    },
    {
        id: 3,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49a',
        title: "Art Expo",
        date: "2024-11-20",
        location: "National Art Gallery",
        description: "Exhibiting modern and contemporary art from around the world.",
        imageUrl: "/images/art-expo.jpg",
        category: "art"
    },
    {
        id: 4,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49c',
        title: "Food Festival",
        date: "2024-12-12",
        location: "Central Park",
        description: "A festival celebrating cuisine from all around the world.",
        imageUrl: "/images/food-festival.jpg",
        category: "other"
    },
    {
        id: "842bd01c-10e5-4b81-bf75-efe168906ddb",
        userId: "3b8ec461c8d8753c60a166fd",
        title: "Sydney Music Festival",
        category: "Music",
        eventType: "single",
        eventTicketType: "ticketed",
        startDate: "2024-09-09",
        startTime: "16:10",
        endTime: "18:10",
        location: "Sydney",
        additionalInfo: "Hi",
        recurrenceFrequency: "",
        recurrenceEndDate: "",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAC0A", // Placeholder image base64 string
        tickets: [
            {
                name: "General Admission",
                price: "100",
                count: "15",
                soldOut: false,
            },
            {
                name: "VIP",
                price: "100",
                count: "1",
                soldOut: false,
            }
        ],
        editing: false,
        numberAttendees: 0,
    },
    {
        id: "842bd01c-10e5-4b81-bf75-efe168906ddd",
        userId: "3b8ec461c8d8753c60a166fd",
        title: "Sydney Concert",
        category: "Music",
        eventType: "single",
        eventTicketType: "free",
        startDate: "2024-09-09",
        startTime: "16:10",
        endTime: "18:10",
        location: "Sydney",
        additionalInfo: "Hi",
        recurrenceFrequency: "",
        recurrenceEndDate: "",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAC0A", // Placeholder image base64 string
        tickets: [
        ],
        editing: false,
        numberAttendees: 0,
    },
    {
        id: "842bd01c-10e5-4b81-bf75-efe168906dde",
        userId: "3b8ec461c8d8753c60a166fd",
        title: "Sydney Concert",
        category: "Music",
        eventType: "single",
        eventTicketType: "free",
        startDate: "2024-11-11",
        startTime: "16:10",
        endTime: "18:10",
        location: "Sydney",
        additionalInfo: "Hi",
        recurrenceFrequency: "",
        recurrenceEndDate: "",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAC0A", // Placeholder image base64 string
        tickets: [
        ],
        editing: false,
        numberAttendees: 0,
    }



];

export const mockDraftEvents = [

    {
        id: "842bd01c-10e5-4b81-bf75-efe168906abc",
        userId: "3b8ec461c8d8753c60a166fd",
        title: "Sydney Concert",
        category: "Music",
        eventType: "single",
        eventTicketType: "free",
        startDate: "2024-09-09",
        startTime: "16:10",
        endTime: "18:10",
        location: "Sydney",
        additionalInfo: "Hi",
        recurrenceFrequency: "",
        recurrenceEndDate: "",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAC0A", // Placeholder image base64 string
        tickets: [
        ],
        editing: false,
        numberAttendees: 0,
    }
    
    
];


export const addDraftEvent = (formData) => {
    if(formData.id === "") {
        formData.id = crypto.randomUUID();
    }
    mockDraftEvents.push(formData);

    console.log(mockDraftEvents);
    return Promise.resolve({ success: true });

}

export const addEvent = (formData) => {
    
    const exisitingEventIndex = mockEvents.findIndex(event => event.id === formData.id);
    
    if (exisitingEventIndex !== -1) {
        return editEvent(formData);
    } 
    else {
        if(formData.id === "") {
            formData.id = crypto.randomUUID();
        }
    }
    
    mockEvents.push(formData);
    console.log("New Event Added: ", mockEvents);
    return Promise.resolve({ success: true });
}

export const editEvent = (formData) => {
    const eventIndex = mockEvents.findIndex(event => event.id === formData.id);

    if (eventIndex !== -1) {
        // Update the event
        mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...formData };
        console.log("Event updated:", mockEvents[eventIndex]);
        return Promise.resolve({ success: true, event: mockEvents[eventIndex] });
    } else {
        return Promise.reject({ success: false, message: "Event not found" });
    }
}

export const getEventById = (id) => {
    const event = mockEvents.find(event => event.id === id);

    if (event) {
        return Promise.resolve({ success: true, event });
    } else {
        return Promise.reject({ success: false, message: "Event not found" });
    }
};


export default mockEvents;




