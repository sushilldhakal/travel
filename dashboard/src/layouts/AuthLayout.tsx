import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
    id: string;
    roles: string;
};

export const getAuthUserRoles = (): string | null => {
    const accessToken = getAccessToken();
    if (!isValidToken(accessToken)) return null;

    try {
        const decoded = jwtDecode<AccessTokenType>(accessToken!);
        return decoded.roles;
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
