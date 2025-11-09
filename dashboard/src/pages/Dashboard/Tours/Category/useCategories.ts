// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { getSellerCategories, getUserCategories } from '@/http/categoryApi';
import { CategoryData } from '@/Provider/types';
import { getAuthUserRoles } from '@/util/authUtils';
import { api } from '@/http/apiClient';

// Extended interface for backend category data
interface BackendCategoryData {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  slug: string;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  usageCount: number;
  createdBy: string;
  submittedAt: string;
  popularity: number;
}

// Hook for admin users - shows all categories
export const useCategories = () => {
  return useQuery<CategoryData[]>({
    queryKey: ['seller-categories'],
    queryFn: async () => {
      const response = await getSellerCategories();
      if (response.success) {
        // Transform backend data to match frontend CategoryData interface
        return response.data.map((category: BackendCategoryData): CategoryData => ({
          _id: category._id,
          id: category._id, // Use _id as id for compatibility
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl || '',
          isActive: category.isActive,
          isApproved: category.isApproved,
          approvalStatus: category.approvalStatus,
          userId: category.createdBy
        }));
      }
      return [];
    },
    enabled: true,
  });
};

// Hook for regular users - shows user-specific categories with their personal status
export const useUserCategories = () => {
  return useQuery<CategoryData[]>({
    queryKey: ['user-categories'],
    queryFn: async () => {
      const response = await getUserCategories();
      if (response.success) {
        // Transform backend data to match frontend CategoryData interface
        return response.data.map((category: BackendCategoryData): CategoryData => ({
          _id: category._id,
          id: category._id, // Use _id as id for compatibility
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl || '',
          isActive: category.isActive, // This is user-specific status
          isApproved: category.isApproved, // This is user-specific status
          approvalStatus: category.approvalStatus, // This is user-specific status
          userId: category.createdBy
        }));
      }
      return [];
    },
    enabled: true,
  });
};

// Hook for pending categories (admin only)
export const usePendingCategories = () => {
  return useQuery<CategoryData[]>({
    queryKey: ['pending-categories'],
    queryFn: async () => {
      const response = await api.get('/api/global/categories/admin/pending');
      if (response.data.success) {
        // Transform backend data to match frontend CategoryData interface
        return response.data.data.map((category: BackendCategoryData): CategoryData => ({
          _id: category._id,
          id: category._id,
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl || '',
          isActive: category.isActive,
          isApproved: category.isApproved,
          approvalStatus: category.approvalStatus,
          userId: category.createdBy
        }));
      }
      return [];
    },
    enabled: true,
  });
};

// Combined hook that automatically chooses the right data source based on user role
export const useCategoriesRoleBased = () => {
  const userRole = getAuthUserRoles();
  const isAdmin = userRole === 'admin';

  // Use admin categories for admin users, user-specific categories for others
  const adminCategories = useCategories();
  const userCategories = useUserCategories();

  return isAdmin ? adminCategories : userCategories;
};

// Hook to get all approved categories for search functionality
export const useAllCategories = () => {
  return useQuery<CategoryData[]>({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const response = await api.get('/api/global/categories/seller/search'); // Get all approved categories
      if (response.data.success) {
        // Transform backend data to match frontend CategoryData interface
        return response.data.data.map((category: BackendCategoryData): CategoryData => ({
          _id: category._id,
          id: category._id,
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl || '',
          isActive: category.isActive,
          isApproved: category.isApproved,
          approvalStatus: category.approvalStatus,
          userId: category.createdBy
        }));
      }
      return [];
    },
    enabled: true,
  });
};
