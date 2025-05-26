"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider,
    Button,
    IconButton,
    FormControlLabel,
    Switch,
    useMediaQuery,
    useTheme,
    Tabs,
    Tab,
    Snackbar,
    Alert,
} from "@mui/material"
import {
    DarkMode,
    LightMode,
    Celebration,
    Groups,
    Lightbulb,
    Favorite,
    LinkedIn,
    Twitter,
    Facebook,
    Instagram,
    GitHub,
    Info,
    ContactSupport,
    CheckCircle,
} from "@mui/icons-material"
import Header from "../components/Header"
import Navbar from "../components/Navbar"
import background from "../assets/background.png"

const AboutUs = () => {
    const [activeTab, setActiveTab] = useState(0)
    const [darkMode, setDarkMode] = useState(false)
    const [success, setSuccess] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const navigate = useNavigate()

    const primaryColor = "#ff4d4f"

    useEffect(() => {
        document.title = activeTab === 0 ? "About Us | PLANIT" : "Contact Us | PLANIT"
        const savedDarkMode = localStorage.getItem("darkMode") === "true"
        setDarkMode(savedDarkMode)
    }, [activeTab])

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

    const handleTabChange = (event, newValue) => {
        if (newValue === 1) {
            navigate("/contactus")
        } else {
            setActiveTab(newValue)
        }
    }

    const values = [
        {
            title: "Innovation",
            description: "We continuously innovate to improve the event experience for organizers and attendees alike.",
            icon: <Lightbulb fontSize="large" sx={{ color: primaryColor }} />,
        },
        {
            title: "Community",
            description: "Building strong connections through events is at the core of our platform and mission.",
            icon: <Groups fontSize="large" sx={{ color: primaryColor }} />,
        },
        {
            title: "Support",
            description: "We support event organizers with tools and resources to make their events successful.",
            icon: <Favorite fontSize="large" sx={{ color: primaryColor }} />,
        },
        {
            title: "Engagement",
            description: "We focus on creating engaging, enjoyable experiences for every user on our platform.",
            icon: <Celebration fontSize="large" sx={{ color: primaryColor }} />,
        },
    ]

    const socialLinks = [
        { icon: <Facebook />, name: "Facebook", url: "https://facebook.com" },
        { icon: <Twitter />, name: "Twitter", url: "https://twitter.com" },
        { icon: <Instagram />, name: "Instagram", url: "https://instagram.com" },
        { icon: <LinkedIn />, name: "LinkedIn", url: "https://linkedin.com" },
        { icon: <GitHub />, name: "GitHub", url: "https://github.com" },
    ]

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

            <Container maxWidth="lg" sx={{ flex: 1, position: "relative", zIndex: 1, pt: 4, pb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            "& .MuiTab-root": {
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                textTransform: "none",
                                minWidth: 120,
                                "&.Mui-selected": {
                                    color: primaryColor,
                                },
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: primaryColor,
                            },
                        }}
                    >
                        <Tab icon={<Info />} iconPosition="start" label="About Us" />
                        <Tab icon={<ContactSupport />} iconPosition="start" label="Contact Us" />
                    </Tabs>

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
                    <Box sx={{ p: { xs: 4, md: 6 }, textAlign: "center", backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8" }}>
                        <Typography variant="h2" fontWeight="bold" gutterBottom color={primaryColor}>
                            About <span style={{ color: darkMode ? "#e0e0e0" : "#333333" }}>PLANIT</span>
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{ maxWidth: 800, mx: "auto", mb: 4 }}
                            color={darkMode ? "#cccccc" : "#666666"}
                        >
                            Your go-to platform for managing and discovering exciting events!
                        </Typography>
                        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
                            {[
                                { label: "Events Hosted", value: "10,000+" },
                                { label: "Happy Users", value: "500,000+" },
                                { label: "Countries", value: "25+" },
                                { label: "Team Members", value: "50+" },
                            ].map((stat, index) => (
                                <Grid item xs={6} sm={3} key={index}>
                                    <Card
                                        sx={{
                                            backgroundColor: darkMode ? "#333" : "white",
                                            color: darkMode ? "#e0e0e0" : "#333333",
                                            p: 2,
                                            border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography variant="h3" fontWeight="bold" color={primaryColor}>
                                            {stat.value}
                                        </Typography>
                                        <Typography>{stat.label}</Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Divider sx={{ mx: 4 }} />

                    <Box sx={{ p: { xs: 4, md: 6 } }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center" color={primaryColor}>
                            Our Values
                        </Typography>
                        <Typography
                            variant="body1"
                            paragraph
                            textAlign="center"
                            sx={{ maxWidth: 800, mx: "auto", mb: 4 }}
                            color={darkMode ? "#cccccc" : "#666666"}
                        >
                            These core values guide everything we do at PLANIT, from product development to customer support.
                        </Typography>

                        <Grid container spacing={3}>
                            {values.map((value, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <Card
                                        sx={{
                                            backgroundColor: darkMode ? "#2a2a2a" : "white",
                                            color: darkMode ? "#e0e0e0" : "#333333",
                                            height: "100%",
                                            p: 3,
                                            textAlign: "center",
                                            transition: "transform 0.2s ease-in-out",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: darkMode
                                                    ? "0 8px 24px rgba(0,0,0,0.5)"
                                                    : "0 8px 24px rgba(0,0,0,0.1)",
                                            },
                                            border: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                                        }}
                                    >
                                        <Box sx={{ mb: 2 }}>{value.icon}</Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body2" color={darkMode ? "#cccccc" : "#666666"}>
                                            {value.description}
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box sx={{ p: { xs: 4, md: 6 }, textAlign: "center", backgroundColor: darkMode ? "#333" : "#f8f8f8" }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color={primaryColor}>
                            Join the PLANIT Community
                        </Typography>
                        <Typography
                            variant="body1"
                            paragraph
                            sx={{ maxWidth: 800, mx: "auto", mb: 4 }}
                            color={darkMode ? "#cccccc" : "#666666"}
                        >
                            Whether you're looking to host events or discover new experiences, PLANIT is here to help you connect
                            with like-minded individuals.
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    backgroundColor: primaryColor,
                                    "&:hover": {
                                        backgroundColor: "#ff7875",
                                    },
                                    px: 4,
                                    py: 1.5,
                                }}
                            >
                                Explore Events
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate("/contactus")}
                                sx={{
                                    borderColor: primaryColor,
                                    color: primaryColor,
                                    "&:hover": {
                                        borderColor: "#ff7875",
                                        backgroundColor: "rgba(255, 77, 79, 0.04)",
                                    },
                                    px: 4,
                                    py: 1.5,
                                }}
                            >
                                Contact Us
                            </Button>
                        </Box>

                        <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
                            {socialLinks.map((social, index) => (
                                <IconButton
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        color: primaryColor,
                                        backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                        "&:hover": {
                                            backgroundColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                                        },
                                    }}
                                >
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default AboutUs
