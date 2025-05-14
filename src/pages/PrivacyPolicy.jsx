"use client"

import { useState, useEffect } from "react"
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Link,
    FormControlLabel,
    Switch,
    useMediaQuery,
    useTheme,
    Breadcrumbs,
} from "@mui/material"
import {
    DarkMode,
    LightMode,
    Security,
    Info,
    Person,
    DataUsage,
    Share,
    Lock,
    Gavel,
    Email,
    Circle,
} from "@mui/icons-material"
import Header from "../components/Header"
import Navbar from "../components/Navbar"
import background from "../assets/background.png"

const PrivacyPolicy = () => {
    const [darkMode, setDarkMode] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const primaryColor = "#ff4d4f"

    // Check for saved dark mode preference
    useEffect(() => {
        document.title = "Privacy Policy | PLANIT"
        const savedDarkMode = localStorage.getItem("darkMode") === "true"
        setDarkMode(savedDarkMode)
    }, [])

    // Apply dark mode to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark")
        } else {
            document.body.classList.remove("dark")
        }
        localStorage.setItem("darkMode", darkMode.toString())
    }, [darkMode])

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode)
    }

    // Section icons
    const sectionIcons = {
        introduction: <Info />,
        collect: <Person />,
        use: <DataUsage />,
        share: <Share />,
        security: <Lock />,
        rights: <Gavel />,
        contact: <Email />,
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
                    zIndex: 0,
                },
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Header />
                <Navbar />
            </Box>

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pt: 4,
                    pb: 4,
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Breadcrumbs
                        aria-label="breadcrumb"
                        sx={{
                            color: "white",
                            "& .MuiBreadcrumbs-separator": {
                                color: "white",
                            },
                        }}
                    >
                        <Link color="inherit" href="/" sx={{ textDecoration: "none" }}>
                            Home
                        </Link>
                        <Typography color="white">Privacy Policy</Typography>
                    </Breadcrumbs>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={handleDarkModeToggle}
                                color="default"
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: primaryColor,
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                        backgroundColor: primaryColor,
                                    },
                                }}
                            />
                        }
                        label={darkMode ? <LightMode sx={{ color: "white" }} /> : <DarkMode sx={{ color: "white" }} />}
                    />
                </Box>

                <Paper
                    sx={{
                        backgroundColor: darkMode ? "#1a1a1a" : "white",
                        color: darkMode ? "#e0e0e0" : "#333333",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Header Section */}
                    <Box
                        sx={{
                            p: 4,
                            textAlign: "center",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                            borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Security sx={{ fontSize: 60, color: primaryColor, mb: 2 }} />
                        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color={primaryColor}>
                            Privacy Policy
                        </Typography>
                        <Typography variant="body1" color={darkMode ? "#cccccc" : "#666666"}>
                            Last updated: May 4, 2025
                        </Typography>
                    </Box>

                    {/* Content Section */}
                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                        {/* 1. Introduction */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.introduction}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    1. Introduction
                                </Typography>
                            </Box>
                            <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"} sx={{ ml: 7 }}>
                                We value your privacy. This Privacy Policy explains how we collect, use, and protect your information
                                when you use our platform.
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* 2. Information We Collect */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.collect}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    2. Information We Collect
                                </Typography>
                            </Box>
                            <List sx={{ ml: 7 }}>
                                {[
                                    "Personal details (e.g., name, email address, payment information)",
                                    "Event participation and ticket purchase history",
                                    "Usage data (e.g., device info, browser type, IP address)",
                                ].map((item, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                            <Circle sx={{ fontSize: 10, color: primaryColor }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" color={darkMode ? "#e0e0e0" : "#333333"}>
                                                    {item}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* 3. How We Use Your Information */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.use}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    3. How We Use Your Information
                                </Typography>
                            </Box>
                            <List sx={{ ml: 7 }}>
                                {[
                                    "To process ticket purchases and send confirmations",
                                    "To provide customer support and service updates",
                                    "To improve user experience and platform functionality",
                                ].map((item, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                            <Circle sx={{ fontSize: 10, color: primaryColor }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" color={darkMode ? "#e0e0e0" : "#333333"}>
                                                    {item}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* 4. Data Sharing */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.share}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    4. Data Sharing
                                </Typography>
                            </Box>
                            <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"} sx={{ ml: 7 }}>
                                We do not sell your personal data. We may share limited data with third parties like payment processors
                                and event organizers as needed to provide services.
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* 5. Data Security */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.security}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    5. Data Security
                                </Typography>
                            </Box>
                            <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"} sx={{ ml: 7 }}>
                                We implement industry-standard security measures to protect your information from unauthorized access or
                                disclosure.
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* 6. Your Rights */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.rights}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    6. Your Rights
                                </Typography>
                            </Box>
                            <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"} sx={{ ml: 7 }}>
                                You may access, update, or request deletion of your personal data by contacting us.
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* 7. Contact Us */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                    }}
                                >
                                    {sectionIcons.contact}
                                </Box>
                                <Typography variant="h5" fontWeight="bold" color={darkMode ? "#e0e0e0" : "#333333"}>
                                    7. Contact Us
                                </Typography>
                            </Box>
                            <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"} sx={{ ml: 7 }}>
                                If you have any questions about this Privacy Policy, you can contact us at{" "}
                                <Link
                                    href="mailto:help.planitevents@outlook.com"
                                    sx={{
                                        color: primaryColor,
                                        textDecoration: "none",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        },
                                    }}
                                >
                                    help.planitevents@outlook.com
                                </Link>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Footer Section */}
                    <Box
                        sx={{
                            p: 3,
                            textAlign: "center",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                            borderTop: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                        }}
                    >
                        <Typography variant="body2" color={darkMode ? "#cccccc" : "#666666"}>
                            © {new Date().getFullYear()} PLANIT. All rights reserved.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default PrivacyPolicy
