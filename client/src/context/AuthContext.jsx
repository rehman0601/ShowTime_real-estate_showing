import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
        case 'REGISTER_FAIL':
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
    };

    const [state, dispatch] = useReducer(authReducer, initialState);
    const user = state.user;

    const loadUser = async () => {
        if (localStorage.token) {
            axios.defaults.headers.common['x-auth-token'] = localStorage.token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
            dispatch({
                type: 'USER_LOADED',
                payload: res.data
            });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    const register = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData, config);
            localStorage.setItem('token', res.data.token);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });
            loadUser();
        } catch (err) {
            localStorage.removeItem('token');
            dispatch({ type: 'REGISTER_FAIL' });
            throw err;
        }
    };

    const login = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData, config);
            localStorage.setItem('token', res.data.token);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });
            loadUser();
        } catch (err) {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGIN_FAIL' });
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    useEffect(() => {
        loadUser();
    }, []);


    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
