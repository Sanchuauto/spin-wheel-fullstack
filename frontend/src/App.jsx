import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SpinPage from './pages/customer/SpinPage';
import Login from './pages/admin/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Campaigns from './pages/admin/Campaigns';
import CampaignDetail from './pages/admin/CampaignDetail';
import Logs from './pages/admin/Logs';
import Users from './pages/admin/Users';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            {/* Public Customer Routes */}
            <Route path="/spin/:slug" element={<SpinPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" />} />

                <Route element={<PrivateRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route path="campaigns/:id" element={<CampaignDetail />} />
                    <Route path="logs" element={<Logs />} />
                </Route>

                <Route element={<PrivateRoute roles={['SUPER_ADMIN']} />}>
                    <Route path="users" element={<Users />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<div className="text-center mt-20">404 Not Found</div>} />
        </Routes>
    );
}

export default App;
