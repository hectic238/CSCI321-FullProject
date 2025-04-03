
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

import { useAuth } from "react-oidc-context";
import {getUserTypeFromToken} from "@/components/userFunctions.jsx";

function Navbar() {
    
    const {
        user,
        isAuthenticated,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
    } = useAuth0();
    
    const auth = useAuth();

    const signOutRedirect = () => {
        const clientId = "71jdc4b1eh18i8d6f4194f7b1p";
        const logoutUri = "https://localhost:5173/home";
        const cognitoDomain = "https://ap-southeast-2i8rut828h.auth.ap-southeast-2.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
        auth.removeUser();
    };
    
    useEffect(() => {
        const getUserType = async () => {
            if (auth.isAuthenticated) {
                try {
                    const userType = await getUserTypeFromToken();
                    
                    setUserType(userType);
                    setCookie("userType",userType);
                } catch (error) {
                    console.error("Failed to get user type:", error);
                }
            } else {
                deleteCookie("userType");
            }
        };
        if(!getCookie(userType)) {
            console.log("no userType");
            getUserType()
        }
        if (auth.isAuthenticated) {
            setUserType(getCookie("userType"));
        }
    }, [auth.isAuthenticated]);

    
    const logoutWithRedirect = () => {
        
        deleteCookie("userType");
        setUserType(null);
        
        auth.removeUser();
        
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
        const currentPath = window.location.pathname;
        const newPath = `/explore/search/${value}`;

        // On search if the current search term equals what is already searched do nothing
        // If the search term is different to what is searched then reload the page and navigate to the newpath
        if (currentPath === newPath) {
            
        } else {
            
            navigate(newPath);
            window.location.reload();
        }
        //navigate(`/explore/search/${value}`);
    };

    const toggleDropdown = () => {
        console.log(auth.user);
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
                    <Link to="/contactUs">Contact Us</Link>
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
                        {!auth.isAuthenticated && (
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Button
                                    id="qsLoginBtn"

                                    color="primary"
                                    block
                                    onClick={() => auth.signinRedirect()  }                              >
                                    Log in / Sign Up
                                </Button>
                                
                            </div>
                        )}


                    </>
                )}
                {auth.isAuthenticated && (
                    <div>

                        <Link className="attendee-btn" onClick={toggleDropdown}>
                            <img src={profileIcon} alt="Profile" className="attendee-icon"/>
                            <span>Profile</span>
                        </Link>


                        {dropdownOpen && (
                            <div ref={dropdownRef}>
                                <ProfileDropdown onLogout={() => signOutRedirect()}/>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>


    )
}

export default Navbar;