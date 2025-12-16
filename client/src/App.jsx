import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentDashboard from './pages/AgentDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import PropertyManage from './pages/PropertyManage';
import PropertyView from './pages/PropertyView';
import PrivateRoute from './components/PrivateRoute';
import NotificationListener from './components/NotificationListener';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-min-h-screen">
          <Navbar />
          <NotificationListener /> {/* Listen for events */}
          <ToastContainer />       {/* Show toasts */}
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/agent-dashboard" element={
                <PrivateRoute>
                  <AgentDashboard />
                </PrivateRoute>
              } />

              <Route path="/buyer-dashboard" element={
                <PrivateRoute>
                  <BuyerDashboard />
                </PrivateRoute>
              } />

              <Route path="/property/manage/:id" element={
                <PrivateRoute>
                  <PropertyManage />
                </PrivateRoute>
              } />

              <Route path="/property/:id" element={
                <PrivateRoute>
                  <PropertyView />
                </PrivateRoute>
              } />

              <Route path="/buyer" element={<Navigate to="/buyer-dashboard" />} />
              <Route path="/agent" element={<Navigate to="/agent-dashboard" />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider >
  );
}

export default App;
