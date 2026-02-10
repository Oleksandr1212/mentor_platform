import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
    const { user, userData } = useAuth();

    if (!user) {
        // Не увійшов у систему
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        // Увійшов, але неправильна роль (наприклад, студент намагається отримати доступ до сторінки ментора)
        // Перенаправити на відповідний дашборд
        return <Navigate to={userData.role === 'mentor' ? '/mentor-dashboard' : '/dashboard'} replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
