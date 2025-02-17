import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {getURL} from "@/components/URL.jsx";
import Navbar from "@/components/Navbar.jsx";
import {fetchEvent} from "@/components/Functions.jsx";

const CheckoutReturn = () => {
    const location = useLocation();
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState(null);
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    
    const [alreadyLoaded, setAlreadyLoaded] = useState(false);

    
    
    useEffect(() => {
        
        console.log("UseEffect");

        const orderCompleted = sessionStorage.getItem("orderCompleted");
        console.log(orderCompleted)
        if(orderCompleted === "true") {
            sessionStorage.clear();
            window.location.href = "/home";
        }
        
        const getSessionStatus = async () => {

            
            
            
            const params = new URLSearchParams(location.search);
            const sessionId = params.get('session_id');

            if (!sessionId) return;

            try {
                const response = await fetch(`${getURL()}/session-status?session_id=${sessionId}`);
                const data = await response.json();
                
                setStatus(data.status);
                setCustomerEmail(data.customer_email);

                if (data.eventId) {
                    const eventData = await fetchEvent(data.eventId);
                    setEvent(eventData);
                }
                if (data.lineItems) {
                    setTickets(data.lineItems);
                    console.log(data.lineItems);
                }
                setAlreadyLoaded(true);
                sessionStorage.setItem("orderCompleted", "true");
                
                
            } catch (error) {
                console.error('Error fetching session status:', error);
            }
            
        };
        if(orderCompleted === "false" || orderCompleted === null) {
            console.log("getting session status")
            getSessionStatus();
        }
        
        
        
    }, [location]);

    if (status === null) {
        return <div>Loading...</div>;
    }

    if (status !== 'complete') {
        return (
            <div>
                <h1>Payment Failed or Canceled</h1>
                <p>Unfortunately, your payment could not be completed. Please try again.</p>
                {/* You can add logic to remount Checkout here */}
            </div>
        );
    }

    if (!event) {
        return <div>Loading event details...</div>;
    }

    return (

        <div>
            <Navbar/>
            <h1>Payment Successful!</h1>
            <p style={{
                maxWidth: "700px",

            }}>Thank you for your order, {customerEmail}! Your Tickets and a confirmation of your purchase will be sent to the email you provided. 
             <br/><br/>You may also view your purchased tickets from the Tickets Page for more information.</p>
            <div>
                <h2>Event Details</h2>
                <p><strong>{event.title}</strong></p>
                
                <p>{event.additionalInfo}</p>
                <p>Date: {event.startDate}</p>
                <p>Location: {event.location}</p>

                <h3>Purchased Tickets</h3>
                {tickets.length > 0 ? (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {tickets.map((item, index) => (
                            <li key={index}>
                                <strong>{item.description}</strong><br />
                                Quantity: {item.quantity}<br />
                                Unit Price: ${item.price}<br />
                                Total: ${item.quantity * item.price}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tickets purchased.</p>
                )}
            </div>
        </div>
    )
        ;
};

export default CheckoutReturn;
