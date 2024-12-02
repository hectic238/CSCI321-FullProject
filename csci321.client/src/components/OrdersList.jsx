import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';




const OrdersList = ({ orders, formatDate, formatTime }) => {
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const toggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const [expanded, setExpanded] = React.useState(false);
    
    return (
        <ul>
            {orders.map((order) => (
                <Card>
                <div className="ticket-row" key={order.orderId}>
                    <div className="ticket-image">
                        <img src={order.image} alt={order.title} />
                    </div>
                    <div className="ticket-details">
                        <div className="ticket-name">{order.title}</div>
                        <div className="ticket-date">{formatDate(order.startDate)}</div>
                        <div className="ticket-time">
                            {formatTime(order.startTime)} - {formatTime(order.endTime)}
                        </div>
                        <div className="ticket-location">{order.location}</div>
                    </div>
                    <div className="ticket-actions">
                        <button onClick={() => toggleExpand(order.orderId)}>
                            {expandedOrderId === order.orderId ? 'Hide Info' : 'Additional Info'}
                        </button>
                        <button>Download Info</button>
                        <button>Add to Apple Wallet</button>
                        <button>Add to Google Wallet</button>
                    </div>
                </div>
                <div>
                    {expandedOrderId === order.orderId && (
                        <div className="ticket-expanded">
                            {/* Expanded content goes here */}
                            <div className="ticket-section">
                                <h4>Ticket Information</h4>
                                {order.tickets.map((ticket, index) => (
                                    <p key={index}>{`${ticket.name}: ${ticket.quantity} x $${ticket.price}`}</p>
                                ))}
                                <strong>Total: ${order.totalPrice}</strong>
                            </div>
                            <div className="ticket-section">
                            {order.refundable && (
                                <div className="ticket-section">
                                    <h4>Refunds</h4>
                                    <button>Request Refund</button>
                                </div>
                            )}
                            </div>
                            
                        </div>

                    )}
                </div>
                </Card>
            ))}
        </ul>
    );
};

export default OrdersList;
