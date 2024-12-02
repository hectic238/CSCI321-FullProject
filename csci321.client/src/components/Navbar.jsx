
import {Link, useNavigate} from "react-router-dom";
import './Navbar.css';
import logoSmall from '../assets/logo_small.png';
import ticketIcon from '../assets/ticketicon.png'; // Add your ticket image here
import starIcon from '../assets/staricon.png'; // Add your star image here
import profileIcon from '../assets/profileicon.png'; // Add your profile image here
import {useEffect, useRef, useState} from "react";
import ProfileDropdown from "./ProfileDropdown.jsx"; // Assuming your image is in src/assets
import { AudioOutlined } from '@ant-design/icons';
import { Input, Space } from 'antd';
const { Search } = Input;
import {getUserTypeFromToken} from "@/components/Functions.jsx"; // Import the jwt-decode library



const suffix = (
    <AudioOutlined
        style={{
            fontSize: 16,
            color: '#1677ff',
        }}
    />
);

const onSearch = (value, _e, info) => console.log(info?.source, value);


function Navbar() {

    const [userType, setUserType] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
    const dropdownRef = useRef(null); // Ref for the dropdown

    const navigate = useNavigate();

    useEffect(() => {
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
        <div className="navbar">

            {/* Logo */}


            {/* Left Container with Logo and Search Bar */}
            <div className="navbar-left">
                {/* Logo */}
                <Link to="/home">
                    <img src={logoSmall} alt="Logo" className="nav-logo" />
                </Link>

                {/* Search Bar */}
                    <Search
                        placeholder="Search for events here"
                        onSearch={onSearch}
                        style={{
                            flex: 1, /* Makes the search bar expand to fill available space */
                            margin: 0,
                            padding: 8,
                            borderradius: 30,
                            border: 1, /* Black border for the search bar */
                            width: 100, /* Makes the search bar take full width */
                            maxWidth: 300, /* Set your desired max width here */
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
                                <Link to="/explore">Explore Events</Link>
                                <Link to="/about">Contact Us</Link>

                                <Link to="/myTickets" className="attendee-btn">
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
                        {userType === 'organiser' && (
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