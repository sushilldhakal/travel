/**
 * Category API
 * 
 * Functions for interacting with the categories endpoints
 */

import { api, handleApiError } from './apiClient';

/**
 * Get all categories for a user (admin view - shows all categories)
 */
export const getSellerCategories = async () => {
  try {
    const response = await api.get('/api/global/categories/seller/visible');
    return response.data; // Return the full response object with success, data, count
  } catch (error) {
    handleApiError(error, 'fetching seller categories');
    return { success: false, data: [], count: 0 };
  }
};

/**
 * Get user-specific categories (user view - shows user's personal categories with their status)
 */
export const getUserCategories = async () => {
  try {
    const response = await api.get('/api/global/categories/user-categories');
    return response.data; // Returns user's personal category list with their specific isActive status
  } catch (error) {
    handleApiError(error, 'fetching user categories');
    return { success: false, data: [], count: 0 };
  }
};

export const getAllCategories = async () => {
  try {
    const response = await api.get('/api/global/categories/approved');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching categories');
    return [];
  }
};

/**
 * Get a single category by ID
 */
export const getCategory = async (categoryId: string) => {
  try {
    const response = await api.get(`/api/global/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching category details');
    throw error;
  }
};

interface CategoryData {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  slug: string;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: string;
  usageCount: number;
}

interface PreferencesData {
  seller: string;
  categoryPreferences: Array<{
    category: string;
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
    category: CategoryData;
    preferences: PreferencesData;
  };
}

interface AddCategoryResponse {
  success: boolean;
  message: string;
  data?: {
    category: CategoryData;
    preferences: PreferencesData;
  };
}

export const toggleCategoryFavorite = async (categoryId: string): Promise<ToggleFavoriteResponse> => {
  const response = await api.put(`/api/global/categories/${categoryId}/favorite`);
  return response.data;
};

export const addExistingCategoryToSeller = async (categoryId: string): Promise<AddCategoryResponse> => {
  const response = await api.post(`/api/global/categories/${categoryId}/add-to-list`);
  return response.data;
};

export const removeExistingCategoryFromSeller = async (categoryId: string): Promise<{ success: boolean; message: string; data?: PreferencesData }> => {
  const response = await api.post(`/api/global/categories/${categoryId}/remove-from-list`);
  return response.data;
};

/**
 * Toggle category active status (user-specific, not global)
 */
export const toggleCategoryActiveStatus = async (categoryId: string) => {
  try {
    const response = await api.patch(`/api/global/categories/${categoryId}/toggle-active`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'toggling category status');
    throw error;
  }
};

/**
 * Add a new category
 */
export const addCategory = async (categoryData: FormData) => {
  try {
    const response = await api.post('/api/global/categories/submit', categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'adding category');
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (categoryId: string, categoryData: FormData) => {
  try {
    const response = await api.patch(`/api/global/categories/${categoryId}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating category');
    throw error;
  }
};

/**
 * Get pending categories for admin approval
 */
export const getPendingCategories = async () => {
  try {
    const response = await api.get('/api/global/categories/admin/pending');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching pending categories');
    return [];
  }
};


/**
 * Approve a category (admin only)
 */
export const approveCategory = async (categoryId: string) => {
  try {
    const response = await api.put(`/api/global/categories/admin/${categoryId}/approve`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'approving category');
    throw error;
  }
};

/**
 * Reject a category (admin only)
 */
export const rejectCategory = async (categoryId: string, reason: string) => {
  try {
    const response = await api.put(`/api/global/categories/admin/${categoryId}/reject`, { reason });
    return response.data;
  } catch (error) {
    handleApiError(error, 'rejecting category');
    throw error;
  }
};

/**
 * Search categories for sellers (to discover existing categories before creating new ones)
 */
export const searchCategories = async (searchParams: {
  query?: string;
  parentCategory?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (searchParams.query) params.append('query', searchParams.query);
    if (searchParams.parentCategory) params.append('parentCategory', searchParams.parentCategory);

    const response = await api.get(`/api/global/categories/seller/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'searching categories');
    return { success: false, data: [], count: 0 };
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const response = await api.delete(`/api/global/categories/admin/${categoryId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting category');
    throw error;
  }
};

/**
 * Get enabled categories for seller (for tour creation)
 */
export const getEnabledCategories = async () => {
  try {
    const response = await api.get('/api/global/categories/seller/enabled');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching enabled categories');
    return { success: false, data: [], count: 0 };
  }
};

/**
 * Get categories by type
 */
export const getCategoriesByType = async (type: string) => {
  try {
    const response = await api.get(`/api/global/categories/type/${type}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching categories by type');
    return { success: false, data: [], count: 0 };
  }
};

/**
 * Update category preferences
 */
export const updateCategoryPreferences = async (
  preferences: Array<{
    categoryId: string;
    isVisible?: boolean;
    isEnabled?: boolean;
    customName?: string;
    sortOrder?: number;
  }>, 
  globalSettings?: Record<string, boolean>
) => {
  try {
    const response = await api.put('/api/global/categories/preferences', {
      preferences,
      globalSettings
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating category preferences');
    throw error;
  }
};

/**
 * Get favorite categories
 */
export const getFavoriteCategories = async () => {
  try {
    const response = await api.get('/api/global/categories/seller/favorites');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching favorite categories');
    return { success: false, data: [], count: 0 };
  }
};

