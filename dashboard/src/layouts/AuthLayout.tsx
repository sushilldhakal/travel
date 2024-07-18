import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

export const AuthLayout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const roles = getAuthUserRoles();
        if (!roles) {
            navigate('/auth/login');
        } else if (roles === 'user') {
            navigate('/');
        } else if (roles === 'admin' || roles === 'seller') {
            navigate('/dashboard/home');
        } else {
            navigate('/auth/login');
        }
    }, [navigate]);

    return <Outlet />;
};

type AccessTokenType = {
    email: string;
    isLoggedIn: boolean;
    id: string;
    roles: string;
};

export const useAuth = (): boolean => {
    const accessToken = getAccessToken();
    if (!accessToken) return false;

    try {
        const decoded = jwtDecode<AccessTokenType>(accessToken);
        return decoded.isLoggedIn;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return false;
    }
};

export const getAuthUser = (): AccessTokenType | null => {
    const accessToken = getAccessToken();
    if (!accessToken) return null;

    try {
        const decoded = jwtDecode<AccessTokenType>(accessToken);
        return decoded.isLoggedIn ? decoded : null;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};

export const getAuthUserRoles = (): string | null => {
    const accessToken = getAccessToken();
    if (!accessToken) return null;

    try {
        const decoded = jwtDecode<AccessTokenType>(accessToken);
        return decoded.roles;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};

// Utility function for getting access token
const getAccessToken = (): string | null => {
    return localStorage.getItem('token-store');
};
