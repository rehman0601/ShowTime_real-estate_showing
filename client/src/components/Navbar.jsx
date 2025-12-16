import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';
import '../styles/navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    const authLinks = (
        <div className="nav-links">
            <span>Hello, {user && user.name}</span>
            <button onClick={onLogout} className="logout-btn">
                <LogOut size={18} className="mr-2" /> Logout
            </button>
        </div>
    );

    const guestLinks = (
        <div className="nav-links">
            <Link to="/login" className="link-btn">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
    );

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="nav-brand">
                    <Home size={20} className="mr-2" /> Showtime
                </Link>
                {isAuthenticated ? authLinks : guestLinks}
            </div>
        </nav>
    );
};

export default Navbar;
