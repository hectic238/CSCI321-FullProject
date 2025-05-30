import { Link, useNavigate, useLocation } from "react-router-dom";
import './Navbar.css';

import logoSmall from '../assets/logo_small.png';
import ticketIcon from '../assets/ticket.svg'; 
import starIcon from '../assets/star.svg'; 
import profileIcon from '../assets/profile.svg'; 
import exploreIcon from '../assets/explore.svg';
import contactIcon from '../assets/contact.svg';
import loginIcon from '../assets/login.svg';
import hostIcon from '../assets/host.svg';

import personalisedIcon from '../assets/personalised.svg';
import {useEffect, useRef, useState} from "react";
import ProfileDropdown from "./ProfileDropdown.jsx"; 
import {Button, Input, Space} from 'antd';
const { Search } = Input;
import {useAuth0} from "@auth0/auth0-react";

import {deleteCookie, getCookie, setCookie} from "@/components/Cookie.jsx";

import { useAuth } from "react-oidc-context";
import {getUserTypeFromToken} from "@/components/userFunctions.jsx";
import { Padding } from "@mui/icons-material";

function Navbar() {
    
    const {
        user,
        isAuthenticated,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
    } = useAuth0();
    
    const auth = useAuth();

    // signout function using aws cognito
    const signOutRedirect = () => {
        const clientId = "71jdc4b1eh18i8d6f4194f7b1p";
        const logoutUri = import.meta.env.MODE === 'development'
            ? "https://localhost:5173/home"
            : "https://aws-production.deyr091sxurr5.amplifyapp.com/home";

        const cognitoDomain = "https://ap-southeast-2i8rut828h.auth.ap-southeast-2.amazoncognito.com";

        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
        auth.removeUser();
    };


    useEffect(() => {
        // get userType if the user is authenticated
        const getUserType = async () => {
            if (auth.isAuthenticated) {
                try {
                    const data = await getUserTypeFromToken();
                    
                    setUserType(data.userType);
                    setCookie("userType",data.userType);
                    setCookie("name",data.name);
                } catch (error) {
                    console.error("Failed to get user type:", error);
                }
            } else {
                deleteCookie("name")
                deleteCookie("userType");
            }
        };
        if(!getCookie(userType)) {
            getUserType()
        }
        if (auth.isAuthenticated) {
            setUserType(getCookie("userType"));
        }
    }, [auth.isAuthenticated]);
    
    // get userType if the user isAuthenticated and if the user exists
    useEffect(() => {
        if (isAuthenticated && user) {
            setUserType(getCookie("userType"));

        }
    }, []);
    
    const [userType, setUserType] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    // Searching function based on the input
    const onSearch = async (value, _e, info) => {
        console.log(value);
        const currentPath = window.location.pathname;
        
        //const newPath = `/explore/search/${value}`;

        const params = new URLSearchParams({ q: value });

        const newPath =`/explore/search?${params.toString()}`;
        const basePath = newPath.split('/').slice(0, 3).join('/'); // "/explore/search"

        console.log(currentPath);
        // On search if the current search term equals what is already searched do nothing
        // If the search term is different to what is searched then reload the page and navigate to the newpath
        if (currentPath === "/explore/search") {
            navigate(newPath);
            window.location.reload(); 
        }
        else {
            navigate(newPath);
        }
        
    };
    // User dropdown toggle
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

    const location = useLocation();
    
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
                    className="navbar-search"
                    placeholder="Search events..."
                    onSearch={onSearch}
                />
            </div>
            {/* Buttons */}
            <div className="nav-links">
                <div className="attendee-actions">
                    {location.pathname === '/home' ? (
                        <>
                            <a
                                href="/home#exploreEvents"
                                className={location.pathname === "/home" && location.hash === "#exploreEvents" ? "navbar-cta-button active" : "navbar-cta-button"}
                                id="full-button"
                                
                            >
                                <img src={exploreIcon} alt="Explore" className="icon" style={{ paddingRight: "5px" }} />
                                Explore Events
                            </a>
                        </>
                    ) : (
                        <>
                            <Link to="/home#exploreEvents" className={location.pathname === "/home" && location.hash === "#exploreEvents" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                                <img src={exploreIcon} alt="Explore" className="icon" style={{paddingRight: "5px"}}/>
                                Explore Events
                            </Link>
                            <Link to="/home#exploreEvents" className={location.pathname === "/home" && location.hash === "#exploreEvents" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                                <img src={exploreIcon} alt="Explore" className="icon"/>
                            </Link>
                        </>
                    )}
                    

                    <Link to="/contactUs" className={location.pathname === "/contactUs" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                        <img src={contactIcon} alt="Contact" className="icon" style={{paddingRight: "5px"}}/>
                        Contact Us
                    </Link>
                    <Link to="/contactUs" className={location.pathname === "/contactUs" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                        <img src={contactIcon} alt="Contact" className="icon"/>
                    </Link>
                </div>
                {/* Conditional Rendering based on User Type */}
                {userType ? (
                    <>
                        {userType === 'attendee' && (
                            <div className="attendee-actions">
                                <Link to="/events" className={location.pathname === "/events" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                                    <img src={personalisedIcon} alt="Personalised Events" className="icon" style={{paddingRight: "5px"}}/>
                                    Personalised Events
                                </Link>
                                <Link to="/events" className={location.pathname === "/events" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                                    <img src={personalisedIcon} alt="Personalised Events" className="icon"/>
                                </Link>

                                <Link to="/myTickets" className={location.pathname === "/myTickets" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                                    <img src={ticketIcon} alt="Tickets" className="icon" style={{paddingRight: "5px"}}/>
                                    Tickets
                                </Link>
                                <Link to="/myTickets" className={location.pathname === "/myTickets" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                                    <img src={ticketIcon} alt="Tickets" className="icon"/>
                                </Link>
                            </div>

                        )}
                        {userType === 'organiser' && (
                            <div className="attendee-actions">
                                <Link to="/host" className={location.pathname === "/host" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                                    <img src={hostIcon} alt="Host Events" className="icon" style={{paddingRight: "5px"}}/>
                                    Host Events
                                </Link>
                                <Link to="/host" className={location.pathname === "/host" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                                    <img src={hostIcon} alt="Host Events" className="icon"/>
                                </Link>

                                <Link to="/myEvents" className={location.pathname === "/myEvents" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                                    <img src={starIcon} alt="My Events" className="icon" style={{paddingRight: "5px"}}/>
                                    My Events
                                </Link>
                                <Link to="/myEvents" className={location.pathname === "/myEvents" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                                    <img src={starIcon} alt="My Events" className="icon"/>
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {!auth.isAuthenticated && (
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Button
                                    id="full-button"
                                    className="navbar-link-button"
                                    block
                                    onClick={() => auth.signinRedirect()}>
                                    <img src={loginIcon} alt="Login" style={{paddingRight: "5px"}}/>
                                    Log in / Sign Up
                                </Button>
                                <Button
                                    id="mobile-button"
                                    className="navbar-link-button"
                                    style={{display: "none"}}
                                    onClick={() => auth.signinRedirect()}>
                                    <img src={loginIcon} alt="Login"/>
                                </Button>
                            </div>
                        )}
                    </>
                )}
                {auth.isAuthenticated && (
                    <div>
                        <Link onClick={toggleDropdown} className={location.pathname === "/profile" ? "navbar-cta-button active" : "navbar-cta-button"} id="full-button">
                            <img src={profileIcon} alt="Profile" className="icon" style={{paddingRight: "5px"}}/>
                            Profile
                        </Link>
                        <Link onClick={toggleDropdown} className={location.pathname === "/profile" ? "navbar-cta-button active" : "navbar-cta-button"} id="mobile-button" style={{display: "none"}}>
                            <img src={profileIcon} alt="Tickets" className="icon"/>
                        </Link>

                        {dropdownOpen && (
                            <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', right: 0 }}>
                                <ProfileDropdown onLogout={() => signOutRedirect()} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar;