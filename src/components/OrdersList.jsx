import React, { useState } from 'react';


const OrdersList = ({ orders, formatDate, formatTime }) => {
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const toggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    console.log(orders)
    const handleAddToGoogleCalendar = (order) => {
        const { title, startDate, endDate, location, startTime, endTime } = order;

        const startDateTimeStr = `${startDate}T${startTime}:00`; // Assuming startDate is "YYYY-MM-DD" and startTime is "HH:mm"
        const endDateTimeStr = `${startDate}T${endTime}:00`; // Same for endDate and endTime

        // Create Date objects (local time, no timezone yet)
        const startDateTime = new Date(startDateTimeStr);
        const endDateTime = new Date(endDateTimeStr);

        // Get the timezone offset in minutes, considering Daylight Saving Time (DST)
        const timezoneOffset = startDateTime.getTimezoneOffset();  // Returns the time zone offset in minutes

        // Convert the local time to UTC by adjusting the timezone offset
        const startUTC = new Date(startDateTime.getTime() - (timezoneOffset * 60000));  // Convert to UTC
        const endUTC = new Date(endDateTime.getTime() - (timezoneOffset * 60000));  // Convert to UTC

        // Format to Google Calendar-compatible format (YYYYMMDDTHHmmss)
        const formattedStartDate = startUTC.toISOString().replace(/[-:]/g, '').split('.')[0];
        const formattedEndDate = endUTC.toISOString().replace(/[-:]/g, '').split('.')[0];

        // URL encoding
        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedStartDate}/${formattedEndDate}&location=${encodeURIComponent(location)}`;

        // Open the Google Calendar URL in a new tab
        window.open(googleCalendarUrl, '_blank');
    };


    const addToCalendar = async (order) => {
        console.log(order);
        const { title, startDate, endDate, location, startTime, endTime } = order;
        
        const startDateTime = `${startDate}T${startTime}:00`; // +11:00 for AEDT (Australian Eastern Daylight Time)
        const endDateTime = `${startDate}T${endTime}:00`;

        const response = await fetch(`/api/calendar/generate-ics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                location,
                startDateTime,
                endDateTime
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate calendar file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/calendar' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'event.ics');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const isEventInThePast = (startDate, startTime) => {
        const eventDate = new Date(`${startDate}T${startTime}`);
        const now = new Date();
        return eventDate < now;
    };


    return (
        <ul>
            {orders.map((order) => {
                const isPast = isEventInThePast(order.startDate, order.startTime);
                return (
                    <div key={order.orderId}>
                        <div className="ticket-row">
                            <div className="ticket-image">
                                <img src={order.event.image} alt={order.event.title} />
                            </div>
                            <div className="ticket-details">
                                <div className="ticket-name">{order.event.title}</div>
                                <div className="ticket-date">{formatDate(order.event.startDate)}</div>
                                <div className="ticket-time">
                                    {formatTime(order.event.startTime)} - {formatTime(order.event.endTime)}
                                </div>
                                <div className="ticket-location">{order.event.location}</div>
                            </div>
                            <div className="ticket-actions">
                                <button onClick={() => toggleExpand(order.orderId)}>
                                    {expandedOrderId === order.orderId ? 'Hide Info' : 'Additional Info'}
                                </button>
                                {!isPast && (
                                    <>
                                        <button>Download Info</button>
                                        <button>Add to Apple Wallet</button>
                                        <button>Add to Google Wallet</button>
                                        <button onClick={() => addToCalendar(order)}>Add to Calendar</button>
                                        <button onClick={() => handleAddToGoogleCalendar(order)}>Add to Google Calendar</button>
                                    </>
                                )}
                            </div>
                        </div>
                        {expandedOrderId === order.orderId && (
                            <div className="ticket-expanded">
                                <div className="ticket-section">
                                    <h4>Ticket Information</h4>
                                    {order.tickets.map((ticket, index) => (
                                        <p key={index}>{`${ticket.name}: ${ticket.quantity} x $${ticket.price}`}</p>
                                    ))}
                                    <strong>Total: ${order.totalPrice}</strong>
                                </div>
                                {order.refundable && !isPast && (
                                    <div className="ticket-section">
                                        <h4>Refunds</h4>
                                        <button>Request Refund</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </ul>
    );
};

export default OrdersList;
