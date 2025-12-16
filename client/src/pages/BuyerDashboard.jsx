import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

const BuyerDashboard = () => {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties`);
            setProperties(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Available Properties</h1>
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
                            <Link to={`/property/${property._id}`} className="btn btn-secondary btn-block text-center">
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
