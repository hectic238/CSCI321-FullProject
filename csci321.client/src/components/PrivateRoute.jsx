import { Navigate } from 'react-router-dom';
import {getCookie} from "@/components/Cookie.jsx"; 

const PrivateRoute = ({ children, allowedUserType }) => {

    const userType = getCookie("userType")
    if (!userType || userType !== allowedUserType) {
        return <Navigate to="/home" />;
    }

    return children; 
};

export default PrivateRoute;
