import useTokenStore from '@/store';
import axios, { isAxiosError } from 'axios';

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

export const getSingleTour = async (tourId: string) => {
    try {
        const response = await api.get(`/api/tours/${tourId}`);
        const tourData = response.data;
        const breadcrumbs = tourData.breadcrumbs || [];
        return {
            ...tourData,
            breadcrumbs: breadcrumbs,
        };
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};

export const createTour = async (data: FormData) =>
    api.post(`/api/tours`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
export const updateTour = async (tourId: string, data: FormData) =>
    api.patch(`/api/tours/${tourId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
export const deleteTour = async (tourId: string) => {
    try {
        const response = await api.delete(`/api/tours/${tourId}`);
        return response.data; 
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error deleting tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error deleting tour: ${String(error)}`);
        }
    }
};



export const subscribe = async (data: { email: string }) => {
    try {
        const response = await api.post('/api/subscribers/add', data);
        return response.data; 
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error Subscribing: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error Subscribing: ${String(error)}`);
        }
    }
}

export const unsubscribe = async (data: { email: string }) => {
    try {
        const response = await api.post('/api/subscriber/remove', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error unsubscribing: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error unsubscribing: ${String(error)}`);
        }
    }
}

export const getAllSubscribers = async () => {
    try {
        const response = await api.get('/api/subscriber');
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error getting all subscribers: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error getting all subscribers: ${String(error)}`);
        }
    }
}