import { api, handleApiError } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * Category API endpoints
 */

export const getCategories = async () => api.get('/api/category');

export const getUserCategories = async (userId: string) => {
    try {
        const response = await api.get(`/api/category/user/${userId}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching user categories: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching user categories: ${String(error)}`);
        }
    }
};

export const getSingleCategory = async (categoryId: string) => {
    try {
        const response = await api.get(`/api/category/${categoryId}`);
        return response.data.categories;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching category: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching category: ${String(error)}`);
        }
    }
};

export const addCategory = async (categoryData: FormData) => {
    try {
        return api.post('/api/category', categoryData);
    } catch (error) {
        return handleApiError(error, 'adding category');
    }
};

export const updateCategory = async (categoryData: FormData, categoryId: string) => {
    try {
        return api.patch(`/api/category/${categoryId}`, categoryData);
    } catch (error) {
        return handleApiError(error, 'updating category');
    }
};

export const deleteCategory = async (categoryId: string) => {
    try {
        return api.delete(`/api/category/${categoryId}`);
    } catch (error) {
        return handleApiError(error, 'deleting category');
    }
};
