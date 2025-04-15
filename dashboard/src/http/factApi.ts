import { api, handleApiError } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * Facts API endpoints
 */

export const getFacts = async () => {
    try {
        return api.get('/api/facts');
    } catch (error) {
        return handleApiError(error, 'fetching facts');
    }
};

export const getUserFacts = async (userId: string) => {
    try {
        const response = await api.get(`/api/facts/user/${userId}`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching user facts: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching user facts: ${String(error)}`);
        }
    }
};

export const getSingleFacts = async (factId: string) => {
    try {
        const response = await api.get(`/api/facts/${factId}`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching fact: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching fact: ${String(error)}`);
        }
    }
};

export const addFacts = async (factData: FormData) => {
    try {
        return api.post('/api/facts', factData);
    } catch (error) {
        return handleApiError(error, 'adding fact');
    }
};

export const updateFacts = async (factData: FormData, factId: string) => {
    try {
        return api.patch(`/api/facts/${factId}`, factData);
    } catch (error) {
        return handleApiError(error, 'updating fact');
    }
};

// export const updateFacts = async (factData: FormData, factId: string) => {
//     return api.patch(`/api/facts/${factId}`, factData);
// };

export const deleteFacts = async (factId: string) => {
    try {
        return api.delete(`/api/facts/${factId}`);
    } catch (error) {
        return handleApiError(error, 'deleting fact');
    }
};
