import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import {getURL} from "@/components/URL.jsx";

const RedirectPage = () => {
    const [token, setToken] = useState(null);
    const [favoriteColor, setFavoriteColor] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const urlParams = new URLSearchParams(window.location.search);
        const sessionToken = urlParams.get('session_token');

        if (sessionToken) {
            
            try {
                const decodedToken = jwtDecode(sessionToken);
                setToken(decodedToken);
                console.log(decodedToken);
            } catch (error) {
                console.error("Token decoding failed:", error);
            }
        }
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (favoriteColor) {
            // Update user metadata in Auth0 or your backend
            try {
                const continueUrl = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/continue?state=${token}`;

                // Perform the redirect to complete the flow
                window.location.href = continueUrl;
            } catch (error) {
                console.error('Error submitting favorite color:', error);
            }
        } else {
            alert('Please choose a favorite color.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Welcome, {token.email}!</h2>
            <p>We just need a bit more information before you're all set!</p>

            <form onSubmit={handleSubmit}>
                <label>
                    What is your favorite color?
                    <input
                        type="text"
                        value={favoriteColor}
                        onChange={(e) => setFavoriteColor(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default RedirectPage;
