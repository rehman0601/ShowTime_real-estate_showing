import React, { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const NotificationListener = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;

        const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

        socket.on('slotBooked', (data) => {
            // Check if the current user is the agent for this booking
            if (user._id === data.agentId || user.id === data.agentId) {
                toast.info('📅 New Booking Request Received!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        });

        return () => socket.disconnect();
    }, [user]);

    return null; // This component doesn't render anything itself
};

export default NotificationListener;
