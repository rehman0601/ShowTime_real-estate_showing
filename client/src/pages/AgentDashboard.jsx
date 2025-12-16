import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react';
import '../styles/dashboard.css';

/**
 * AgentDashboard Component
 * 
 * Displays the main dashboard for Real Estate Agents.
 * - Shows a list of "Upcoming Appointments" with buyers.
 * - Shows a list of "My Properties" managed by the agent.
 * - Allows creating new properties via a modal.
 * - Provides links to manage individual properties.
 */
const AgentDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [properties, setProperties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState(null); // File state
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        price: '',
        description: ''
        // image removed from here, handled by file or backend
    });

    useEffect(() => {
        fetchProperties();
        fetchAppointments();
    }, []);

    /**
     * Fetches properties created by the current agent.
     */
    const fetchProperties = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/my-properties`);
            setProperties(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Fetches confirmed or pending appointments for the agent.
     */
    const fetchAppointments = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/agent-schedule`);
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    /**
     * Handles the creation of a new property.
     * Uploads image checks and property data to the server.
     */
    const onSubmit = async e => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('address', formData.address);
        data.append('price', formData.price);
        data.append('description', formData.description);
        if (file) {
            data.append('image', file);
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/properties`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowModal(false);
            fetchProperties();
            setFormData({ title: '', address: '', price: '', description: '' });
            setFile(null);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * helper to render status badges
     */
    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="badge badge-success">Confirmed</span>;
            case 'pending': return <span className="badge badge-warning">Pending</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div>
            {appointments.length > 0 && (
                <div className="section-margin">
                    <h2 className="section-header">Upcoming Appointments</h2>
                    <div className="grid-cards">
                        {appointments
                            .filter(apt => new Date(apt.endTime).getTime() + 30 * 60 * 1000 > new Date().getTime())
                            .map(apt => (
                                <div key={apt._id} className="card">
                                    {apt.propertyId?.image ? (
                                        <img src={apt.propertyId.image} alt={apt.propertyId.title} className="card-img" />
                                    ) : (
                                        <div className="card-img-placeholder">
                                            No Image Provided
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h3 className="card-title">{apt.propertyId?.title}</h3>
                                        <div className="booking-info-row">
                                            <span className="text-label">Buyer: </span>
                                            <div>
                                                <span className="text-strong">{apt.buyerId?.name}</span>
                                                <div className="text-label" style={{ fontSize: '0.8rem' }}>{apt.buyerId?.email}</div>
                                            </div>
                                        </div>
                                        <div className="booking-info-row">
                                            <span className="text-label">Date: </span>
                                            <span className="text-strong">{new Date(apt.startTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="booking-info-row" style={{ marginBottom: '1rem' }}>
                                            <span className="text-label">Time: </span>
                                            <span className="text-strong">
                                                {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="booking-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {getStatusBadge(apt.status)}
                                            {apt.status === 'pending' ? (
                                                <Link to={`/property/manage/${apt.propertyId?._id}`} className="link-action">
                                                    Review
                                                </Link>
                                            ) : (
                                                <span className="text-disabled">View</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <div className="page-header">
                <h1 className="page-title">My Properties</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-secondary flex items-center"
                >
                    <Plus size={18} className="mr-2" /> Add Property
                </button>
            </div>

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
                            <Link to={`/property/manage/${property._id}`} className="btn btn-outline-primary btn-block text-center">
                                Manage Bookings
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Add New Property</h2>
                        <form onSubmit={onSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={onChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={onChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input type="number" name="price" value={formData.price} onChange={onChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Property Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea name="description" value={formData.description} onChange={onChange} className="form-textarea" rows="3" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;
