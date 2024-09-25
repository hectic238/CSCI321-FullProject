import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home';
import About from './pages/About';
import ExploreEvents from "./pages/ExploreEvents.jsx";
import Layout from "./components/Layout.jsx";
import AttendeeLogin from "./pages/AttendeeLogin.jsx";
import { useEffect } from 'react';
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




const App = () => {

    const location = useLocation();

    useEffect(() => {
        // Check if the current route requires scrolling or not
        if (location.pathname === '/explore') {
            document.body.classList.add('scrollable'); // Allow scrolling
            document.body.classList.remove('no-scroll'); // Ensure no-scroll is removed
        }
        else if (location.pathname === '/host') {
            document.body.classList.add('scrollable'); // Allow scrolling
            document.body.classList.remove('no-scroll'); // Ensure no-scroll is removed
        } else {
            document.body.classList.add('no-scroll'); // Prevent scrolling
            document.body.classList.remove('scrollable'); // Ensure scrollable is removed
        }

        // Clean up function to reset styles when component unmounts
        return () => {
            document.body.classList.remove('scrollable');
            document.body.classList.remove('no-scroll');
        };
    }, [location.pathname]);




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
