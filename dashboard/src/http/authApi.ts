import { api, handleApiError } from './apiClient';

/**
 * Authentication API endpoints
 */

export const login = async (data: { email: string; password: string, keepMeSignedIn: boolean }) => {
    try {
        return api.post('/api/users/login', data);
    } catch (error) {
        return handleApiError(error, 'logging in');
    }
};

export const register = async (data: { name: string; email: string; password: string, phone: string }) => {
    try {
        return api.post('/api/users/register', data);
    } catch (error) {
        return handleApiError(error, 'registering');
    }
};

export const verifyEmail = async (data: { token: string }) => {
    try {
        return api.post('/api/users/login/verify', data);
    } catch (error) {
        return handleApiError(error, 'verifying email');
    }
};

export const forgotPassword = async (data: { email: string }) => {
    try {
        return api.post('/api/users/login/forgot', data);
    } catch (error) {
        return handleApiError(error, 'requesting password reset');
    }
};

export const resetPassword = async (data: { token: string, password: string }) => {
    try {
        return api.post('/api/users/login/reset', data);
    } catch (error) {
        return handleApiError(error, 'resetting password');
    }
};
