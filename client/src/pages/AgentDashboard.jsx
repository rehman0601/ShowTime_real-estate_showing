import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react';
import '../styles/dashboard.css';

const AgentDashboard = () => {
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
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/my-properties`);
            setProperties(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Properties</h1>
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
                        {property.image && (
                            <img src={property.image} alt={property.title} className="card-img" />
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
