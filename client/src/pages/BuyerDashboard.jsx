import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

/**
 * BuyerDashboard Component
 * 
 * Displays the main dashboard for Buyers.
 * - Shows "My Bookings": A list of upcoming appointments.
 * - Shows "Available Properties": All properties available for viewing.
 */
const BuyerDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchProperties();
        fetchBookings();
    }, []);

    /**
     * Fetches all properties available in the system.
     */
    const fetchProperties = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties`);
            setProperties(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Fetches the current buyer's booking history.
     */
    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/my-bookings`);
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Helper to render status badges
     */
    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="badge badge-success">Confirmed</span>;
            case 'pending': return <span className="badge badge-warning">Pending</span>;
            case 'rejected': return <span className="badge badge-danger">Rejected</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div>
            {/* My Bookings Section */}
            {bookings.length > 0 && (
                <div className="section-margin">
                    <h2 className="section-header">My Bookings</h2>
                    <div className="grid-cards">
                        {/* Auto-Hide past bookings (older than 30 mins) */}
                        {bookings
                            .filter(booking => new Date(booking.endTime).getTime() + 30 * 60 * 1000 > new Date().getTime())
                            .map(booking => (
                                <div key={booking._id} className="card">
                                    {booking.propertyId?.image ? (
                                        <img src={booking.propertyId.image} alt={booking.propertyId.title} className="card-img" />
                                    ) : (
                                        <div className="card-img-placeholder">
                                            No Image Provided
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h3 className="card-title">{booking.propertyId?.title || 'Unknown Property'}</h3>
                                        <div className="booking-info-row">
                                            <span className="text-label">Agent: </span>
                                            <span className="text-strong">{booking.agentId?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="booking-info-row">
                                            <span className="text-label">Date: </span>
                                            <span className="text-strong">
                                                {new Date(booking.startTime).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="booking-info-row" style={{ marginBottom: '1rem' }}>
                                            <span className="text-label">Time: </span>
                                            <span className="text-strong">
                                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="booking-status">
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Available Properties List */}
            <h1 className="section-header" style={{ marginBottom: '1.5rem' }}>Available Properties</h1>
            <div className="grid-cards">
                {properties.map(property => (
                    <div key={property._id} className="card">
                        {property.image ? (
                            <img src={property.image} alt={property.title} className="card-img" />
                        ) : (
                            <div className="card-img-placeholder">
                                No Image Provided
                            </div>
                        )}
                        <div className="card-body">
                            <h3 className="card-title">{property.title}</h3>
                            <p className="card-text">{property.address}</p>
                            <p className="card-price">${property.price.toLocaleString()}</p>
                            <Link to={`/property/${property._id}`} className="btn btn-secondary text-center" style={{ display: 'block' }}>
                                View Available Slots
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BuyerDashboard;
