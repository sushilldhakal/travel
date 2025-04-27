import axios from 'axios';
import useTokenStore from '@/store/store';

// Base API configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000', // Use environment variable with fallback
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization token
api.interceptors.request.use((config) => {
    const token = useTokenStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
