
import NewNavBar from './NewNavbar'; // Import your Navbar component
import './Layout.css'; // Optional: Import styles for the layout

// eslint-disable-next-line react/prop-types
const Layout = ({ children }) => {
    return (
        <div className="layout">
            <NewNavBar />
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Layout;