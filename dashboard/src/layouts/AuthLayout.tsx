import useTokenStore from '@/store';
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
            window.location.href = 'http://localhost:5173/';
        } else {
            navigate('/dashboard/home');
        }
    }, [navigate]); // Ensure the dependency array is properly set

    return <Outlet />;
};

type AccessTokenType = {
    email: string;
    isLoggedIn: boolean;
    id: string;
};
export const useAuth = (): boolean => {
    const accessToken = localStorage.getItem("token-store");

    if (!accessToken) return false;
    if (accessToken) {
        const decoded = jwtDecode(accessToken) as AccessTokenType;
        if (decoded.isLoggedIn) return true;
    }

    return false;
};

export const getAuthUser = (): AccessTokenType | null => {
    const accessToken = localStorage.getItem("token-store");

    if (!accessToken) return null;
    if (accessToken) {
        const decoded = jwtDecode(accessToken) as AccessTokenType;
        if (decoded.isLoggedIn) return decoded;
    }
    return null;
};


export const getAuthUserRoles = (): string | null => {
    const accessToken = localStorage.getItem('token-store');
    if (!accessToken) return null;
    try {
        const decoded: { roles: string } = jwtDecode(accessToken);
        return decoded.roles;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};