"use client"

import { useEffect, useState } from "react"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { MuiTelInput } from "mui-tel-input"
import { Link } from "react-router-dom"
import CheckIcon from "@mui/icons-material/Check"
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Avatar,
    Divider,
    Fade,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
} from "@mui/material"
import background from "../../assets/background.png"
import InterestedPage from "../../components/InterestedPage"
import OrdersList from "../../components/OrdersList.jsx"
import { APIWithToken } from "../../components/API"
import {useAuth} from "react-oidc-context";
import {Check} from "@mui/icons-material";

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

const ProfileDetails = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const [activeTab, setActiveTab] = useState(0)
    const [userDetails, setUserDetails] = useState(null)
    const [orders, setOrders] = useState([])
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(true)

    const auth = useAuth();

    // Fetch user details
    const fetchUserDetails = async () => {
        try {
            const response = await APIWithToken( `user/fetch`, "GET")
            
            if(!response.ok) {
                console.error("Could not fetch the user details");
            }
            const data = await response.json()
            
            const {userId, ...updatedData} = data
            setUserDetails(updatedData)
            
            document.title = `${updatedData.name} | PLANIT`
        } catch (error) {
            setError("Failed to fetch user details")
        }
    }

    // Fetches user orders, enriches each order with corresponding event details and parsed tickets, and updates state
    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await APIWithToken( `order/getOrders`, "GET")

            if(!response.ok) {
                console.error("Could not fetch the orders");
            }
            const data = await response.json()
            
            // fetch event based on orders

            const updatedOrders = await Promise.all(data.map(async order => {

                const eventResponse = await APIWithToken(`event/fetchEventSummary/${order.eventId}`, "GET")
                
                if(!eventResponse) {
                    console.error("Could not fetch the event")
                }
                
                const event = await eventResponse.json();

                const parsedTickets = typeof order.tickets === "string" ? JSON.parse(order.tickets) : order.tickets;
                return {
                    ...order,
                    event,
                    tickets: parsedTickets,
                }
            }))
            
            setOrders(updatedOrders)
            
        } catch (error) {
            setError("Failed to fetch user details")
        } finally {
            setLoading(false)
        }
        
    }

    // Format date and time functions
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const options = { day: "numeric", month: "long", year: "numeric" }
        return date.toLocaleDateString("en-AU", options)
    }

    const formatTime = (timeString) => {
        if (timeString === undefined) {
            return ""
        }
        const [hours, minutes] = timeString.split(":")
        const formattedHours = hours % 12 || 12
        const ampm = hours >= 12 ? "PM" : "AM"
        return `${formattedHours}:${minutes} ${ampm}`
    }

    // Handle form changes
    const handleChange = (field, value) => {
        setUserDetails((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await APIWithToken(`user/update`, "PUT", userDetails)

            if(!response.ok) {
                console.error("Error updating user details");
            }
            
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            setError("Failed to update profile")
        }
    }

    // Fetch user details when authenticated
    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUserDetails();
            fetchOrders();
        }
    }, [auth.isAuthenticated])
    
    
   
    
    if (!userDetails) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 0,
                    },
                }}
            >
                <Typography variant="h6" color="white" sx={{ position: "relative", zIndex: 1 }}>
                    Loading...
                </Typography>
            </Box>
        )
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 0,
                },
            }}
        >
            {/* Fixed position navbar */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    width: "100%",
                }}
            >
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
                <Grid container spacing={3}>
                    {/* Sidebar */}
                    <Grid item xs={12} md={3}>
                        <Paper
                            sx={{
                                p: 3,
                                backgroundColor: "white",
                                borderRadius: 2,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                                <Avatar
                                    src={userDetails?.picture}
                                    alt={userDetails?.name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mb: 2,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    }}
                                />
                                <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
                                    {userDetails?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    {userDetails.userType === "attendee" ? "Event Attendee" : "Event Organiser"}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Tabs
                                orientation="vertical"
                                value={activeTab}
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                sx={{
                                    borderRight: 1,
                                    borderColor: "divider",
                                    "& .MuiTab-root": {
                                        alignItems: "flex-start",
                                        textAlign: "left",
                                        pl: 0,
                                        minHeight: "48px",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            color: "#ff4d4f",
                                        },
                                    },
                                    "& .Mui-selected": {
                                        color: "#ff4d4f !important",
                                        fontWeight: "bold",
                                    },
                                }}
                            >
                                <Tab label="Profile Details" />
                                
                                <Tab label="Notifications" />
                                {userDetails.userType === "attendee" && <Tab label="Order History" />}
                                {userDetails.userType === "attendee" && <Tab label="Interests" />}
                            </Tabs>
                        </Paper>
                    </Grid>

                    {/* Main Content */}
                    <Grid item xs={12} md={9}>
                        <Paper
                            sx={{
                                p: 3,
                                backgroundColor: "white",
                                borderRadius: 2,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            }}
                        >
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            {success && (
                                <Alert icon={<CheckIcon />} severity="success" sx={{ mb: 2 }}>
                                    Changes saved successfully
                                </Alert>
                            )}

                            {/* Profile Details Tab */}
                            {activeTab === 0 && (
                                <Fade in={true} timeout={500}>
                                    <Box>
                                        <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Typography variant="h5" fontWeight="bold" color="#ff4d4f">
                                                Profile Details
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Last updated: {formatDate(new Date().toISOString())}
                                            </Typography>
                                        </Box>

                                        <form onSubmit={handleSubmit}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <Card
                                                        sx={{
                                                            mb: 3,
                                                            bgcolor: "rgba(255, 77, 79, 0.05)",
                                                            border: "1px solid rgba(255, 77, 79, 0.1)",
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                                                                Email Address
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                value={auth.user.profile.email}
                                                                disabled
                                                                variant="outlined"
                                                                InputProps={{
                                                                    sx: {
                                                                        bgcolor: "white",
                                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                                            borderColor: "rgba(0, 0, 0, 0.12)",
                                                                        },
                                                                    },
                                                                }}
                                                                sx={{
                                                                    "& .MuiOutlinedInput-root": {
                                                                        borderRadius: 1,
                                                                    },
                                                                }}
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
                                                        Personal Information
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth variant="outlined">
                                                        <InputLabel>Title</InputLabel>
                                                        <Select
                                                            value={userDetails.title || ""}
                                                            label="Title"
                                                            onChange={(e) => handleChange("title", e.target.value)}
                                                            sx={{
                                                                height: "56px",
                                                                "& .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: "rgba(0, 0, 0, 0.23)",
                                                                },
                                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: "rgba(0, 0, 0, 0.87)",
                                                                },
                                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: "#ff4d4f",
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem value="Mr">Mr</MenuItem>
                                                            <MenuItem value="Mrs">Mrs</MenuItem>
                                                            <MenuItem value="Ms">Ms</MenuItem>
                                                            <MenuItem value="Dr">Dr</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Full Name"
                                                        value={userDetails.name}
                                                        onChange={(e) => handleChange("name", e.target.value)}
                                                        required
                                                        variant="outlined"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                height: "56px",
                                                                "& fieldset": {
                                                                    borderColor: "rgba(0, 0, 0, 0.23)",
                                                                },
                                                                "&:hover fieldset": {
                                                                    borderColor: "rgba(0, 0, 0, 0.87)",
                                                                },
                                                                "&.Mui-focused fieldset": {
                                                                    borderColor: "#ff4d4f",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
                                                        Contact Information
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Date of Birth"
                                                        type="date"
                                                        value={dayjs(userDetails.dateOfBirth).format("YYYY-MM-DD")}
                                                        onChange={(e) => handleChange("dateOfBirth", dayjs(e.target.value))}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                height: "56px",
                                                                "& fieldset": {
                                                                    borderColor: "rgba(0, 0, 0, 0.23)",
                                                                },
                                                                "&:hover fieldset": {
                                                                    borderColor: "rgba(0, 0, 0, 0.87)",
                                                                },
                                                                "&.Mui-focused fieldset": {
                                                                    borderColor: "#ff4d4f",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <MuiTelInput
                                                        fullWidth
                                                        label="Phone Number"
                                                        value={userDetails.phoneNumber || ""}
                                                        defaultCountry="AU"
                                                        onChange={(value) => handleChange("phoneNumber", value)}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                "& fieldset": {
                                                                    borderColor: "rgba(0, 0, 0, 0.23)",
                                                                },
                                                                "&:hover fieldset": {
                                                                    borderColor: "rgba(0, 0, 0, 0.87)",
                                                                },
                                                                "&.Mui-focused fieldset": {
                                                                    borderColor: "#ff4d4f",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Divider sx={{ my: 2 }} />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        sx={{
                                                            py: 1.5,
                                                            px: 4,
                                                            backgroundColor: "#ff4d4f",
                                                            "&:hover": {
                                                                backgroundColor: "#ff7875",
                                                                boxShadow: "0 4px 12px rgba(255, 77, 79, 0.3)",
                                                            },
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontWeight: 500,
                                                            fontSize: "1rem",
                                                            boxShadow: "0 2px 8px rgba(255, 77, 79, 0.2)",
                                                            transition: "all 0.3s ease",
                                                        }}
                                                    >
                                                        Save Changes
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        sx={{
                                                            py: 1.5,
                                                            px: 4,
                                                            ml: 2,
                                                            borderColor: "rgba(0, 0, 0, 0.23)",
                                                            color: "rgba(0, 0, 0, 0.87)",
                                                            "&:hover": {
                                                                borderColor: "rgba(0, 0, 0, 0.87)",
                                                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                                            },
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontWeight: 500,
                                                            fontSize: "1rem",
                                                        }}
                                                        onClick={() => fetchUserDetails()}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </Box>
                                </Fade>
                            )}

                            {/* Order History Tab */}
                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom fontWeight="bold" color="#ff4d4f">
                                        Order History
                                    </Typography>

                                    {loading ? (
                                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                            <CircularProgress sx={{ color: "#ff4d4f" }} />
                                        </Box>
                                    ) : orders.length === 0 ? (
                                        <Box sx={{ textAlign: "center", py: 4 }}>
                                            <Typography variant="body1" gutterBottom>
                                                No orders to display.
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to="/home#exploreEvents"
                                                variant="contained"
                                                sx={{
                                                    mt: 2,
                                                    backgroundColor: "#ff4d4f",
                                                    "&:hover": {
                                                        backgroundColor: "#ff7875",
                                                    },
                                                }}
                                            >
                                                Explore Events
                                            </Button>
                                        </Box>
                                    ) : (
                                        <OrdersList orders={orders} formatDate={formatDate} formatTime={formatTime} />
                                    )}
                                </Box>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 1 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom fontWeight="bold" color="#ff4d4f">
                                        Notifications
                                    </Typography>
                                    <Typography variant="body1">Manage your notification preferences.</Typography>
                                </Box>
                            )}

                            {/* Interests Tab */}
                            {activeTab === 3 && userDetails.userType === "attendee" && (
                                <Box>
                                    <Typography variant="h5" gutterBottom fontWeight="bold" color="#ff4d4f">
                                        Interests
                                    </Typography>
                                    <form onSubmit={handleSubmit}>
                                        <InterestedPage
                                            interests={userDetails.interests}
                                            onInterestsChange={(field, interest) => {
                                                // Toggling logic in the parent component:
                                                setUserDetails(prev => {
                                                    const currentInterests = prev.interests || [];
                                                    const updatedInterests = currentInterests.includes(interest)
                                                        ? currentInterests.filter(i => i !== interest)
                                                        : [...currentInterests, interest];
                                                    return { ...prev, interests: updatedInterests };
                                                });
                                            }}
                                        />

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                mt: 2,
                                                py: 1.5,
                                                backgroundColor: "#ff4d4f",
                                                "&:hover": {
                                                    backgroundColor: "#ff7875",
                                                },
                                            }}
                                        >
                                            Save Changes
                                        </Button>
                                    </form>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default ProfileDetails

