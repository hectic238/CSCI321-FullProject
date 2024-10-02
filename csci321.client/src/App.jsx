import './App.css'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from './pages/Home';
import About from './pages/About';
import ExploreEvents from "./pages/ExploreEvents.jsx";
import Layout from "./components/Layout.jsx";
import AttendeeLogin from "./pages/AttendeeLogin.jsx";
import { useEffect, useState } from 'react';
import OrganiserLogin from "./pages/OrganiserLogin.jsx";
import HostEventDetails from './pages/HostEvent/Details';
import HostEventBanner from './pages/HostEvent/Banner'; // Create these components similarly
import HostEventTicketing from './pages/HostEvent/Ticketing'; // Create these components similarly
import HostEventReview from './pages/HostEvent/Review';
import HostEvent from "./pages/HostEvent/HostEvent.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProfileDetails from "./pages/ProfileDetails.jsx"; // Create these components similarly
import PrivateRoute from './components/PrivateRoute';
import MyEvents from "./pages/MyEvents.jsx";
import MyTickets from "./pages/MyTickets.jsx";





const App = () => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
      // Clear user data from localStorage and update state
      
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate("/home");
      navigate(0); // Redirect to home after logout
      
    };
    // Function to decode the JWT token and extract the expiration time (exp)
    const getTokenExpirationTime = (token) => {
        if (!token) return null;
      
        const base64Url = token.split('.')[1]; // Extract the payload part of the JWT
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace URL-safe characters
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      
        const payload = JSON.parse(jsonPayload);
      
        // Return the expiration time (exp), which is in seconds since the Unix epoch
        return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
      };
    
    // Track user activity (idle timeout)
    const useIdleTimer = (timeout, onIdle) => {
        useEffect(() => {
          let timer;
      
          const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(onIdle, timeout);
          };
      
          window.addEventListener("mousemove", resetTimer);
          window.addEventListener("keydown", resetTimer);
      
          resetTimer(); // Initialize timer
      
          return () => {
            clearTimeout(timer);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
          };
        }, [timeout, onIdle]);
      };

    // Handle token refresh
  const refreshAccessToken = async () => {
    try {
      const response = await fetch("http://localhost:5144/refreshToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshToken}`, // Add the refresh token to Authorization header
          "Access-Token": accessToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken); // Update token in localStorage
      } else {
        console.log("Failed to refresh token");
        setIsLoggedOut(true); // Log out user if the refresh fails
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsLoggedOut(true);
    }
  };

  // Detect user inactivity (5 minutes = 300000ms)
  useIdleTimer(300000, () => {
    console.log("User is idle for more than 5 minutes, logging out.");
    setIsLoggedOut(true);
  });

    useEffect(() => {
      const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    // Use the state setter functions
    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);

    const tokenExpirationTime = getTokenExpirationTime(accessToken);

    // On any page refresh, refresh the accessToken
    if(accessToken) {
      refreshAccessToken();
    }
    

      // if(isLoggedOut) {
      //   console.log("handling Logout");
      //   handleLogout();
      // } 
      
      const interval = setInterval(() => {
        
        if (accessToken) {
          if (tokenExpirationTime < Date.now()) {
            refreshAccessToken();
          }
        }
      }, 90000); // Check every minute
      

        


        // Check if the current route requires scrolling or not
        if (location.pathname === '/explore') {
            document.body.classList.add('scrollable'); // Allow scrolling
            document.body.classList.remove('no-scroll'); // Ensure no-scroll is removed
        }
        else if (location.pathname === '/host') {
            document.body.classList.add('scrollable'); // Allow scrolling
            document.body.classList.remove('no-scroll'); // Ensure no-scroll is removed
        } else if (location.pathname === '/host') {
          document.body.classList.add('scrollable'); // Allow scrolling
          document.body.classList.remove('no-scroll'); // Ensure no-scroll is removed
       } else {
            document.body.classList.add('scrollable'); // Prevent scrolling
            document.body.classList.remove('no-scroll'); // Ensure scrollable is removed
        }

        // Clean up function to reset styles when component unmounts
        return () => {
            document.body.classList.remove('scrollable');
            document.body.classList.remove('no-scroll');
            clearInterval(interval);
        };
    }, [location.pathname, accessToken, refreshToken, isLoggedOut]);




    return (
        <div>
            <main className="main-content">
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/explore" element={<ExploreEvents />} />
                    <Route path="/attendeeLogin" element={<AttendeeLogin />} />
                    <Route path="/organiserLogin" element={<OrganiserLogin />} />
                    <Route path="/signUp" element={<SignUp />} />
                    <Route path="/host" element={
                        <PrivateRoute allowedUserType="organiser">
                            <HostEvent />
                        </PrivateRoute>}
                    />
                    <Route path="/host/details" element={
                        <PrivateRoute allowedUserType="organiser">
                            <HostEventDetails />
                        </PrivateRoute>} />
                    <Route path="/host/banner" element={<HostEventBanner />} />
                    <Route path="/host/ticketing" element={<HostEventTicketing />} />
                    <Route path="/host/review" element={<HostEventReview />} />
                    <Route path="/profile" element={<ProfileDetails />} />
                    <Route path="/myEvents" element={
                        <PrivateRoute allowedUserType="organiser">
                            <MyEvents />
                        </PrivateRoute>
                    }
                    />
                    <Route path="/myTickets" element={
                    <PrivateRoute allowedUserType="attendee">
                        <MyTickets />
                    </PrivateRoute>
                    }
                    />
                </Routes>
            </main>
        </div>
    )
}

// Wrap App with BrowserRouter in the main index file
const Main = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

export default Main
