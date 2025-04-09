import React, { useState, useEffect } from 'react';
import "./interestedPage.css";


const InterestedPage = ({ interests, onInterestsChange }) => {
        const categories = {
            "Music": ["Concerts", "Music Festivals", "Music Workshops", "DJ Nights"],
            "Arts & Culture": ["Art Exhibitions", "Cultural Festivals", "Theater Plays", "Dance Performances"],
            "Food & Drink": ["Food Festivals", "Wine Tastings", "Cooking Classes", "Beer Festivals"],
            "Sports & Fitness": ["Marathons", "Yoga Sessions", "Fitness Workshops", "Sporting Events"],
            "Business & Networking": ["Conferences", "Seminars", "Workshops", "Networking Events"],
            "Family & Kids": ["Family-Friendly Events", "Children's Workshops", "Kid-Friendly Shows", "Educational Activities"],
            Technology: ["Tech Conferences", "Hackathons", "Startup Events", "Gadget Expos"],
            "Comedy & Entertainment": ["Stand-up Comedy", "Improv Nights", "Comedy Festivals", "Magic Shows"],
            "Charity & Causes": ["Fundraising Events", "Charity Galas", "Benefit Concerts", "Auctions & Fundraisers"],
            "Education & Learning": ["Lectures & Talks", "Workshops", "Educational Seminars", "Skill-Building Sessions"],
            "Travel & Adventures": ["City Tours", "Adventure Travel", "Cultural Experiences", "Cruise Vacations"],
        };

        const [selectedInterests, setSelectedInterests] = useState({});

        const toggleInterest = (category, interest) => {
            setSelectedInterests((prev) => ({
                ...prev,
                [category]: prev[category]?.includes(interest)
                    ? prev[category].filter((item) => item !== interest)
                    : [...(prev[category] || []), interest],
            }));
        };

    useEffect(() => {
        document.title = "Interests | PLANIT"
    }, []);

    const renderCategory = (category, categoryInterests) => (
        <div className="category" key={category}>
            <h3>{category}</h3>
            <div className="tags">
                {categoryInterests.map((interest) => (
                    <span
                        key={interest}
                        className={`tag ${interests.includes(interest) ? "selected" : ""}`}
                        onClick={() => onInterestsChange('interests', interest)}  // Use handleInputChange to toggle interest
                    >
                {interest}
                {interests.includes(interest) && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                                onInterestsChange('interests', interest);  // Use handleInputChange to remove interest
                    }}>X</button>
                )}
            </span>
                ))}
        </div>
        </div >
    );

    return (
        <>
            <div className="interests">
                <h2>Share your interests with us</h2>
                {Object.entries(categories).map(([category, categoryInterests]) =>
                    renderCategory(category, categoryInterests)
                )}


            </div>
        </>
    );
};

   
 export default InterestedPage;