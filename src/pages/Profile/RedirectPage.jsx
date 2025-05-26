"use client"

import {useEffect, useState} from "react"
import InterestedPage from "@/components/InterestedPage.jsx"
import background from "../../assets/background.png"
import logoSmall from "../../assets/logo_small.png"
import dayjs from "dayjs"
import {MuiTelInput} from "mui-tel-input"
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs"
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers"
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Fade,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material"

import {useAuth} from "react-oidc-context";
import {getToken} from "@/components/getToken.jsx";
import {APIWithToken} from "@/components/API.js";
import Navbar from "@/components/Navbar.jsx";

const RedirectPage = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [accessToken, setAccessToken] = useState("")
    const [state, setState] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const auth = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        company: "",
        userType: "",
        tickets: [],
        title: "",
        phoneNumber: "",
        dateOfBirth: "",
        interests: [],
        createdDate: ""
    })

    // Handles input changes for the form, updating state for regular fields, dateOfBirth (as dayjs object), and toggling interests in an array
    const handleInputChange = (field, value) => {
        if (field === "dateOfBirth") {
            value = value ? dayjs(value) : null
        }

        if (field === "interests") {
            setFormData((prevData) => ({
                ...prevData,
                interests: prevData.interests.includes(value)
                    ? prevData.interests.filter((item) => item !== value)
                    : [...prevData.interests, value],
            }))
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [field]: value,
            }))
        }
    }

    // Waits until an access token is available in session storage, checking every 500ms before resolving
    const checkSessionStorage = () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const token = getToken();
                if (token) {
                    clearInterval(checkInterval);
                    resolve(token);
                }
            }, 500); // Check every 500ms
        });
    };

    // Checks if user already exists on component mount; redirects if so and manages loading state for UX
    useEffect(() => {
        
        const init = async () => {
            
            // Await for session storage to be updated with accessToken
            await checkSessionStorage();
            const checkUserResponse = await APIWithToken("user/checkExists", "GET");
            const data = await checkUserResponse.json();
            
            // Check if user exists already, if so then redirect to the home page
            if(data.exists === true) {
                window.location.href = '/';
            }
        }
        init();
        
        // Simulate a slightly longer loading for better UX
        setTimeout(() => {
            setLoading(false)
        }, 800)
    }, [])

    // Handles form submission for user sign-up, sends form data to API, manages loading state, and redirects on success
    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            
            formData.createdDate = new Date().toISOString();

            formData.dateOfBirth = formData.dateOfBirth.toISOString();
            
            const response = await APIWithToken("user/create", "PUT", formData);
            if(!response.ok) {
                throw new Error("Sign Up Failed");
            }
            
            if(response.status === 201)
            {
                window.location.href = '/';
            }
            
            await response.json()
        } catch (error) {
            alert("Sign up failed! " + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                }}
            >
                <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
                    <Navbar />
                </Box>
                <Container
                    maxWidth="sm"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                        position: "relative",
                        zIndex: 1,
                        mt: 8, // Add margin top to account for fixed navbar
                    }}
                >
                    <CircularProgress size={60} sx={{ color: "#ff4d4f", mb: 3 }} />
                    <Typography variant="h5" color="white" fontWeight="500">
                        Loading your profile...
                    </Typography>
                </Container>
            </Box>
        )
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    color: "white",
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                }}
            >
                {/* Fixed Navbar */}
                <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
                    <Navbar />
                </Box>

                <Container
                    maxWidth={false}
                    disableGutters
                    sx={{
                        flex: 1,
                        position: "relative",
                        zIndex: 1,
                        pt: { xs: 10, md: 12 }, // Increased padding top to account for fixed navbar
                        pb: { xs: 4, md: 6 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    {/* Logo and Welcome Section */}
                    <Fade in={true} timeout={800}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                mb: { xs: 4, md: 6 },
                                textAlign: "center",
                                width: "100%",
                            }}
                        >
                            <Avatar
                                src={logoSmall || "/placeholder.svg"}
                                alt="PlanIt Logo"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 3,
                                    boxShadow: "0 0 20px rgba(255, 77, 79, 0.5)",
                                    p: 2,
                                    bgcolor: "rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(10px)",
                                }}
                            />

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{
                                    mb: 1,
                                    background: "linear-gradient(90deg, #fff, #f0f0f0)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                }}
                            >
                                Welcome
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    maxWidth: 600,
                                    color: "rgba(255,255,255,0.8)",
                                    fontWeight: 400,
                                }}
                            >
                                We just need a bit more information before you're all set!
                                <br />
                                Please complete your profile below.
                            </Typography>
                        </Box>
                    </Fade>

                    {/* Form */}
                    <Fade in={true} timeout={1000}>
                        <Paper
                            elevation={8}
                            sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: 3,
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                width: "100%",
                                maxWidth: 740, // Adjusted width to match the screenshot
                                mx: "auto",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            }}
                        >
                            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h5" fontWeight="500" sx={{ mb: 3, color: "rgba(0,0,0,0.87)" }}>
                                            Complete Your Profile
                                        </Typography>
                                        <Divider sx={{ mb: 3, bgcolor: "rgba(0,0,0,0.1)" }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel id="user-type-label" sx={{ color: "rgba(0,0,0,0.7)" }}>
                                                User Type
                                            </InputLabel>
                                            <Select
                                                labelId="user-type-label"
                                                value={formData.userType}
                                                label="User Type"
                                                onChange={(e) => handleInputChange("userType", e.target.value)}
                                                sx={{
                                                    bgcolor: "white",
                                                    height: 56, // Increased height
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "rgba(0,0,0,0.2)",
                                                    },
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "rgba(0,0,0,0.3)",
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#ff4d4f",
                                                    },
                                                    color: "rgba(0,0,0,0.87)",
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            bgcolor: "white",
                                                            color: "rgba(0,0,0,0.87)",
                                                            "& .MuiMenuItem-root:hover": {
                                                                bgcolor: "rgba(255,77,79,0.1)",
                                                            },
                                                            "& .MuiMenuItem-root.Mui-selected": {
                                                                bgcolor: "rgba(255,77,79,0.2)",
                                                            },
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="" disabled>
                                                    Select an option
                                                </MenuItem>
                                                <MenuItem value="attendee">Attendee</MenuItem>
                                                <MenuItem value="organiser">Organiser</MenuItem>
                                            </Select>
                                            <FormHelperText sx={{ color: "rgba(0,0,0,0.6)" }}>
                                                Select whether you're attending or organizing events
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="Full Name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    bgcolor: "white",
                                                    height: 56, // Increased height for better text spacing
                                                    "& fieldset": {
                                                        borderColor: "rgba(0,0,0,0.2)",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "rgba(0,0,0,0.3)",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#ff4d4f",
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "rgba(0,0,0,0.7)",
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "rgba(0,0,0,0.87)",
                                                    padding: "14px 14px", // Increased padding for better text spacing
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Organizer-specific field */}
                                    {formData.userType === "organiser" && (
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Company Name"
                                                value={formData.company}
                                                onChange={(e) => handleInputChange("company", e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        bgcolor: "white",
                                                        height: 56, // Increased height
                                                        "& fieldset": {
                                                            borderColor: "rgba(0,0,0,0.2)",
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: "rgba(0,0,0,0.3)",
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: "#ff4d4f",
                                                        },
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        color: "rgba(0,0,0,0.7)",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        color: "rgba(0,0,0,0.87)",
                                                        padding: "14px 14px", // Increased padding
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    )}

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="title-label" sx={{ color: "rgba(0,0,0,0.7)" }}>
                                                Title
                                            </InputLabel>
                                            <Select
                                                labelId="title-label"
                                                value={formData.title}
                                                label="Title"
                                                onChange={(e) => handleInputChange("title", e.target.value)}
                                                sx={{
                                                    bgcolor: "white",
                                                    height: 56, // Increased height
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "rgba(0,0,0,0.2)",
                                                    },
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "rgba(0,0,0,0.3)",
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#ff4d4f",
                                                    },
                                                    color: "rgba(0,0,0,0.87)",
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            bgcolor: "white",
                                                            color: "rgba(0,0,0,0.87)",
                                                            "& .MuiMenuItem-root:hover": {
                                                                bgcolor: "rgba(255,77,79,0.1)",
                                                            },
                                                            "& .MuiMenuItem-root.Mui-selected": {
                                                                bgcolor: "rgba(255,77,79,0.2)",
                                                            },
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Mr">Mr</MenuItem>
                                                <MenuItem value="Mrs">Mrs</MenuItem>
                                                <MenuItem value="Ms">Ms</MenuItem>
                                                <MenuItem value="Dr">Dr</MenuItem>
                                                <MenuItem value="Other">Other</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        {/* Improved Date of Birth Picker */}
                                        <DatePicker
                                            label="Date of Birth"
                                            value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                                            onChange={(date) => handleInputChange("dateOfBirth", date)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    variant: "outlined",
                                                    sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                            bgcolor: "white",
                                                            height: 56,
                                                            "& fieldset": {
                                                                borderColor: "rgba(0,0,0,0.2)",
                                                            },
                                                            "&:hover fieldset": {
                                                                borderColor: "rgba(0,0,0,0.3)",
                                                            },
                                                            "&.Mui-focused fieldset": {
                                                                borderColor: "#ff4d4f",
                                                            },
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: "rgba(0,0,0,0.7)",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                            color: "rgba(0,0,0,0.87)",
                                                            padding: "14px 14px",
                                                        },
                                                    },
                                                },
                                            }}
                                            disableFuture
                                            openTo="year"
                                            views={["year", "month", "day"]}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <MuiTelInput
                                            fullWidth
                                            label="Phone Number"
                                            value={formData.phoneNumber}
                                            defaultCountry="AU"
                                            onChange={(value) => handleInputChange("phoneNumber", value)}
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    bgcolor: "white",
                                                    height: 56, // Increased height
                                                    "& fieldset": {
                                                        borderColor: "rgba(0,0,0,0.2)",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "rgba(0,0,0,0.3)",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#ff4d4f",
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "rgba(0,0,0,0.7)",
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "rgba(0,0,0,0.87)",
                                                    padding: "14px 14px", // Increased padding
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Attendee-specific field */}
                                    {formData.userType === "attendee" && (
                                        <Grid item xs={12}>
                                            <Box sx={{ mt: 1, mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ mb: 1, color: "rgba(0,0,0,0.87)" }}>
                                                    Select Your Interests
                                                </Typography>
                                                <InterestedPage interests={formData.interests} onInterestsChange={handleInputChange} />
                                            </Box>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            disabled={submitting}
                                            sx={{
                                                mt: 2,
                                                py: 1.5,
                                                height: 56, // Increased height
                                                backgroundColor: "#ff4d4f",
                                                backgroundImage: "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                                "&:hover": {
                                                    backgroundColor: "#ff7875",
                                                    boxShadow: "0 4px 15px rgba(255, 77, 79, 0.4)",
                                                },
                                                fontSize: "1rem",
                                                fontWeight: 500,
                                                borderRadius: 2,
                                                textTransform: "none",
                                                boxShadow: "0 4px 10px rgba(255, 77, 79, 0.3)",
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            {submitting ? (
                                                <>
                                                    <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Complete Registration"
                                            )}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Fade>
                </Container>

                {/* Footer */}
                <Box
                    sx={{
                        mt: 4,
                        pt: 3,
                        pb: 3,
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        position: "relative",
                        zIndex: 1,
                        backdropFilter: "blur(10px)",
                        backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                >
                    <Container>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "left" } }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                                    PlanIt
                                </Typography>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                                    Your event planning solution
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                                <Grid container justifyContent={isMobile ? "center" : "center"} spacing={3}>
                                    <Grid item>
                                        <Link
                                            href="#"
                                            color="inherit"
                                            underline="hover"
                                            sx={{
                                                color: "rgba(255,255,255,0.8)",
                                                "&:hover": { color: "#ff4d4f" },
                                                transition: "color 0.2s ease",
                                            }}
                                        >
                                            About Us
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link
                                            href="#"
                                            color="inherit"
                                            underline="hover"
                                            sx={{
                                                color: "rgba(255,255,255,0.8)",
                                                "&:hover": { color: "#ff4d4f" },
                                                transition: "color 0.2s ease",
                                            }}
                                        >
                                            Contact
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link
                                            href="#"
                                            color="inherit"
                                            underline="hover"
                                            sx={{
                                                color: "rgba(255,255,255,0.8)",
                                                "&:hover": { color: "#ff4d4f" },
                                                transition: "color 0.2s ease",
                                            }}
                                        >
                                            Privacy Policy
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "right" } }}>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                                    © {new Date().getFullYear()} PlanIt. All rights reserved.
                                </Typography>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </LocalizationProvider>
    )
}

export default RedirectPage

