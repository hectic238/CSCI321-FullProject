import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '@/api/events'; // Assume you have an API to fetch events
import './SearchPage.css'; // Custom styles

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [dateRange, setDateRange] = useState('');
    const navigate = useNavigate();

    // Function to fetch events based on search term
    const fetchEvents = async () => {
        const fetchedEvents = await getEvents(searchTerm);
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
    };

    // Filter events based on category and date range
    const filterEvents = () => {
        let updatedEvents = [...events];

        // Filter by category
        if (selectedCategory) {
            updatedEvents = updatedEvents.filter(event => event.category === selectedCategory);
        }

        // Filter by date range
        if (dateRange) {
            updatedEvents = updatedEvents.filter(event => {
                const eventDate = new Date(event.startDate);
                const [start, end] = dateRange.split('to').map(d => new Date(d.trim()));
                return eventDate >= start && eventDate <= end;
            });
        }

        setFilteredEvents(updatedEvents);
    };

    // Handle search term change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Handle date range change
    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
    };

    // Use effect to fetch events when search term changes
    useEffect(() => {
        if (searchTerm) {
            fetchEvents();
        } else {
            setEvents([]);
            setFilteredEvents([]);
        }
    }, [searchTerm]);

    // Use effect to filter events when filters change
    useEffect(() => {
        filterEvents();
    }, [selectedCategory, dateRange]);

    return (
        <div className="search-page">
            <div className="search-header">
                <h1>Search Events</h1>
                <input
                    type="text"
                    placeholder="Search for events..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Filters Section */}
            <div className="filters">
                <select value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Date Range (YYYY-MM-DD to YYYY-MM-DD)"
                    value={dateRange}
                    onChange={handleDateRangeChange}
                />
            </div>

            {/* Search Results */}
            <div className="events-list">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <div key={event.id} className="event-item" onClick={() => navigate(`/event/${event.id}`)}>
                            <img src={event.image} alt={event.title} />
                            <div>
                                <h3>{event.title}</h3>
                                <p>{event.startDate}</p>
                                <p>{event.location}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
