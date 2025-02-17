import Navbar from "../../components/Navbar";
import React, { useState, useEffect } from 'react';
import "../about.css";
import "./interestedPage.css";


const InterestedPage = () => {
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

         const renderCategory = (category, interests) => (
    <div className="category" key={category}>
      <h3>{category}</h3>
      <div className="tags">
        {interests.map((interest) => (
          <span
            key={interest}
            className={`tag ${selectedInterests[category]?.includes(interest) ? "selected" : ""}`}
            onClick={() => toggleInterest(category, interest)}
          >
            {interest}
            {selectedInterests[category]?.includes(interest) && (
              <button onClick={(e) => { e.stopPropagation(); toggleInterest(category, interest); }}>X</button>
            )}
          </span>
        ))}
      </div>
    </div>
  );

    return (
        <>
            <Navbar />
            <div className="interests">
                <h2>Share your interests with us</h2>
                {Object.entries(categories).map(([category, categoryInterests]) =>
                    renderCategory(category, categoryInterests)
                )}
                <div class="categories-container">
                    <div class="category">
                        <h3>Music</h3>
                        <div class="tags">
                            <div class="tag">Concerts</div>
                            <div class="tag">Music Festivals</div>
                            <div class="tag">Music Workshops</div>
                            <div class="tag">DJ Nights</div>
                        </div>
                    </div>
                </div>
                <div class="category">
                    <h3>Arts & Culture</h3>
                    <div class="tags">
                        <div class="tag">Art Exhibitions</div>
                        <div class="tag">Cultural Festivals</div>
                        <div class="tag">Theater Plays</div>
                        <div class="tag">Dance Performances</div>
                    </div>
                </div>


            </div>
        </>
    );
};

   
 export default InterestedPage;