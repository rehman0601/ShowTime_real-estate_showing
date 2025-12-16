import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, startOfWeek, addMinutes, parseISO } from 'date-fns';
import { Check, X, Clock, Trash } from 'lucide-react';
import io from 'socket.io-client';
import '../styles/property.css';

/**
 * PropertyManage Component
 * 
 * Allows an agent to manage a specific property's availability and bookings.
 * - View property details.
 * - Delete the property.
 * - Set specific time slots as "Available" for the next 7 days.
 * - Review pending booking requests (Approve/Reject).
 * - View confirmed showings.
 * - Uses Socket.io for real-time updates.
 */
const PropertyManage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        // Connect to Socket.io server
        const s = io(import.meta.env.VITE_API_URL.replace('/api', ''));

        fetchProperty();
        fetchSlots();

        // Listen for real-time updates
        s.on('slotBooked', (data) => {
            if (data.propertyId === id) fetchSlots();
        });
        s.on('slotStatusChanged', (data) => {
            if (data.propertyId === id) fetchSlots();
        });

        return () => s.disconnect();
    }, [id]);

    /**
     * Gets property details
     */
    const fetchProperty = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/${id}`);
            setProperty(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Gets all bookings/slots for this property
     */
    const fetchSlots = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/property/${id}`);
            setSlots(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Creates a new available slot for a specific time on the selected date.
     * @param {string} time - Time in "HH:mm" format (e.g., "09:00")
     */
    const addSlot = async (time) => {
        const [hours, minutes] = time.split(':');
        const start = new Date(selectedDate);
        start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const end = addMinutes(start, 60);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, {
                propertyId: id,
                startTime: start,
                endTime: end
            });
            fetchSlots();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Updates the status of a booking (e.g., Agent confirms a request).
     * @param {string} slotId - The ID of the booking/slot
     * @param {string} status - New status ('confirmed' or 'rejected')
     */
    const updateStatus = async (slotId, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${slotId}/status`, { status });
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Deletes the property and all associated bookings after confirmation.
     * Redirects to dashboard upon success.
     */
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this property? This action PERMANENTLY removes the property and all associated bookings.')) {
            return;
        }
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/properties/${id}`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to delete property');
        }
    };

    if (!property) return <div>Loading...</div>;

    const pendingSlots = slots.filter(s => s.status === 'pending');
    const confirmedSlots = slots.filter(s => s.status === 'confirmed');

    return (
        <div className="split-layout">
            <div>
                <div className="section-box">
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{property.title}</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{property.address}</p>
                    <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', paddingBottom: '1rem' }}>
                        <div>
                            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Price</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>${property.price.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDelete}
                        className="btn btn-outline-danger w-full flex items-center justify-center mb-6"
                    >
                        <Trash size={18} className="mr-2" /> Delete Property
                    </button>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Manage Availability</h3>
                    {/* Calendar Day Picker */}
                    <div className="calendar-scroll">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const date = addDays(new Date(), i);
                            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    className={`calendar-day ${isSelected ? 'active' : ''}`}
                                >
                                    <div style={{ fontSize: '0.75rem' }}>{format(date, 'EEE')}</div>
                                    <div style={{ fontWeight: 'bold' }}>{format(date, 'd')}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Slots Grid */}
                    <div className="slot-grid">
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => {
                            // Calculate exact time for this slot
                            const [hours, minutes] = time.split(':');
                            const slotDateTime = new Date(selectedDate);
                            slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                            const isPast = slotDateTime < new Date();

                            const slotExists = slots.find(s =>
                                format(new Date(s.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
                                format(new Date(s.startTime), 'HH:mm') === time
                            );

                            return (
                                <button
                                    key={time}
                                    disabled={!!slotExists || isPast}
                                    onClick={() => addSlot(time)}
                                    className={`slot-btn ${slotExists || isPast ? 'disabled' : ''}`}
                                    style={isPast ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    {time} {slotExists ? `(${slotExists.status})` : (isPast ? '(Past)' : '')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar: Pending & Confirmed */}
            <div>
                <div className="section-box">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <Clock size={20} className="mr-2" style={{ color: 'orange' }} /> Pending Requests
                    </h3>
                    {pendingSlots.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending requests.</p>}
                    <div>
                        {pendingSlots.map(slot => (
                            <div key={slot._id} className="booking-item">
                                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{format(new Date(slot.startTime), 'MMM d, yyyy')}</p>
                                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                                </p>
                                <div className="status-actions">
                                    <button
                                        onClick={() => updateStatus(slot._id, 'confirmed')}
                                        className="btn btn-secondary w-full"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem' }}
                                    >
                                        <Check size={14} className="mr-2" /> Approve
                                    </button>
                                    <button
                                        onClick={() => updateStatus(slot._id, 'rejected')}
                                        className="btn btn-danger w-full"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem' }}
                                    >
                                        <X size={14} className="mr-2" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-box">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <Check size={20} className="mr-2" style={{ color: 'var(--secondary-color)' }} /> Confirmed Showings
                    </h3>
                    {confirmedSlots.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No upcoming showings.</p>}
                    <div>
                        {confirmedSlots.map(slot => (
                            <div key={slot._id} className="booking-item confirmed">
                                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{format(new Date(slot.startTime), 'MMM d, yyyy')}</p>
                                <p style={{ fontSize: '0.875rem' }}>
                                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyManage;
