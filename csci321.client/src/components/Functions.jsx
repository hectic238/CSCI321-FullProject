import {jwtDecode} from 'jwt-decode'; // Import the jwt-decode library


export const getUserIdFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['sub'];
    }
}
export const getEmailFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['email'];
    }
}
export const getUserTypeFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['userType'];
    }
}