import { api } from './apiClient';
import { isAxiosError } from 'axios';
import useTokenStore from '@/store/store';

/**
 * Tour API endpoints
 */

export const getTours = async ({ 
  pageParam = 0,
  limit = 6
}) => {
  // Explicitly format the URL with query parameters
  const url = `/api/tours?page=${pageParam + 1}&limit=${limit}`;
  try {
    // Add a timeout to ensure the request doesn't hang
    const response = await api.get(url, { timeout: 15000 });
    
    // Ensure we're returning the data in the expected format
    if (!response.data) {
      throw new Error("Invalid response format: No data received");
    }
    
    if (!response.data.tours) {
      throw new Error("Invalid response format: No tours array");
    }
    
    const { tours, pagination } = response.data;
    
    // Return data in the format expected by useInfiniteQuery and matching TourResponse interface
    return {
      items: tours,
      nextCursor: pagination.hasNextPage ? pagination.currentPage : undefined,
      pagination,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalTours: pagination.totalTours,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage
    };
  } catch (error) {
    console.error("Error fetching tours:", error);
    
    // Check if it's an Axios error with a response
    if (isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Response:", error.response.status, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);
      }
      console.error("Error config:", error.config);
    }
    
    throw error;
  }
};

export const getUsersTours = async (userId: string) => api.get(`/api/tours/user/${userId}`);

export const getUserToursTitle = async (userId: string) => api.get(`/api/tours/user/${userId}/titles`);

export const getLatestTours = async () => api.get('/api/tour/search/latest');

export const getSingleTour = async (tourId: string) => {
    try {
        // Use the new specific endpoint for single tour
        const response = await api.get(`/api/tours/single/${tourId}`);
        // Handle both response structures
        // If response.data.tour exists, use that structure
        // Otherwise, assume the tour data is directly in response.data
        const tourData = response.data.tour || response.data;
        const breadcrumbs = response.data.breadcrumbs || [];
        
        return {
            ...tourData,
            breadcrumbs: breadcrumbs,
        };
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};

export const createTour = async (data: FormData) => {
    const token = useTokenStore.getState().token;
    return api.post(`/api/tours`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        },
    });
};

export const updateTour = async (tourId: string, data: FormData) => {
    return api.patch(`/api/tours/${tourId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteTour = async (tourId: string) => {
    try {
        const response = await api.delete(`/api/tours/${tourId}`);
        return response.data; 
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error deleting tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error deleting tour: ${String(error)}`);
        }
    }
};

export const searchTours = async (query: string) => {
    try {
        const response = await api.get(`/api/tour/search?${query}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};
