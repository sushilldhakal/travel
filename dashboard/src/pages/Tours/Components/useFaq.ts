// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { getUserFaq } from '@/http/api'; // Adjust the import path as needed
import { FaqData } from '@/Provider/types'; // Adjust the import path as needed

export const useFaq = (userId: string | null) => {
  return useQuery<FaqData[]>({
    queryKey: ['Faq', userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject('No user ID provided');
      }
      return getUserFaq(userId);
    },
    enabled: !!userId, // Only fetch if userId is defined
  });
};
