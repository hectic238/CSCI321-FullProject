import './Home.css';
import React, { useEffect } from "react";
import Navbar from '../components/Navbar';
import logoSmall from '../assets/logo_small.png';
import ExploreEvents from "@/pages/ExploreEvents.jsx";

const Home = () => {

    useEffect(() => {
        document.title = "Local Event Planner | PLANIT";
    });
    
    return (
        <>

            <Navbar/>
            <div className="landing-page">
                <div className="circle-container">
                    <img src={logoSmall} alt="Logo" className="homelogo"/>
                    <nav>
                        <h1 className="slogan">WHERE EVERY EVENT FALLS INTO PLACE</h1>

                        <a href="#exploreEvents" className="cta-button">Find Events</a>
                    </nav>
                </div>

            </div>

            <section id="exploreEvents">
                <ExploreEvents/>
            </section>
        </>
    )
}

export default Home;