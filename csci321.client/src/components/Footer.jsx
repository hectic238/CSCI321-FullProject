export const Footer = () => {
    return (
        <div style={{
            backgroundColor: "#f5f5f5",
            color: "black",
            padding: "20px",
            textAlign: "center",
            position: "relative",
            bottom: "0",
            width: "100%",
            marginTop: "50px",
            borderTop: "1px solid #ccc"
        }}>
            <h2 style={{ marginBottom: "10px" }}>PlanIt</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "10px" }}>
                <button style={{
                    backgroundColor: "#444",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: "5px"
                }}>
                    About Us
                </button>
                <button style={{
                    backgroundColor: "#444",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: "5px"
                }}>
                    Contact
                </button>
                <button style={{
                    backgroundColor: "#444",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: "5px"
                }}>
                    Privacy Policy
                </button>
            </div>
            <p style={{ fontSize: "0.9rem", opacity: "0.7" }}>© {new Date().getFullYear()} PlanIt. All rights reserved.</p>
        </div>
    );
};
