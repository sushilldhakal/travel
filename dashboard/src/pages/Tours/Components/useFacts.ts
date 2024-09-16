// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { getUserFacts } from '@/http/api'; // Adjust the import path as needed
import { FactData } from '@/Provider/types'; // Adjust the import path as needed

export const useFacts = (userId: string | null) => {
  return useQuery<FactData[]>({
    queryKey: ['Facts', userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject('No user ID provided');
      }
      return getUserFacts(userId);
    },
    enabled: !!userId, // Only fetch if userId is defined
  });
};
