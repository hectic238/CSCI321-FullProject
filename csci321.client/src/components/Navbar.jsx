
import {Link, useNavigate} from "react-router-dom";
import './Navbar.css';
import logoSmall from '../assets/logo_small.png';
import ticketIcon from '../assets/ticketicon.png'; 
import starIcon from '../assets/staricon.png'; 
import profileIcon from '../assets/profileicon.png'; 
import {useEffect, useRef, useState} from "react";
import ProfileDropdown from "./ProfileDropdown.jsx"; 
import {Button, Input, Space} from 'antd';
const { Search } = Input;
import {useAuth0} from "@auth0/auth0-react";

import {deleteCookie, getCookie, setCookie} from "@/components/Cookie.jsx";
import {getUserTypeByUserId} from "@/components/Functions.jsx";
function Navbar() {
    const {
        user,
        isAuthenticated,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
    } = useAuth0();
    
    useEffect(() => {
        

        const getUserType = async () => {
            if (isAuthenticated) {
                try {
                    const token = await getAccessTokenSilently({
                    });
                    const userType = await getUserTypeByUserId(user.sub, token);
                    setUserType(userType);
                    setCookie("userType",userType);
                    
                    
                } catch (error) {
                    console.error("Failed to get user type:", error);
                }
            } else {
                deleteCookie("userType");
            }
        };

        getUserType();

        if (isAuthenticated && user) {
            setUserType(getCookie("userType"));

        }
        
        
    }, [isAuthenticated, user, getAccessTokenSilently]);

    
    const logoutWithRedirect = () => {
        
        deleteCookie("userType");
        setUserType(null);
        
        return logout({
            logoutParams: {
                returnTo: window.location.origin,
            }
        });
    }
    
    useEffect(() => {
        if (isAuthenticated && user) {
            setUserType(getCookie("userType"));

        }
    }, []);
    
    const [userType, setUserType] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const onSearch = async (value, _e, info) => {
        console.log(value);
        navigate(`/explore/search/${value}`);
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
                <div className="attendee-actions">
                    <nav>
                        <a href="/home#exploreEvents" className="cta-button">Explore Events</a>
                    </nav>
                    <Link to="/about">Contact Us</Link>
                </div>


                {userType ? (
                    <>
                        {/* Conditionally render based on user type */}
                        {userType === 'attendee' && (


                            <div className="attendee-actions">
                                
                                <Link to="/myTickets" className="attendee-btn">
                                    <img src={ticketIcon} alt="Tickets" className="attendee-icon"/>
                                    <span>Tickets</span>
                                </Link>
                                <Link to="/interested" className="attendee-btn">
                                    <img src={starIcon} alt="Interested" className="attendee-icon"/>
                                    <span>Interested</span>
                                </Link>

                            </div>

                        )}
                        {userType === 'organiser' && (
                            <div className="attendee-actions">
                                <Link to="/host">Host Events</Link>
                                

                                <Link to="/myEvents" className="attendee-btn">
                                    <img src={starIcon} alt="My Events" className="attendee-icon"/>
                                    <span>My Events</span>
                                </Link>

                                


                            </div>
                        )}

                    </>
                ) : (
                    <>
                        {!isAuthenticated && (
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Button
                                    id="qsLoginBtn"

                                    color="primary"
                                    block
                                    onClick={() => loginWithRedirect()}
                                >
                                    Log in / Sign Up
                                </Button>

                                {/*<Link to="/Login" className="login-btn-attendee">Attendee Login</Link>*/}
                                
                                {/*<Link to="/organiserLogin" className="login-btn">Organizer Login</Link>*/}
                            </div>
                        )}


                    </>
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

            </div>
        </div>


    )
}

export default Navbar;