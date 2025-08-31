import { api } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * Review API endpoints
 */

export const getPendingReviews = async () => {
    try {
        const response = await api.get('/api/reviews/pending');
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching pending reviews: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching pending reviews: ${String(error)}`);
        }
    }
};

export const getTourReviews = async (tourId: string, status?: string) => {
    try {
        const url = status 
            ? `/api/reviews/tour/${tourId}?status=${status}` 
            : `/api/reviews/tour/${tourId}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour reviews: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour reviews: ${String(error)}`);
        }
    }
};

export const updateReviewStatus = async (tourId: string, reviewId: string, status: 'approved' | 'rejected') => {
    try {
        const response = await api.patch(`/api/reviews/tour/${tourId}/review/${reviewId}/status`, { status });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error updating review status: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error updating review status: ${String(error)}`);
        }
    }
};

export const addReviewReply = async (tourId: string, reviewId: string, comment: string) => {
    try {
        const response = await api.post(`/api/reviews/tour/${tourId}/review/${reviewId}/reply`, { comment });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error adding reply: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error adding reply: ${String(error)}`);
        }
    }
};

export const likeReview = async (tourId: string, reviewId: string) => {
    try {
        const response = await api.post(`/api/reviews/tour/${tourId}/review/${reviewId}/like`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error liking review: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error liking review: ${String(error)}`);
        }
    }
};

export const addReview = async (tourId: string, rating: number, comment: string) => {
    try {
        // Include tourId as 'tour' field in the request body to satisfy backend validation
        const response = await api.post(`/api/reviews/tour/${tourId}`, { rating, comment, tour: tourId });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error submitting review: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error submitting review: ${String(error)}`);
        }
    }
};

export const getAllReviews = async () => {
    try {
        const response = await api.get('/api/reviews/all');
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching all reviews: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching all reviews: ${String(error)}`);
        }
    }
};

export const getApprovedReviews = async (limit?: number) => {
    try {
        const url = limit 
            ? `/api/reviews/approved/all?limit=${limit}` 
            : `/api/reviews/approved/all`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching approved reviews: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching approved reviews: ${String(error)}`);
        }
    }
};

export const getTourRating = async (tourId: string) => {
    try {
        const response = await api.get(`/api/reviews/tour/${tourId}/rating`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour rating: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour rating: ${String(error)}`);
        }
    }
};

export const incrementReviewView = async (tourId: string, reviewId: string) => {
    try {
        const response = await api.post(`/api/reviews/tour/${tourId}/review/${reviewId}/view`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error incrementing review view: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error incrementing review view: ${String(error)}`);
        }
    }
};

export const incrementReplyView = async (tourId: string, reviewId: string, replyId: string) => {
    try {
        const response = await api.post(`/api/reviews/tour/${tourId}/review/${reviewId}/reply/${replyId}/view`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error incrementing reply view: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error incrementing reply view: ${String(error)}`);
        }
    }
};

export const likeReply = async (tourId: string, replyId: string) => {
    try {
        const response = await api.post(`/api/reviews/tours/${tourId}/replies/${replyId}/like`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error liking reply: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error liking reply: ${String(error)}`);
        }
    }
};

export const likeReplyReview = async (tourId: string, reviewId: string, replyId: string) => {
    try {
        const response = await api.post(`/api/reviews/tour/${tourId}/review/${reviewId}/reply/${replyId}/like`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error liking reply: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error liking reply: ${String(error)}`);
        }
    }
};
