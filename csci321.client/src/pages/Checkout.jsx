import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar.jsx"; // Assuming this updates the event in mock backend
import {editEvent} from "@/components/Functions.jsx"; // Assuming you will style with this CSS file

const Checkout = () => {
    const location = useLocation(); // Get event and selected tickets from state
    const selectedTickets = location.state?.selectedTickets;
    const event = location.state?.eventDetails;
    const navigate = useNavigate();

    const [soldOutTickets, setSoldOutTickets] = useState([]); // Keep track of sold-out tickets


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
            // Redirect to confirmation or another page
            navigate(`/confirmation/${event.id}`);
        }).catch(err => {
            console.error("Error updating event:", err);
        });
    };

    return (
        <div>
            <Navbar />
            <h1>Checkout</h1>
            <h2>{event.title}</h2>
            
            {soldOutTickets.length > 0 && (
                <p style={{ color: 'red' }}>
                    The following tickets are sold out: {soldOutTickets.join(', ')}. Please reduce your quantity.
                </p>
            )}

            <div>
                <h3>Tickets Selected:</h3>
                {selectedTickets.map((ticket, index) => (
                    <div key={index}>
                        <p>{ticket.name} - {ticket.quantity} tickets @ ${ticket.price} each</p>
                    </div>
                ))}
            </div>

            <button onClick={handleFinalizePurchase}>Finalize Purchase</button>
        </div>
    );
};

export default Checkout;
