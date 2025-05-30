import './Home.css';
import React, { useEffect } from "react";
import logoSmall from '../assets/logo_small.png';
import ExploreEvents from "@/pages/Events/ExploreEvents.jsx";

const Home = () => {

    useEffect(() => {
        document.title = "Local Event Planner | PLANIT";
    });

    useEffect(() => {
        if (location.hash) {
            // small timeout to ensure the DOM is ready
            setTimeout(() => {
                const element = document.getElementById(location.hash.replace("#", ""));
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 50);
        } else {
            // If no hash, scroll to top on mount or navigation
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location]);
    
    return (
        <>

            <div className="landing-page">
                <div className="circle-container">
                    <img src={logoSmall || "/placeholder.svg"} alt="Logo" className="homelogo" />
                    <h1 className="planit-title">PLANIT</h1>
                    <p className="planit-tagline">
                        WHERE EVERY EVENT FALLS INTO
                        <br />
                        PLACE
                    </p>
                    <a href="#exploreEvents" className="find-events-button">Find events</a>
                </div>
            </div>

            <section id="exploreEvents">
                <ExploreEvents />
            </section>
        </>
    )
}

export default Home;