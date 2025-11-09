import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import useTokenStore from '@/store/store';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Create axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = useTokenStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor - Handle common errors
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            useTokenStore.getState().clearToken();
            window.location.href = '/auth/login';
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access forbidden');
        }

        return Promise.reject(error);
    }
);

/**
 * Base API Service Class
 * Provides common CRUD operations for all API services
 */
export class BaseApiService<T = any> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    /**
     * Get all items with optional query parameters
     */
    async getAll(params?: Record<string, any>): Promise<T> {
        const response = await apiClient.get(this.endpoint, { params });
        return response.data;
    }

    /**
     * Get a single item by ID
     */
    async getById(id: string): Promise<T> {
        const response = await apiClient.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    /**
     * Create a new item
     */
    async create(data: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await apiClient.post(this.endpoint, data, config);
        return response.data;
    }

    /**
     * Update an existing item
     */
    async update(id: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await apiClient.patch(`${this.endpoint}/${id}`, data, config);
        return response.data;
    }

    /**
     * Delete an item
     */
    async delete(id: string): Promise<T> {
        const response = await apiClient.delete(`${this.endpoint}/${id}`);
        return response.data;
    }

    /**
     * Custom request method for special endpoints
     */
    async request<R = T>(config: AxiosRequestConfig): Promise<R> {
        const response = await apiClient.request(config);
        return response.data;
    }
}

/**
 * Error handler utility
 */
export const handleApiError = (error: unknown, context: string): never => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`${context}: ${message}`);
    }
    throw new Error(`${context}: ${String(error)}`);
};

/**
 * Check if error is an Axios error
 */
export const isAxiosError = axios.isAxiosError;

// Export the configured axios instance as 'api' for backward compatibility
export const api = apiClient;
