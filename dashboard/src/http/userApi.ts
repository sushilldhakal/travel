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
        const response = await api.patch(`/api/users/setting/${userId}`, data);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'updating user settings');
    }
};

export const getDecryptedApiKey = async (userId: string, keyType: string) => {
    try {
        console.log(`Making API request to: /api/users/setting/${userId}/key?keyType=${keyType}`);
        const response = await api.get(`/api/users/setting/${userId}/key?keyType=${keyType}`);
        console.log('API response data structure:', Object.keys(response.data));
        console.log('API key length received:', response.data.key ? response.data.key.length : 0);
        // For security, only log the last few characters of the key
        if (response.data.key) {
            const maskedKey = '••••••' + response.data.key.slice(-4);
            console.log('API key value (partial):', maskedKey);
        }
        return response.data;
    } catch (error) {
        console.error('Raw error from API call:', error);
        if (isAxiosError(error)) {
            console.error('API error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
        return handleApiError(error, `fetching API key (${keyType})`);
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
    
// Mock data for seller applications until the backend is ready
const mockSellerApplications = [
    {
        _id: 'sa1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        roles: ['user'],
        avatar: null,
        sellerApplicationStatus: 'pending',
        sellerInfo: {
            companyName: 'Adventure Tours Inc.',
            companyAddress: '123 Main St, City, Country',
            businessType: 'Tour Operator',
            registrationNumber: 'BUS123456',
            registrationDate: '2023-01-15T00:00:00.000Z',
            taxId: 'TAX987654',
            description: 'We offer premium adventure tours across the globe.',
            website: 'https://adventuretours.example.com',
            socialMediaLinks: {
                facebook: 'https://facebook.com/adventuretours',
                instagram: 'https://instagram.com/adventuretours'
            }
        },
        createdAt: '2023-06-10T00:00:00.000Z',
        updatedAt: '2023-06-10T00:00:00.000Z'
    },
    {
        _id: 'sa2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        roles: ['user'],
        avatar: null,
        sellerApplicationStatus: 'approved',
        sellerInfo: {
            companyName: 'Exotic Travels',
            companyAddress: '456 Elm St, Metro City, Country',
            businessType: 'Travel Agency',
            registrationNumber: 'BUS789012',
            registrationDate: '2023-02-20T00:00:00.000Z',
            taxId: 'TAX123456',
            description: 'Specialized in exotic destinations and cultural experiences.',
            website: 'https://exotictravels.example.com',
            socialMediaLinks: {
                facebook: 'https://facebook.com/exotictravels',
                twitter: 'https://twitter.com/exotictravels'
            }
        },
        createdAt: '2023-05-15T00:00:00.000Z',
        updatedAt: '2023-06-15T00:00:00.000Z'
    },
    {
        _id: 'sa3',
        name: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '+1122334455',
        roles: ['user'],
        avatar: null,
        sellerApplicationStatus: 'rejected',
        rejectionReason: 'Insufficient business information provided.',
        sellerInfo: {
            companyName: 'City Tours',
            companyAddress: '789 Oak St, Old Town, Country',
            businessType: 'Local Tour Guide',
            registrationNumber: 'BUS345678',
            registrationDate: '2023-03-10T00:00:00.000Z',
            taxId: 'TAX345678',
            description: 'Local city tours with experienced guides.',
            website: 'https://citytours.example.com'
        },
        createdAt: '2023-04-05T00:00:00.000Z',
        updatedAt: '2023-04-20T00:00:00.000Z'
    }
];

export const getSellerApplications = async () => {
    try {
        // Attempt to get data from API
        const response = await api.get('/api/users/seller-applications');
        return response.data;
    } catch (error) {
        console.warn('Using mock data for seller applications as the API endpoint returned an error:', error);
        
        // Return mock data with a structure similar to the expected API response
        return {
            success: true,
            data: mockSellerApplications
        };
        
        // Uncomment this to throw the actual error instead of using mock data
        // return handleApiError(error, 'fetching seller applications');
    }
};

export const approveSellerApplication = async (userId: string) => {
    try {
        const response = await api.patch(`/api/users/${userId}/approve-seller`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error approving seller application: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error approving seller application: ${String(error)}`);
        }
    }
};

export const rejectSellerApplication = async (userId: string, reason?: string) => {
    try {
        const response = await api.patch(`/api/users/${userId}/reject-seller`, { reason });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error rejecting seller application: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error rejecting seller application: ${String(error)}`);
        }
    }
};