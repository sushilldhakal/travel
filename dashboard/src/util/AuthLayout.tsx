import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ReactNode } from 'react';

export const isValidToken = (token: string | null): boolean => {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
};

const getAccessToken = (): string | null => {
    return localStorage.getItem('token-store');
};

type AccessTokenType = {
    email: string;
    isLoggedIn: boolean;
    sub: string;
    roles: string;
};


export const getAuthUserRoles = (): string | null => {
    const accessToken = getAccessToken();
    if (!isValidToken(accessToken)) return null;

    try {
        const decoded = jwtDecode<AccessTokenType>(accessToken!);
        const currentTime = Date.now() / 1000; // Convert milliseconds to seconds

        if (decoded?.exp < currentTime) {
            localStorage.removeItem("token-store");
        }
        return decoded.roles;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};

interface AdminRouteProps {
    children?: ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
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

export const getUserId = (): string | null => {
    const accessToken = getAccessToken();
    if (!isValidToken(accessToken)) return null;

    try {
        const decoded = jwtDecode<AccessTokenType>(accessToken!);
        return decoded.sub;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};



const AuthLayout: React.FC = () => {
    const accessToken = getAccessToken();
    if (!isValidToken(accessToken)) {
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

    return <Outlet />;
};

export default AuthLayout;
