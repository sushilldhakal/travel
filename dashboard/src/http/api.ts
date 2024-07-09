import useTokenStore from '@/store';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const token = useTokenStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
    }
    return config;
});

export const login = async (data: { email: string; password: string }) => {
    return  api.post('/api/users/login', data);
};

export const getUsers = async () => api.get('/api/users/all');

export const register = async (data: { name: string; email: string; password: string }) =>
    api.post('/api/users/register', data);

export const getTours = async () => api.get('/api/tours');


export const deleteTours = async (tourId: string) => {
    try {
        const response = await api.delete(`/api/tours/${tourId}`);
        return response.data; // Return whatever response data you expect from your backend
    } catch (error) {
        console.error('Error deleting tour:', error.response ? error.response.data : error.message);
        throw new Error(`Error deleting tour: ${error.message}`);
    }
};

