// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { getUserDestinations } from '@/http';
import { Destination } from '@/Provider/types';

export const useDestination = (userId: string | null) => {
  return useQuery<Destination[]>({
    queryKey: ['destination', userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject('No user ID provided');
      }
      return getUserDestinations(userId);
    },
    enabled: !!userId, // Only fetch if userId is defined
  });
};

