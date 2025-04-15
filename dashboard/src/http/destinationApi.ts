/**
 * Destination API
 * 
 * Functions for interacting with the destinations endpoints
 */

import { api, handleApiError } from './apiClient';

/**
 * Get all destinations for a user
 */
export const getUserDestinations = async (userId: string | null) => {
  try {
    if (!userId) return [];
    const response = await api.get(`/destinations?userId=${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching destinations');
    return [];
  }
};

/**
 * Get a single destination by ID
 */
export const getDestination = async (destinationId: string) => {
  try {
    const response = await api.get(`/destinations/${destinationId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching destination details');
    throw error;
  }
};

/**
 * Add a new destination
 */
export const addDestination = async (destinationData: FormData) => {
  try {
    const response = await api.post('/destinations', destinationData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'adding destination');
    throw error;
  }
};

/**
 * Update an existing destination
 */
export const updateDestination = async (destinationId: string, destinationData: FormData) => {
  try {
    const response = await api.put(`/destinations/${destinationId}`, destinationData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating destination');
    throw error;
  }
};

/**
 * Delete a destination
 */
export const deleteDestination = async (destinationId: string) => {
  try {
    const response = await api.delete(`/destinations/${destinationId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting destination');
    throw error;
  }
};
