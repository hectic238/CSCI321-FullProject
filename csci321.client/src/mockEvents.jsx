// src/mockEvents.js
const mockEvents = [
    {
        id: 1,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49c',
        title: "Music Festival",
        date: "2024-09-15",
        location: "Sydney",
        description: "A fun-filled day with live music performances.",
        imageUrl: "/images/music-festival.jpg",
        category: "music"
    },
    {
        id: 2,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49c',
        title: "Tech Conference",
        date: "2024-10-05",
        location: "Melbourne Convention Center",
        description: "A gathering of technology enthusiasts and professionals.",
        imageUrl: "/images/tech-conference.jpg",
        category: "tech"
    },
    {
        id: 3,
        userId: 'c20dee40-7ae1-4aca-bb08-13bf2739f49c',
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
    }



];

const draftEvents = [];


export const addDraftEvent = (formData) => {
    if(formData.id === "") {
        formData.id = crypto.randomUUID();
    }
    draftEvents.push(formData);

    console.log(draftEvents);
    return Promise.resolve({ success: true });

}

export const addEvent = (formData) => {
    if(formData.id === "") {
        formData.id = crypto.randomUUID();
    }
    mockEvents.push(formData);
    console.log(mockEvents);
    return Promise.resolve({ success: true });
}

export default mockEvents;




