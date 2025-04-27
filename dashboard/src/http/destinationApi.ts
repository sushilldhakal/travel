/**
 * Destination API
 * 
 * Functions for interacting with the destinations endpoints
 */

import { api, handleApiError } from './apiClient';

/**
 * Get all destinations for a user
 */
// dashboard/src/http/destinationApi.ts
export const getUserDestinations = async (userId: string | null) => {
  try {
    if (!userId) return [];
    const response = await api.get(`/api/destinations/user`);
    return response.data.destinations; // Changed to match backend response structure
  } catch (error) {
    handleApiError(error, 'fetching destinations');
    return [];
  }
};

export const getAllDestinations = async () => {
  try {
    const response = await api.get('/api/destinations');
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
    const response = await api.get(`/api/destinations/${destinationId}`);


    return response.data.destination;
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
    const response = await api.post('/api/destinations', destinationData, {
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
    const response = await api.patch(`/api/destinations/${destinationId}`, destinationData, {
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
    const response = await api.delete(`/api/destinations/${destinationId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting destination');
    throw error;
  }
};
