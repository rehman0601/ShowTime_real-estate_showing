import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/auth.css';

const Register = () => {
    const authContext = useContext(AuthContext);
    const { register, isAuthenticated, user } = authContext;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer'
    });

    const { name, email, password, role } = formData;

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
            await register({ name, email, password, role });
        } catch (err) {
            console.error('Register Error', err);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="text-center mb-6">Register</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            className="form-input"
                            required
                        />
                    </div>
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
                    <div className="form-group">
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
                    <div className="form-group mb-6">
                        <label className="form-label">I am a:</label>
                        <select
                            name="role"
                            value={role}
                            onChange={onChange}
                            className="form-select"
                        >
                            <option value="buyer">Buyer</option>
                            <option value="agent">Agent</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Register
                    </button>
                </form>
                <p className="text-center" style={{ marginTop: '1rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
