import './Home.css';
import Navbar from '../components/Navbar';
import {Link} from "react-router-dom";
import logoSmall from '../assets/logo_small.png'; // Assuming your image is in src/assets



function Home() {
    return (
        <>

            <Navbar/>
            <div className="landing-page">
                <div className="circle-container">
                    <img src={logoSmall} alt="Logo" className="homelogo"/>
                    <h1 className="slogan">WHERE EVERY EVENT FALLS INTO PLACE</h1>
                    <Link to="/about" className="cta-button">Find Events</Link>
                </div>
            </div>
        </>
    )
}

export default Home;