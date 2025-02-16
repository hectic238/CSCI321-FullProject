
import {Link, useNavigate} from "react-router-dom";
import './Navbar.css';
import logoSmall from '../assets/logo_small.png';
import ticketIcon from '../assets/ticketicon.png'; 
import starIcon from '../assets/staricon.png'; 
import profileIcon from '../assets/profileicon.png'; 
import {useEffect, useRef, useState} from "react";
import ProfileDropdown from "./ProfileDropdown.jsx"; 
import { AudioOutlined } from '@ant-design/icons';
import {Button, Input, Space} from 'antd';
const { Search } = Input;
import {getUserTypeFromToken, fetchEventSummaries} from "@/components/Functions.jsx";

import {useAuth0} from "@auth0/auth0-react";

import {createAuth0Client} from '@auth0/auth0-spa-js';
function Navbar() {
    const {
        user,
        isAuthenticated,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
    } = useAuth0();
    
    useEffect(() => {
        if (isAuthenticated && user) {

            console.log(user);
            //updateUserMetadata(user.sub, 'attendee');

        }
    }, [isAuthenticated, user, getAccessTokenSilently]);

    const logoutWithRedirect = () =>
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            }
        });

    const [userType, setUserType] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const onSearch = async (value, _e, info) => {
        console.log(value);
        navigate(`/explore/search/${value}`);
    };


    useEffect( () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setUserType(getUserTypeFromToken(token)); // Set userType from decoded token
        }
        
        

    }, []);


    const handleLogout = () => {
        // Clear user data from localStorage and update state
        localStorage.removeItem('userType');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserType(null);
        navigate('/home'); // Redirect to home after logout
    };

    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="navbar" style={{
            backgroundColor: "#f5f5f5",
            color: "black",
            borderBottom: "1px solid #ccc"

        }}>


            {/* Left Container with Logo and Search Bar */}
            <div className="navbar-left">
                {/* Logo */}
                <Link to="/home">
                    <img src={logoSmall} alt="Logo" className="nav-logo"/>
                </Link>

                {/* Search Bar */}
                <Search
                    placeholder="Search for events here"
                    onSearch={onSearch}
                    style={{
                        flex: 1,
                        margin: 0,
                        padding: 8,
                        borderradius: 30,
                        border: 1,
                        width: 100,
                        maxWidth: 300,
                    }}
                />
            </div>
            {/* Buttons */}
            <div className="nav-links">


                {userType ? (
                    <>
                        {/* Conditionally render based on user type */}
                        {userType === 'attendee' && (


                            <div className="attendee-actions">
                                <nav>
                                    <a href="/home#exploreEvents" className="cta-button">Explore Events</a>
                                </nav>
                                <Link to="/about">Contact Us</Link>

                                <Link to="/myTickets" className="attendee-btn">
                                    <img src={ticketIcon} alt="Tickets" className="attendee-icon"/>
                                    <span>Tickets</span>
                                </Link>
                                <Link to="/interested" className="attendee-btn">
                                    <img src={starIcon} alt="Interested" className="attendee-icon"/>
                                    <span>Interested</span>
                                </Link>

                                <Link className="attendee-btn" onClick={toggleDropdown}>
                                    <img src={profileIcon} alt="Profile" className="attendee-icon"/>
                                    <span>Profile</span>
                                </Link>

                                {dropdownOpen && (
                                    <div ref={dropdownRef}>
                                        <ProfileDropdown onLogout={handleLogout}/>
                                    </div>
                                )}


                            </div>

                        )}
                        {userType === 'organiser' && (
                            <div className="attendee-actions">
                                <nav>
                                    <a href="/home#exploreEvents" className="cta-button">Explore Events</a>
                                </nav>
                                <Link to="/host">Host Events</Link>
                                <Link to="/about">Contact Us</Link>

                                <Link to="/myEvents" className="attendee-btn">
                                    <img src={starIcon} alt="My Events" className="attendee-icon"/>
                                    <span>My Events</span>
                                </Link>

                                <Link className="attendee-btn" onClick={toggleDropdown}>
                                    <img src={profileIcon} alt="Profile" className="attendee-icon"/>
                                    <span>Profile</span>
                                </Link>

                                {dropdownOpen && (
                                    <div ref={dropdownRef}>
                                        <ProfileDropdown onLogout={handleLogout}/>
                                    </div>
                                )}


                            </div>
                        )}

                    </>
                ) : (
                    <>

                        <nav>
                            <a href="/home#exploreEvents" className="cta-button">Explore Events</a>
                        </nav>
                        <Link to="/about">Contact Us</Link>
                        {!isAuthenticated && (
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Button
                                    id="qsLoginBtn"

                                    color="primary"
                                    block
                                    onClick={() => loginWithRedirect()}
                                >
                                    Attendee Log in
                                </Button>

                                <Link to="/Login" className="login-btn-attendee">Attendee Login</Link>

                                <Link to="/organiserLogin" className="login-btn">Organizer Login</Link>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div>

                                <Link className="attendee-btn" onClick={toggleDropdown}>
                                    <img src={profileIcon} alt="Profile" className="attendee-icon"/>
                                    <span>Profile</span>
                                </Link>


                                {dropdownOpen && (
                                    <div ref={dropdownRef}>
                                        <ProfileDropdown onLogout={() => logoutWithRedirect()}/>
                                    </div>
                                )}
                            </div>
                        )}


                    </>
                )}


            </div>
        </div>


    )
}

export default Navbar;