import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import io from 'socket.io-client';
import '../styles/property.css';

const PropertyView = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const s = io(import.meta.env.VITE_API_URL.replace('/api', ''));

        fetchProperty();
        fetchSlots();

        s.on('slotsUpdated', (data) => {
            if (data.propertyId === id) fetchSlots();
        });
        s.on('slotBooked', (data) => {
            if (data.propertyId === id) fetchSlots();
        });
        s.on('slotStatusChanged', (data) => {
            if (data.propertyId === id) fetchSlots();
        });

        return () => s.disconnect();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/${id}`);
            setProperty(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSlots = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/property/${id}`);
            setSlots(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const bookSlot = async (slotId) => {
        if (!confirm('Request to book this slot?')) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${slotId}/book`);
            alert('Booking request sent!');
        } catch (err) {
            console.error(err);
            alert('Failed to book slot');
        }
    };

    if (!property) return <div>Loading...</div>;

    const availableSlots = slots.filter(s =>
        s.status === 'available' &&
        format(new Date(s.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
        new Date(s.startTime) > new Date()
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="section-box">
            {property.image && (
                <img src={property.image} alt={property.title} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1.5rem' }} />
            )}
            <div style={{ padding: '0 1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{property.title}</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{property.address}</p>
                <p style={{ color: 'var(--text-main)', marginBottom: '2rem' }}>{property.description}</p>

                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Schedule a Showing</h3>

                <div className="calendar-scroll">
                    {Array.from({ length: 14 }).map((_, i) => {
                        const date = addDays(new Date(), i);
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        const daysSlots = slots.filter(s =>
                            s.status === 'available' &&
                            format(new Date(s.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                            new Date(s.startTime) > new Date()
                        );

                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedDate(date)}
                                className={`calendar-day ${isSelected ? 'active' : ''}`}
                            >
                                <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{format(date, 'EEE')}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{format(date, 'd')}</div>
                                <div style={{ fontSize: '0.75rem', color: daysSlots.length > 0 ? 'var(--secondary-color)' : 'var(--text-muted)' }}>
                                    {daysSlots.length} slots
                                </div>
                            </div>
                        );
                    })}
                </div>

                {availableSlots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                        {availableSlots.map(slot => (
                            <button
                                key={slot._id}
                                onClick={() => bookSlot(slot._id)}
                                className="btn btn-outline-success"
                                style={{ padding: '0.75rem', fontWeight: 'bold' }}
                            >
                                {format(new Date(slot.startTime), 'h:mm a')}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
                        No available slots for this date.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyView;
