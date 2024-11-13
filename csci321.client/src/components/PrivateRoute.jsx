import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Import the jwt-decode library

const PrivateRoute = ({ children, allowedUserType }) => {
    let userType = null; // Retrieve the user from local storage

    const token = localStorage.getItem('accessToken');
    if (token) {
        const decodedToken = jwtDecode(token);
        userType = decodedToken['userType']; // Set userType from decoded token
    }
    // Check if the user is logged in and if their userType matches the allowed type
    if (!userType || userType !== allowedUserType) {
        // If the user is not authenticated or doesn't match the allowed type, redirect them to a login page
        return <Navigate to="/home" />;
    }

    return children; // Allow access to the page if the user is authorized
};

export default PrivateRoute;
