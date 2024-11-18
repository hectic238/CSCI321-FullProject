import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar.jsx"; // Assuming this updates the event in mock backend
import {editEvent, generateObjectId, getUserIdFromToken, handlePublishOrder} from "@/components/Functions.jsx";
import eventDetails from "@/pages/EventDetails.jsx"; // Assuming you will style with this CSS file

const Checkout = () => {
    const location = useLocation(); // Get event and selected tickets from state
    const selectedTickets = location.state?.selectedTickets;
    const event = location.state?.eventDetails;
    const navigate = useNavigate();
    const [isRefundableSelected, setIsRefundableSelected] = useState(false); // New state for refundable tickets
    const [errors, setErrors] = useState({}); // Validation errors
    const [billingInfo, setBillingInfo] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
    });
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [cardInfo, setCardInfo] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    });
    
    const [order, setOrder] = useState({
        billingInfo: null,
        //orderDate: "",
        tickets: [],
        eventId: "",
        userId: "",
        totalPrice: "",
        orderId: generateObjectId(),
        paymentMethod: "",
        refundable: false,
    })

    const [soldOutTickets, setSoldOutTickets] = useState([]); // Keep track of sold-out tickets
    const [isFormValid, setIsFormValid] = useState(false);
    const [totalTickets, setTotalTickets] = useState([...selectedTickets]); // Updated ticket list
    
    //const totalPrice = totalTickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0);
    const [totalPrice, setTotalPrice] = useState({})
    

    // List of countries
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
        "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
        "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
        "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
        "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
        "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
        "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
        "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
        "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
        "Korea (North)", "Korea (South)", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
        "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
        "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
        "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
        "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
        "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
        "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
        "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
        "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
        "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
        "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
        "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    // When the payment method changes, revalidate the form
    useEffect(() => {
        validateFormOnChange();
    }, [selectedPaymentMethod]);

    useEffect(() => {
        const basePrice = selectedTickets.reduce(
            (total, ticket) => total + ticket.quantity * ticket.price,
            0
        );
        const refundableFee = isRefundableSelected ? 30 : 0;
        setTotalPrice(basePrice + refundableFee);
    }, [isRefundableSelected]);


    useEffect(() => {
        validateFormOnChange();
        
    }, [termsAccepted])

    // Validating form changes to ensure no form field is empty
    const validateFormOnChange = () => {
        const requiredFields = ["name", "email", "address", "city", "postalCode", "country"];
        const cardFields = ["cardNumber", "expiryDate", "cvv", "cardholderName"];
        const newErrors = {};

        // Validate required billing fields
        requiredFields.forEach((field) => {
            if (!billingInfo[field]?.trim()) {
                newErrors[field] = true;
            }
        });

        // Validate card fields only if credit card is selected
        if (selectedPaymentMethod === "CreditCard") {
            cardFields.forEach((field) => {
                if (!cardInfo[field]?.trim()) {
                    newErrors[field] = true;
                }
            });
        }

        // Check terms and conditions
        if (!termsAccepted) {
            newErrors.termsAccepted = true;
        }

        setErrors(newErrors);
        setIsFormValid(Object.keys(newErrors).length === 0);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;

        if (billingInfo.hasOwnProperty(name)) {
            setBillingInfo((prev) => ({ ...prev, [name]: value }));
        } else if (cardInfo.hasOwnProperty(name)) {
            setCardInfo((prev) => ({ ...prev, [name]: value }));
        }

        validateFormOnChange();
    };
    
    

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);

        // Reset card info if not using credit card
        if (method !== "creditCard") {
            setCardInfo({
                cardNumber: "",
                expiryDate: "",
                cvv: "",
                cardholderName: "",
            });
        }

        validateFormOnChange();
    };
    

    const handleFinalizePurchase = () => {
        const updatedTickets = [...event.tickets];
        const newSoldOutTickets = []; // Array to collect sold-out ticket names


        // Check availability and update the tickets
        for (let selectedTicket of selectedTickets) {
            const ticketIndex = updatedTickets.findIndex(ticket => ticket.name === selectedTicket.name);

            if (ticketIndex !== -1) {
                const availableCount = Number(updatedTickets[ticketIndex].count);

                // Check if there are enough tickets
                if (availableCount >= selectedTicket.quantity) {
                    // Reduce the available ticket count
                    event.numberAttendees += selectedTicket.quantity;
                    updatedTickets[ticketIndex].count = (availableCount - selectedTicket.quantity).toString();
                    updatedTickets[ticketIndex].bought += selectedTicket.quantity;
                } else {
                    newSoldOutTickets.push(selectedTicket.name); // Mark this ticket as sold out

                }
            }
        }

        updatedTickets.forEach((ticket, index) => {
            if (Number(ticket.count) === 0) {
                updatedTickets[index].soldOut = true; // Set the soldOut flag
            }
        });

        // If all tickets are available, finalize purchase
        if (newSoldOutTickets.length > 0) {
            setSoldOutTickets(newSoldOutTickets);
            return; // Exit if tickets are sold out
        }

        // If all tickets are available, finalize purchase
        const updatedEvent = { ...event, tickets: updatedTickets };
        editEvent(updatedEvent).then(() => {
            console.log("Purchase completed");
            console.log(totalPrice + " Deducted From " + selectedPaymentMethod);
            console.log(updatedTickets);

            // Construct the updated order object
            const updatedOrder = {
                ...order,
                billingInfo: billingInfo,
                totalPrice: totalPrice,
                tickets: totalTickets, // If tickets are part of the order
                //orderDate: Date.now(),
                userId: getUserIdFromToken(),
                eventId: event.id,
                refundable: isRefundableSelected,
                paymentMethod: selectedPaymentMethod,
                
            };

            // Update the state with the new order
            setOrder(updatedOrder);
            
            handlePublishOrder(updatedOrder);

            // Log the updated order explicitly
            console.log("Updated order:", updatedOrder);

            // Redirect to confirmation or another page
            navigate(`/confirmation/${event.id}`);
        }).catch(err => {
            console.error("Error updating event:", err);
        });
    };

    return (
        <div>
            <Navbar />
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", padding: "20px" }}>
                {/* Left Column */}
                <div style={{flex: 2, border: "1px solid #ddd", padding: "20px", borderRadius: "8px"}}>
                    <h2>Checkout</h2>
                    <h3>{event.title}</h3>
                    {soldOutTickets.length > 0 && (
                        <p style={{color: "red"}}>
                            The following tickets are sold out: {soldOutTickets.join(", ")}. Please reduce your
                            quantity.
                        </p>
                    )}

                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={isRefundableSelected}
                                onChange={(e) => setIsRefundableSelected(e.target.checked)}
                            />
                            Make tickets refundable (+10% fee)
                        </label>
                    </div>

                    {/* Billing Information */}
                    <h3>Billing Information</h3>
                    {["name", "email", "address", "city", "postalCode"].map((field) => (
                        <div key={field}>
                            <label>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                            <input
                                type="text"
                                name={field}
                                value={billingInfo[field]}
                                onChange={handleFieldChange}
                                style={{ display: "block", marginBottom: "10px", width: "100%" }}
                            />
                        </div>
                    ))}

                    {/* Country Dropdown */}
                    <div>
                        <label>Country</label>
                        <select
                            name="country"
                            value={billingInfo.country}
                            onChange={handleFieldChange}
                            style={{ display: "block", marginBottom: "10px", width: "100%" }}
                        >
                            <option value="">Select your country</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => {
                                setTermsAccepted(e.target.checked);
                                validateFormOnChange();
                            }}
                        />
                        <label>
                            I accept the <a href="#">terms and conditions</a>{" "}
                            {errors.termsAccepted && <span style={{color: "red"}}>*</span>}
                        </label>
                    </div>

                    <div>
                        <h3>Payment Options</h3>
                        {["CreditCard", "GooglePay", "ApplePay", "AfterPay"].map((method) => (
                            <button
                                key={method}
                                onClick={() => handlePaymentMethodChange(method)}
                                style={{
                                    backgroundColor: selectedPaymentMethod === method ? "#ddd" : "white",
                                }}
                            >
                                {method.replace(/([A-Z])/g, " $1")}
                            </button>
                        ))}
                    </div>

                    {selectedPaymentMethod === "CreditCard" && (
                        <div style={{ marginTop: "10px" }}>
                            {["cardNumber", "expiryDate", "cvv", "cardholderName"].map((field) => (
                                <div key={field}>
                                    <label>
                                        {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                                        {errors[field] && <span style={{ color: "red" }}>*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={cardInfo[field]}
                                        onChange={handleFieldChange}
                                        style={{ display: "block", marginBottom: "10px", width: "100%" }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleFinalizePurchase}
                        disabled={!isFormValid}
                        style={{
                            marginTop: "20px",
                            backgroundColor: isFormValid ? "green" : "#ccc",
                            color: "white",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: isFormValid ? "pointer" : "not-allowed",
                        }}
                    >
                        Finalize Purchase
                    </button>
                </div>

                {/* Right Column */}
                <div style={{flex: 1, border: "1px solid #ddd", padding: "20px", borderRadius: "8px"}}>
                    <h3>Your Order</h3>
                    <div>
                        {totalTickets.map((ticket, index) => (
                            <div key={index}>
                                <p>
                                    {ticket.name} - {ticket.quantity} x ${ticket.price}
                                </p>
                            </div>
                        ))}
                    </div>

                    {isRefundableSelected && (

                        <div>
                            <hr/>
                            Refundable Tickets - $30
                        </div>
                    )}
                    <hr/>
                    {/* Finalize Purchase Button */}
                    <h3>Total Price: ${typeof totalPrice === "number" ? totalPrice.toFixed(2) : 0}</h3>


                </div>
            </div>
        </div>
    );
};

export default Checkout;
