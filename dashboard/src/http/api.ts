import useTokenStore from '@/store';
import axios from 'axios';

const api = axios.create({
    //baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
    baseURL: 'http://localhost:8000',
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
