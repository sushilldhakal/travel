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
    
    // Log the full response structure to debug
    
    // Ensure we're returning the data in the expected format
    if (!response.data) {
      throw new Error("Invalid response format: No data received");
    }
    
    // Define tours variable to fix TypeScript errors
    let tours: Record<string, unknown>[] = [];
    
    // Handle nested data structure (data.data.data.tours)
    // First try the correct nested structure
    if (response.data?.data?.data?.tours) {
      const { tours: toursData, pagination } = response.data.data.data;
      
      // Return data in the format expected by useInfiniteQuery
      return {
        items: toursData,
        nextCursor: pagination.hasNextPage ? pagination.currentPage : undefined,
        pagination,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalTours: pagination.totalTours,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage
      };
    }
    
    // Check if response has data.data.tours
    if (response?.data?.data?.tours) {
      const toursData = response.data.data.tours;
      const { pagination } = response.data.data;
      
      return {
        items: toursData,
        nextCursor: pagination.hasNextPage ? pagination.currentPage : undefined,
        pagination,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalTours: pagination.totalTours,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage
      };
    }
    
    // Check if response has data.tours
    if (response?.data?.tours) {
      const toursData = response.data.tours;
      const { pagination } = response.data;
      
      return {
        items: toursData,
        nextCursor: pagination.hasNextPage ? pagination.currentPage : undefined,
        pagination,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalTours: pagination.totalTours,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage
      };
    }

    // Check if data array is directly available (based on console logs)
    if (response?.data?.success && Array.isArray(response?.data?.data)) {
      tours = response.data.data;
      
      // If there's no pagination info, construct our own based on pageParam and limit
      return {
        items: tours,
        nextCursor: pageParam + 1,
        currentPage: pageParam,
        totalPages: response.data.totalPages || Math.ceil((tours.length || 0) / limit),
        totalTours: response.data.totalTours || tours.length,
        hasNextPage: response.data.hasNextPage !== undefined ? response.data.hasNextPage : tours.length >= limit,
        hasPrevPage: pageParam > 0
      };
    }
    
    // If none of the above work, throw an error
    throw new Error('Invalid response format: Could not find tours array in any expected location');
    
  } catch (error) {
    console.error('Error fetching tours:', error);
    
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

export const getLatestTours = async () => {
    try {
        const response = await api.get('/api/tours/latest');
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching latest tours: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching latest tours: ${String(error)}`);
        }
    }
}

export const getSingleTour = async (tourId: string) => {
    try {
        // Use the refactored endpoint for single tour
        const response = await api.get(`/api/tours/${tourId}`);
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
    const token = useTokenStore.getState().token;
    return api.patch(`/api/tours/${tourId}`, data, {
        // Let Axios set the correct multipart boundary automatically
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
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
        // Parse the query to check if we're filtering by category
        const params = new URLSearchParams(query);
        const hasCategory = params.has('category');
        const categoryId = params.get('category');
        // Make the API request
        const response = await api.get(`/api/tour-search?${query}`);
        
        
        if (response.data?.data?.tours) {
            // If filtering by category, verify the tours have that category
            if (hasCategory && categoryId) {
                const toursWithCategory = response.data.data.tours.filter((tour: Record<string, unknown>) => {
                    if (!tour.category || !Array.isArray(tour.category)) return false;
                    return tour.category.some((cat: Record<string, unknown>) => 
                        // Based on the actual category schema structure
                        cat.value === categoryId
                    );
                });
                console.log(`Tours matching category ${categoryId}: ${toursWithCategory.length} of ${response.data.data.tours.length}`);
            }
        } else {
            console.log('No tours found in response or unexpected data structure');
        }
        
        return response.data;
    } catch (error: unknown) {
        console.error('Search error:', error);
        if (isAxiosError(error)) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw new Error(`Error searching tours: ${error.response?.data?.message || error.message}`);
        } else {
            throw new Error(`Error searching tours: ${String(error)}`);
        }
    }
};
