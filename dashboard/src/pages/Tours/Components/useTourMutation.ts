import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTour, updateTour } from '@/http/api';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'react-router-dom';

export const useTourMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tourId } = useParams<{ tourId: string }>();

  return useMutation({
    mutationFn: (data: FormData) => {
      if (tourId) {
        // If tourId is present, update the existing tour
        return updateTour(tourId, data);
      } else {
        // If no tourId, create a new tour
        return createTour(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({
        title: tourId ? 'Tour updated successfully' : 'Tour created successfully',
        description: tourId ? 'The tour has been updated successfully.' : 'The tour has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to save tour',
        description: 'An error occurred while saving the tour. Please try again later.',
      });
    },
  });
};
