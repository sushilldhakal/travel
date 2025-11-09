import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import useTokenStore from '@/store/store';

export type AccessTokenType = {
    sub: string;
    roles: string;
    iat: number;
    exp: number;
};

/**
 * Custom hook for authentication
 * Provides auth state and methods
 */
export const useAuth = () => {
    const { token, setToken, clearToken } = useTokenStore();

    // Decode token
    const decodedToken = useMemo(() => {
        if (!token) return null;
        try {
            return jwtDecode<AccessTokenType>(token);
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }, [token]);

    // Check if token is valid
    const isAuthenticated = useMemo(() => {
        if (!decodedToken) return false;
        return decodedToken.exp * 1000 > Date.now();
    }, [decodedToken]);

    // Get user ID
    const userId = decodedToken?.sub || null;

    // Get user roles
    const roles = decodedToken?.roles || null;

    // Check if user is admin
    const isAdmin = useMemo(() => {
        return roles === 'admin';
    }, [roles]);

    // Check if user is seller
    const isSeller = useMemo(() => {
        return roles === 'seller';
    }, [roles]);

    // Check if user is admin or seller
    const isAdminOrSeller = useMemo(() => {
        return roles === 'admin' || roles === 'seller';
    }, [roles]);

    // Logout function
    const logout = () => {
        clearToken();
        window.location.href = '/auth/login';
    };

    // Login function
    const login = (newToken: string) => {
        setToken(newToken);
    };

    return {
        // State
        token,
        userId,
        roles,
        isAuthenticated,
        isAdmin,
        isSeller,
        isAdminOrSeller,
        decodedToken,

        // Methods
        login,
        logout,
    };
};
