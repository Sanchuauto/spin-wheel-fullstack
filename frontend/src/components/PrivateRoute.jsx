import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ roles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <div className="p-10 text-center text-red-500">Access Denied: Insufficient Permissions</div>;
    }

    return <Outlet />;
};

export default PrivateRoute;
