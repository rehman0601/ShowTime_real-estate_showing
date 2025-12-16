import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
    const authContext = useContext(AuthContext);
    const { login, isAuthenticated, user } = authContext; // Destructure user
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'agent') navigate('/agent-dashboard');
            else if (user.role === 'buyer') navigate('/buyer-dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login({ email, password });
        } catch (err) {
            console.error('Login Error', err);
            alert('Invalid Credentials. Please check your email and password.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="text-center mb-6">Login</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group mb-6">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Login
                    </button>
                </form>
                <p className="text-center" style={{ marginTop: '1rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
