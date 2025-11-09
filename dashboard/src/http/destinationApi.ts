/**
 * Destination API
 * 
 * Functions for interacting with the destinations endpoints
 */

import { api, handleApiError } from './apiClient';

/**
 * Get all destinations for a user (from global destinations)
 */
// dashboard/src/http/destinationApi.ts
export const getSellerDestinations = async () => {
  try {
    const response = await api.get('/api/global/destinations/seller/visible');
    return response.data; // Return the full response object with success, data, count
  } catch (error) {
    handleApiError(error, 'fetching seller destinations');
    return { success: false, data: [], count: 0 };
  }
};

/**
 * Get user-specific destinations (from user.sellerInfo.destination array)
 * This includes user's personal active/inactive status for each destination
 */
export const getUserDestinations = async () => {
  try {
    const response = await api.get('/api/global/destinations/user-destinations');
    return response.data; // Returns user's personal destination list with their specific isActive status
  } catch (error) {
    handleApiError(error, 'fetching user destinations');
    return { success: false, data: [], count: 0 };
  }
};

export const getAllDestinations = async () => {
  try {
    const response = await api.get('/api/global/destinations/approved');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching destinations');
    return { success: false, data: [], count: 0 };
  }
};

/**
 * Get a single destination by ID
 */
export const getDestination = async (destinationId: string) => {
  try {
    const response = await api.get(`/api/global/destinations/${destinationId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching destination details');
    throw error;
  }
};

interface DestinationData {
  _id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: string;
  usageCount: number;
}

interface PreferencesData {
  seller: string;
  destinationPreferences: Array<{
    destination: string;
    isVisible: boolean;
    isEnabled: boolean;
    isFavorite: boolean;
  }>;
  globalSettings: Record<string, unknown>;
  lastUpdated: Date;
}

interface ToggleFavoriteResponse {
  success: boolean;
  message: string;
  data?: {
    destination: DestinationData;
    preferences: PreferencesData;
  };
}

interface AddDestinationResponse {
  success: boolean;
  message: string;
  data?: {
    destination: DestinationData;
    preferences: PreferencesData;
  };
}

export const toggleDestinationFavorite = async (destinationId: string): Promise<ToggleFavoriteResponse> => {
  const response = await api.patch(`/api/global/destinations/${destinationId}/favorite`);
  return response.data;
};

/**
 * Toggle destination active status (for sellers to control visibility)
 */
export const toggleDestinationActiveStatus = async (destinationId: string) => {
  try {
    const response = await api.patch(`/api/global/destinations/${destinationId}/toggle-active`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'toggling destination status');
    throw error;
  }
};

export const addExistingDestinationToSeller = async (destinationId: string): Promise<AddDestinationResponse> => {
  const response = await api.post(`/api/global/destinations/${destinationId}/add-to-list`);
  return response.data;
};

export const removeExistingDestinationFromSeller = async (destinationId: string): Promise<any> => {
  const response = await api.post(`/api/global/destinations/${destinationId}/remove-from-list`);
  return response.data;
};

/**
 * Add a new destination
 */
export const addDestination = async (destinationData: FormData) => {
  try {
    const response = await api.post('/api/global/destinations/submit', destinationData, {
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
    const response = await api.patch(`/api/global/destinations/${destinationId}`, destinationData, {
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
 * Get pending destinations for admin approval
 */
export const getPendingDestinations = async () => {
  try {
    const response = await api.get('/api/global/destinations/admin/pending');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching pending destinations');
    return [];
  }
};

/**
 * Approve a destination (admin only)
 */
export const approveDestination = async (destinationId: string) => {
  try {
    const response = await api.put(`/api/global/destinations/admin/${destinationId}/approve`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'approving destination');
    throw error;
  }
};

/**
 * Reject a destination (admin only)
 */
export const rejectDestination = async (destinationId: string, reason: string) => {
  try {
    const response = await api.put(`/api/global/destinations/admin/${destinationId}/reject`, { reason });
    return response.data;
  } catch (error) {
    handleApiError(error, 'rejecting destination');
    throw error;
  }
};

/**
 * Search destinations for sellers (to discover existing destinations before creating new ones)
 */
export const searchDestinations = async (searchParams: {
  query?: string;
  country?: string;
  region?: string;
  city?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (searchParams.query) params.append('query', searchParams.query);
    if (searchParams.country) params.append('country', searchParams.country);
    if (searchParams.region) params.append('region', searchParams.region);
    if (searchParams.city) params.append('city', searchParams.city);

    const response = await api.get(`/api/global/destinations/seller/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'searching destinations');
    return { success: false, data: [], count: 0 };
  }
};

export const deleteDestination = async (destinationId: string) => {
  try {
    const response = await api.delete(`/api/global/destinations/admin/${destinationId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting destination');
    throw error;
  }
};
