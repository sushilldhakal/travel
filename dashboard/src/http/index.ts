/**
 * API Module Index
 * 
 * This file exports all API functions from their respective modules
 * to provide a unified import point for the application.
 */

// Export the API client
export { api, handleApiError } from './apiClient';

// Export all API functions by category
export * from './authApi';
export * from './userApi';
export * from './tourApi';
export * from './reviewApi';
export * from './categoryApi';
export * from './factApi';
export * from './faqApi';
export * from './postApi';
export * from './commentApi';
export * from './mediaApi';
export * from './subscriberApi';
export * from './aiApi';
export * from './destinationApi';
export * from './tourSettingApi';
export * from './companyApi';
