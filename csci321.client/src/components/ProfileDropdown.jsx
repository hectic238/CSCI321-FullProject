import React from 'react';
import './ProfileDropdown.css';
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react"; // Create a CSS file for styles



const ProfileDropdown = ({ onLogout }) => {

    const {
        user
    } = useAuth0();


    const navigate = useNavigate();

    const profileDetailsButton = () => {
        navigate("/profile");
    }
    return (
        <div className="profile-dropdown">
            <ul>
                <li > Hi! {user.name}</li>
                <li onClick={() => profileDetailsButton()}>Profile Details</li>
                <li onClick={onLogout}>Logout</li>
            </ul>
        </div>
    );
};;

export default ProfileDropdown;
