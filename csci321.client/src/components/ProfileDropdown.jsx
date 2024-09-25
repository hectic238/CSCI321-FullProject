import React from 'react';
import './ProfileDropdown.css';
import {useNavigate} from "react-router-dom"; // Create a CSS file for styles



const ProfileDropdown = ({ onLogout }) => {


    const navigate = useNavigate();

    const profileDetailsButton = () => {
        navigate("/profile");
    }
    return (
        <div className="profile-dropdown">
            <ul>
                <li onClick={() => profileDetailsButton()}>Profile Details</li>
                <li onClick={onLogout}>Logout</li>
            </ul>
        </div>
    );
};;

export default ProfileDropdown;
