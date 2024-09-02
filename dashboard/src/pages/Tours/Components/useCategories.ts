// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { getUserCategories } from '@/http/api'; // Adjust the import path as needed
import { CategoryData } from '@/Provider/types'; // Adjust the import path as needed

export const useCategories = (userId: string | null) => {
  return useQuery<CategoryData[]>({
    queryKey: ['categories', userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject('No user ID provided');
      }
      return getUserCategories(userId);
    },
    enabled: !!userId, // Only fetch if userId is defined
  });
};
