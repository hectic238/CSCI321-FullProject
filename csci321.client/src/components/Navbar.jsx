
import {Link, useNavigate} from "react-router-dom";
import './Navbar.css';
import logoSmall from '../assets/logo_small.png';
import ticketIcon from '../assets/ticketicon.png'; // Add your ticket image here
import starIcon from '../assets/staricon.png'; // Add your star image here
import profileIcon from '../assets/profileicon.png'; // Add your profile image here
import {useEffect, useRef, useState} from "react";
import ProfileDropdown from "./ProfileDropdown.jsx"; // Assuming your image is in src/assets



function Navbar() {

    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
    const dropdownRef = useRef(null); // Ref for the dropdown

    const navigate = useNavigate();

    useEffect(() => {
        // Check if a user is logged in by checking localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Store user details in state
            console.log("User logged in:", JSON.parse(storedUser));
        }
        else if(storedUser === null) {
            console.log("No user found, showing login options."); // Log if no user found
        }
    }, []);

    const handleLogout = () => {
        // Clear user data from localStorage and update state
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/home'); // Redirect to home after logout
    };

    const toggleDropdown = () => {
        console.log("Toggle Dropdown Called");
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
        <div className="navbar">

            {/* Logo */}


            {/* Left Container with Logo and Search Bar */}
            <div className="navbar-left">
                {/* Logo */}
                <Link to="/home">
                    <img src={logoSmall} alt="Logo" className="nav-logo" />
                </Link>

                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Start Searching for Events"
                    className="search-bar"
                />
            </div>
            {/* Buttons */}
            <div className="nav-links">




                {user ? (
                    <>
                        {/* Conditionally render based on user type */}
                        {user.user.userType === 'attendee' && (


                            <div className="attendee-actions">
                                <Link to="/explore">Explore Events</Link>
                                <Link to="/about">Contact Us</Link>

                                <Link to="/tickets" className="attendee-btn">
                                    <img src={ticketIcon} alt="Tickets" className="attendee-icon" />
                                    <span>Tickets</span>
                                </Link>
                                <Link to="/interested" className="attendee-btn">
                                    <img src={starIcon} alt="Interested" className="attendee-icon" />
                                    <span>Interested</span>
                                </Link>

                                <Link className="attendee-btn" onClick={toggleDropdown}>
                                    <img src={profileIcon} alt="Profile" className="attendee-icon"/>
                                    <span>Profile</span> {/* Class for consistent styling */}
                                </Link>
                                {/* Add ref here */}
                                {dropdownOpen && (
                                    <div ref={dropdownRef}>
                                        <ProfileDropdown onLogout={handleLogout}/>
                                    </div>
                                )}


                            </div>

                        )}
                        {user.user.userType === 'organiser' && (
                            <div className="attendee-actions">
                                <Link to="/explore">Explore Events</Link>
                                <Link to="/host">Host Events</Link>
                                <Link to="/about">Contact Us</Link>

                                <Link to="/myEvents" className="attendee-btn">
                                    <img src={starIcon} alt="My Events" className="attendee-icon"/>
                                    <span>My Events</span>
                                </Link>

                                <Link className="attendee-btn" onClick={toggleDropdown}>
                                    <img src={profileIcon} alt="Profile" className="attendee-icon"/>
                                    <span>Profile</span> {/* Class for consistent styling */}
                                </Link>
                                {/* Add ref here */}
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
                        {/* Show login buttons if not logged in */}
                        <Link to="/explore">Explore Events</Link>
                        <Link to="/host">Host Events</Link>
                        <Link to="/about">Contact Us</Link>
                        <Link to="/attendeeLogin" className="login-btn-attendee">Attendee Login</Link>
                        <Link to="/organiserLogin" className="login-btn">Organizer Login</Link>
                    </>
                )}


            </div>
        </div>


    )
}

export default Navbar;