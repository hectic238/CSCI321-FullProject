"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
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
    TextField,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    CircularProgress,
    Tooltip,
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
    Email,
    CheckCircle,
    Facebook,
    Instagram,
    GitHub,
    Phone,
    Chat,
    Send,
    LocationOn,
    Info,
    ContactSupport,
} from "@mui/icons-material"
import Header from "../components/Header"
import Navbar from "../components/Navbar"
import background from "../assets/background.png"
import { sendMessage } from "@/components/messageFunctions.jsx"
import { generateObjectId } from "@/components/Functions.jsx"

const AboutUs = () => {
    const [activeTab, setActiveTab] = useState(0)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        messageId: "",
        subject: "",
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const { user, isAuthenticated } = useAuth0()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const isTablet = useMediaQuery(theme.breakpoints.down("md"))

    const primaryColor = "#ff4d4f"

    // Initialize form with user data if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const nameParts = user.name ? user.name.split(" ") : ["", ""]
            setFormData((prev) => ({
                ...prev,
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                email: user.email || "",
            }))
        }
    }, [isAuthenticated, user])

    // Check for saved dark mode preference
    useEffect(() => {
        document.title = activeTab === 0 ? "About Us | PLANIT" : "Contact Us | PLANIT"
        const savedDarkMode = localStorage.getItem("darkMode") === "true"
        setDarkMode(savedDarkMode)
    }, [activeTab])

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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
        document.title = newValue === 0 ? "About Us | PLANIT" : "Contact Us | PLANIT"
    }

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }))

        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required"
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required"
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required"
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            formData.messageId = generateObjectId()
            const response = await sendMessage(formData)

            if (response) {
                setSuccess(true)
                // Reset form after successful submission
                setFormData({
                    firstName: isAuthenticated ? formData.firstName : "",
                    lastName: isAuthenticated ? formData.lastName : "",
                    email: isAuthenticated ? formData.email : "",
                    message: "",
                    messageId: "",
                    subject: "",
                })
            }
        } catch (error) {
            console.error("Error sending message:", error)
            setErrors({ submit: "Failed to send message. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    // Company values
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

    // Contact options
    const contactOptions = [
        {
            icon: <Email fontSize="large" sx={{ color: primaryColor }} />,
            title: "EMAIL",
            description: "Send us an email here:",
            contact: "help.planitevents@outlook.com",
            action: "mailto:help.planitevents@outlook.com",
        },
        {
            icon: <Phone fontSize="large" sx={{ color: primaryColor }} />,
            title: "CALL",
            description: "Call us here:",
            contact: "+61 2 1234 5678",
            action: "tel:+61212345678",
        },
        {
            icon: <Chat fontSize="large" sx={{ color: primaryColor }} />,
            title: "CHAT",
            description: "Chat with us Monday – Friday",
            contact: "9am–5pm AEDT",
            action: "#chat",
        },
        {
            icon: <LocationOn fontSize="large" sx={{ color: primaryColor }} />,
            title: "VISIT",
            description: "Our office location:",
            contact: "123 Event Street, Sydney NSW 2000",
            action: "https://maps.google.com/?q=Sydney+NSW+2000",
        },
    ]

    // Stats
    const stats = [
        { label: "Events Hosted", value: "10,000+" },
        { label: "Happy Users", value: "500,000+" },
        { label: "Countries", value: "25+" },
        { label: "Team Members", value: "50+" },
    ]

    // Social links
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
                        <Tab icon={<Info />} iconPosition="start" label="About Us" id="tab-0" aria-controls="tabpanel-0" />
                        <Tab
                            icon={<ContactSupport />}
                            iconPosition="start"
                            label="Contact Us"
                            id="tab-1"
                            aria-controls="tabpanel-1"
                        />
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
                    {/* About Us Tab */}
                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 0}
                        id="tabpanel-0"
                        aria-labelledby="tab-0"
                        sx={{ display: activeTab !== 0 ? "none" : "block" }}
                    >
                        {/* Hero Section */}
                        <Box
                            sx={{
                                p: { xs: 4, md: 6 },
                                textAlign: "center",
                                backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                                borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                            }}
                        >
                            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom color={primaryColor}>
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
                                {stats.map((stat, index) => (
                                    <Grid item xs={6} sm={3} key={index}>
                                        <Card
                                            sx={{
                                                backgroundColor: darkMode ? "#333" : "white",
                                                color: darkMode ? "#e0e0e0" : "#333333",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                p: 2,
                                                border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                                            }}
                                        >
                                            <Typography variant="h3" fontWeight="bold" color={primaryColor}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body1" color={darkMode ? "#cccccc" : "#666666"}>
                                                {stat.label}
                                            </Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Mission Section */}
                        <Box sx={{ p: { xs: 4, md: 6 } }}>
                            <Grid container spacing={4} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom color={primaryColor}>
                                        Our Mission
                                    </Typography>
                                    <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"}>
                                        At <strong style={{ color: primaryColor }}>PLANIT</strong>, our mission is to provide an easy-to-use
                                        and powerful event management platform that brings people together through memorable experiences.
                                    </Typography>
                                    <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"}>
                                        Whether you're an event organizer or a passionate attendee, we strive to offer a seamless,
                                        user-friendly interface that makes event planning and participation effortless.
                                    </Typography>
                                    <Typography variant="body1" paragraph color={darkMode ? "#e0e0e0" : "#333333"}>
                                        We believe in the power of community and connections, and we're committed to supporting event
                                        organizers by providing them with the tools they need to host successful and engaging events.
                                    </Typography>
                                    <Typography variant="body1" color={darkMode ? "#e0e0e0" : "#333333"}>
                                        Our platform allows users to browse events, get the latest updates, and buy tickets for a variety of
                                        events from concerts to conferences. We're here to make sure you never miss out on something amazing
                                        happening in your city.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box
                                        component="img"
                                        src="src/assets/logo_slogan.png"
                                        alt="PLANIT Mission"
                                        sx={{
                                            width: "100%",
                                            height: "auto",
                                            borderRadius: 2,
                                            boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ mx: 4 }} />

                        {/* Values Section */}
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
                                                height: "100%",
                                                backgroundColor: darkMode ? "#2a2a2a" : "white",
                                                color: darkMode ? "#e0e0e0" : "#333333",
                                                transition: "transform 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: darkMode ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.1)",
                                                },
                                                border: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                                <Box sx={{ mb: 2 }}>{value.icon}</Box>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                    gutterBottom
                                                    color={darkMode ? "#e0e0e0" : "#333333"}
                                                >
                                                    {value.title}
                                                </Typography>
                                                <Typography variant="body2" color={darkMode ? "#cccccc" : "#666666"}>
                                                    {value.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                        {/* CTA Section */}
                        <Box
                            sx={{
                                p: { xs: 4, md: 6 },
                                textAlign: "center",
                                backgroundColor: darkMode ? "#333" : "#f8f8f8",
                                borderTop: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                            }}
                        >
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
                                    onClick={() => setActiveTab(1)}
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
                    </Box>

                    {/* Contact Us Tab */}
                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 1}
                        id="tabpanel-1"
                        aria-labelledby="tab-1"
                        sx={{ display: activeTab !== 1 ? "none" : "block" }}
                    >
                        {/* Header Section */}
                        <Box
                            sx={{
                                p: 4,
                                textAlign: "center",
                                backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                                borderBottom: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                            }}
                        >
                            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color={primaryColor}>
                                Contact Us
                            </Typography>
                            <Typography variant="body1" color={darkMode ? "#cccccc" : "#666666"} sx={{ maxWidth: 700, mx: "auto" }}>
                                We'd love to hear from you! Please reach out using any of the methods below or fill out the contact
                                form.
                            </Typography>
                        </Box>

                        {/* Contact Options */}
                        <Box sx={{ p: 4 }}>
                            <Grid container spacing={3}>
                                {contactOptions.map((option, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}>
                                        <Card
                                            sx={{
                                                height: "100%",
                                                backgroundColor: darkMode ? "#2a2a2a" : "white",
                                                color: darkMode ? "#e0e0e0" : "#333333",
                                                transition: "transform 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: darkMode ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.1)",
                                                },
                                                border: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                                <Box sx={{ mb: 2 }}>{option.icon}</Box>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom color={primaryColor}>
                                                    {option.title}
                                                </Typography>
                                                <Typography variant="body2" color={darkMode ? "#cccccc" : "#666666"} gutterBottom>
                                                    {option.description}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight="medium"
                                                    sx={{ mb: 2 }}
                                                    color={darkMode ? "#e0e0e0" : "#333333"}
                                                >
                                                    {option.contact}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    href={option.action}
                                                    target={option.title === "VISIT" ? "_blank" : undefined}
                                                    sx={{
                                                        borderColor: primaryColor,
                                                        color: primaryColor,
                                                        "&:hover": {
                                                            borderColor: "#ff7875",
                                                            backgroundColor: "rgba(255, 77, 79, 0.04)",
                                                        },
                                                    }}
                                                >
                                                    {option.title === "EMAIL"
                                                        ? "Send Email"
                                                        : option.title === "CALL"
                                                            ? "Call Now"
                                                            : option.title === "CHAT"
                                                                ? "Start Chat"
                                                                : "View Map"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Divider sx={{ mx: 4 }} />

                        {/* Message Form Section */}
                        <Box sx={{ p: 4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom color={primaryColor}>
                                        Send Us a Message
                                    </Typography>
                                    <Typography variant="body1" paragraph color={darkMode ? "#cccccc" : "#666666"}>
                                        If you have any questions, feedback, or issues with our application, please fill out this form and
                                        we'll get back to you as soon as possible.
                                    </Typography>

                                    <form onSubmit={handleSubmit}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="First Name"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                                    error={!!errors.firstName}
                                                    helperText={errors.firstName}
                                                    required
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            color: darkMode ? "#e0e0e0" : "inherit",
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#555555" : "rgba(0,0,0,0.23)",
                                                        },
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#777777" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiFormHelperText-root": {
                                                            color: errors.firstName ? "#f44336" : darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Last Name"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                                    error={!!errors.lastName}
                                                    helperText={errors.lastName}
                                                    required
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            color: darkMode ? "#e0e0e0" : "inherit",
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#555555" : "rgba(0,0,0,0.23)",
                                                        },
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#777777" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiFormHelperText-root": {
                                                            color: errors.lastName ? "#f44336" : darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                    required
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            color: darkMode ? "#e0e0e0" : "inherit",
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#555555" : "rgba(0,0,0,0.23)",
                                                        },
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#777777" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiFormHelperText-root": {
                                                            color: errors.email ? "#f44336" : darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Subject"
                                                    value={formData.subject}
                                                    onChange={(e) => handleInputChange("subject", e.target.value)}
                                                    error={!!errors.subject}
                                                    helperText={errors.subject}
                                                    required
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            color: darkMode ? "#e0e0e0" : "inherit",
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#555555" : "rgba(0,0,0,0.23)",
                                                        },
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#777777" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiFormHelperText-root": {
                                                            color: errors.subject ? "#f44336" : darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Message"
                                                    multiline
                                                    rows={6}
                                                    value={formData.message}
                                                    onChange={(e) => handleInputChange("message", e.target.value)}
                                                    error={!!errors.message}
                                                    helperText={errors.message}
                                                    required
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            color: darkMode ? "#e0e0e0" : "inherit",
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#555555" : "rgba(0,0,0,0.23)",
                                                        },
                                                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: darkMode ? "#777777" : "rgba(0,0,0,0.6)",
                                                        },
                                                        "& .MuiFormHelperText-root": {
                                                            color: errors.message ? "#f44336" : darkMode ? "#aaaaaa" : "rgba(0,0,0,0.6)",
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                {errors.submit && (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        {errors.submit}
                                                    </Alert>
                                                )}
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    fullWidth
                                                    disabled={loading}
                                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                                    sx={{
                                                        py: 1.5,
                                                        backgroundColor: primaryColor,
                                                        "&:hover": {
                                                            backgroundColor: "#ff7875",
                                                        },
                                                    }}
                                                >
                                                    {loading ? "Sending..." : "Send Message"}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ height: "100%" }}>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom color={primaryColor}>
                                            Our Location
                                        </Typography>
                                        <Typography variant="body1" paragraph color={darkMode ? "#cccccc" : "#666666"}>
                                            Visit our office in the heart of Sydney. We're open Monday to Friday, 9am to 5pm AEDT.
                                        </Typography>

                                        {/* Map Embed */}
                                        <Box
                                            sx={{
                                                height: 300,
                                                mb: 3,
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                border: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                                            }}
                                        >
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53255.65642814068!2d151.17990354863284!3d-33.86882020000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae401e8b983f%3A0x5017d681632ccc0!2sSydney%20NSW%202000%2C%20Australia!5e0!3m2!1sen!2sus!4v1684146526872!5m2!1sen!2sus"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="PLANIT Office Location"
                                            ></iframe>
                                        </Box>

                                        <Typography variant="h6" gutterBottom color={primaryColor}>
                                            Follow Us
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                                            {socialLinks.map((social, index) => (
                                                <Tooltip title={social.name} key={index}>
                                                    <IconButton
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
                                                </Tooltip>
                                            ))}
                                        </Box>

                                        <Typography variant="h6" gutterBottom color={primaryColor}>
                                            Our Support Team
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            {["Sarah", "Michael", "Jessica", "David"].map((name, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        p: 1,
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            mb: 1,
                                                            backgroundColor: primaryColor,
                                                        }}
                                                    >
                                                        {name.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight="medium" color={darkMode ? "#e0e0e0" : "#333333"}>
                                                        {name}
                                                    </Typography>
                                                    <Typography variant="caption" color={darkMode ? "#aaaaaa" : "#666666"}>
                                                        Support Agent
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* FAQ Section */}
                        <Box
                            sx={{
                                p: 4,
                                backgroundColor: darkMode ? "#2a2a2a" : "#f8f8f8",
                                borderTop: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                            }}
                        >
                            <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center" color={primaryColor}>
                                Frequently Asked Questions
                            </Typography>
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                {[
                                    {
                                        question: "How quickly will I receive a response?",
                                        answer: "We aim to respond to all inquiries within 24-48 hours during business days.",
                                    },
                                    {
                                        question: "Can I track the status of my inquiry?",
                                        answer: "Yes, you'll receive a confirmation email with a reference number to track your inquiry.",
                                    },
                                    {
                                        question: "Do you offer phone support?",
                                        answer: "Yes, our support team is available by phone Monday to Friday, 9am to 5pm AEDT.",
                                    },
                                    {
                                        question: "How can I report a technical issue?",
                                        answer:
                                            "You can use this contact form and select 'Technical Issue' as the subject, or email our support team directly.",
                                    },
                                ].map((faq, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Card
                                            sx={{
                                                backgroundColor: darkMode ? "#333333" : "white",
                                                color: darkMode ? "#e0e0e0" : "#333333",
                                                height: "100%",
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom color={primaryColor}>
                                                    {faq.question}
                                                </Typography>
                                                <Typography variant="body2" color={darkMode ? "#cccccc" : "#666666"}>
                                                    {faq.answer}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </Paper>
            </Container>

            {/* Success Snackbar */}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    icon={<CheckCircle />}
                    severity="success"
                    sx={{
                        width: "100%",
                        "& .MuiAlert-message": {
                            color: "#333333", // Ensure text is dark on success background
                        },
                    }}
                    onClose={() => setSuccess(false)}
                >
                    Your message has been sent successfully! We'll get back to you soon.
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default AboutUs
