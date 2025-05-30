import { Navigate } from 'react-router-dom';
import {getCookie} from "@/components/Cookie.jsx"; 

// used to determine the pages a user is allowed to access
const PrivateRoute = ({ children, allowedUserType }) => {

    const userType = getCookie("userType")
    if (!userType || userType !== allowedUserType) {
        return <Navigate to="/home" />;
    }

    return children; 
};

export default PrivateRoute;
