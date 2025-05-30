import { api, handleApiError } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * User API endpoints
 */

export const getUsers = async () => {
    try {
        return api.get('/api/users/all');
    } catch (error) {
        return handleApiError(error, 'fetching users');
    }
};

export const getUserById = async (userId: string) => {
    try {
        return api.get(`/api/users/${userId}`);
    } catch (error) {
        return handleApiError(error, 'fetching user');
    }
};

export const getUserSetting = async (userId: string) => {
    try {
        const response = await api.get(`/api/users/setting/${userId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetching user settings');
    }
};

export const userSetting = async (userId: string, data: FormData) => {
    try {
        const response = await api.post(`/api/users/setting/${userId}`, data);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'updating user settings');
    }
};

export const getDecryptedApiKey = async (userId: string, keyType: string) => {
    try {
        const response = await api.get(`/api/users/key/${userId}?keyType=${keyType}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetching API key');
    }
};

export const changeUserPassword = async (userId: string, data: { currentPassword: string; newPassword: string }) => {
    try {
        const response = await api.post(`/api/users/${userId}/change-password`, data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error changing password: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error changing password: ${String(error)}`);
        }
    }
};

// Avatar functions
export const uploadAvatar = async (userId: string, avatarData: File | FormData | string) => {
    try {
        let formData: FormData;
        
        if (avatarData instanceof File) {
            formData = new FormData();
            formData.append('avatar', avatarData);
        } else if (avatarData instanceof FormData) {
            formData = avatarData;
        } else {
            // If it's a string (URL), we need to create a FormData with the URL
            formData = new FormData();
            formData.append('avatarUrl', avatarData);
        }
        
        const response = await api.post(`/api/users/${userId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error uploading avatar: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error uploading avatar: ${String(error)}`);
        }
    }
};

export const getUserAvatar = async (userId: string) => {
    try {
        const response = await api.get(`/api/users/${userId}/avatar`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching avatar: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching avatar: ${String(error)}`);
        }
    }
};

export const updateUser = async (userId: string, data: { name: string; email: string; phone: string }) => {
    try {
        const response = await api.patch(`/api/users/${userId}`, data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error updating user: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error updating user: ${String(error)}`);
        }
    }
};
    
export const approveSellerApplication = async (userId: string) => {
    try {
        const response = await api.patch(`/api/users/${userId}/approve-seller`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error updating user: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error updating user: ${String(error)}`);
        }
    }
};