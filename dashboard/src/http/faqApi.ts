import { api, handleApiError } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * FAQ API endpoints
 */

export const getFaq = async () => {
    try {
        return api.get('/api/faqs');
    } catch (error) {
        return handleApiError(error, 'fetching FAQs');
    }
};

export const getUserFaq = async (userId: string) => {
    try {
        const response = await api.get(`/api/faqs/user/${userId}`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching user FAQ: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching user FAQ: ${String(error)}`);
        }
    }
};

export const getSingleFaq = async (faqId: string) => {
    try {
        const response = await api.get(`/api/faqs/${faqId}`);
        return response.data.faqs;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching FAQ: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching FAQ: ${String(error)}`);
        }
    }
};

export const addFaq = async (faqData: FormData) => {
    try {
        return api.post('/api/faqs', faqData);
    } catch (error) {
        return handleApiError(error, 'adding FAQ');
    }
};

export const updateFaq = async (faqData: FormData, faqId: string) => {
    try {
        return api.patch(`/api/faqs/${faqId}`, faqData);
    } catch (error) {
        return handleApiError(error, 'updating FAQ');
    }
};

export const deleteFaq = async (faqId: string) => {
    try {
        return api.delete(`/api/faqs/${faqId}`);
    } catch (error) {
        return handleApiError(error, 'deleting FAQ');
    }
};
