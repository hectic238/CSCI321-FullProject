// eslint-disable-next-line react/prop-types
const Layout = ({ children }) => {
    return (
        <div className="layout">
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Layout;