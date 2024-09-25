import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedUserType }) => {
    const user = JSON.parse(localStorage.getItem('user')); // Retrieve the user from local storage

    // Check if the user is logged in and if their userType matches the allowed type
    if (!user || user.user.userType !== allowedUserType) {
        // If the user is not authenticated or doesn't match the allowed type, redirect them to a login page
        return <Navigate to="/home" />;
    }

    return children; // Allow access to the page if the user is authorized
};

export default PrivateRoute;
