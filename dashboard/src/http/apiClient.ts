import axios from 'axios';
import useTokenStore from '@/store/store';
import Cookies from 'js-cookie';

// Base API configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    timeout: 10000,
    withCredentials: true, // Enable credentials for cookies
});

// Request interceptor to add authorization token from cookies
api.interceptors.request.use((config) => {
    // Get token from cookie (shared with frontend)
    const token = Cookies.get('token') || useTokenStore.getState().token;

    console.log('API Request - Token found:', !!token);
    console.log('API Request - URL:', config.url);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API Request - Authorization header set');
    } else {
        console.warn('API Request - No token available');
    }

    return config;
});


// Helper function to handle errors consistently
export const handleApiError = (error: unknown, context: string) => {
    if (axios.isAxiosError(error)) {
        throw new Error(`Error ${context}: ${error.response?.data.message || error.message}`);
    } else {
        throw new Error(`Error ${context}: ${String(error)}`);
    }
};
