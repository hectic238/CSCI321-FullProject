import './Home.css';
import React, { useEffect } from "react";
import Navbar from '../components/Navbar';
import logoSmall from '../assets/logo_small.png';
import ExploreEvents from "@/pages/Events/ExploreEvents.jsx";

const Home = () => {

    useEffect(() => {
        document.title = "Local Event Planner | PLANIT";
    });
    
    return (
        <>

            <Navbar/>
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