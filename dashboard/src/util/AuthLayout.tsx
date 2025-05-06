import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken, getAuthUserRoles, AccessTokenType } from './authUtils';
import { jwtDecode } from 'jwt-decode';

export type { AccessTokenType } from './authUtils';

export const AdminProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    const userWithRoles = jwtDecode<AccessTokenType>(accessToken);
    const userRole = userWithRoles.roles;

    if (userRole !== 'admin') {
        return <Navigate to="/dashboard/users" />;
    }

    return children ? <>{children}</> : <Outlet />;
};

// For backward compatibility - maintain the original name
export const AdminRoute = AdminProtectedRoute;

const AuthLayout: React.FC = () => {
    const location = useLocation();
    const accessToken = getAccessToken();

    if (!accessToken) {
        return <Outlet />;
    }

    const roles = getAuthUserRoles();
    if (!roles) {
        return <Navigate to="/auth/login" state={{ path: location.pathname }} />;
    } else if (roles === 'user') {
        return <Navigate to="/" state={{ path: location.pathname }} />;
    } else if (roles === 'admin' || roles === 'seller') {
        return <Navigate to="/dashboard/home" state={{ path: location.pathname }} />;
    } else {
        return <Navigate to="/auth/login" state={{ path: location.pathname }} />;
    }
};

export default AuthLayout;
