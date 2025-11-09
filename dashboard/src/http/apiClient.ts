import axios from 'axios';
import useTokenStore from '@/store/store';

// Base API configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000', // Use environment variable with fallback
    timeout: 10000,
});

// Request interceptor to add authorization token
api.interceptors.request.use((config) => {
    // Try multiple ways to get the token
    let token = useTokenStore.getState().token;
    
    // If no token from Zustand, try localStorage directly
    if (!token) {
        try {
            const stored = localStorage.getItem('token-store');
            if (stored) {
                const parsed = JSON.parse(stored);
                token = parsed?.state?.token || parsed?.token;
            }
        } catch (e) {
            console.warn('Failed to parse token from localStorage:', e);
        }
    }
    
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
