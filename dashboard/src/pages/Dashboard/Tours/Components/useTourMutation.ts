import { useMutation, useQueryClient } from '@tanstack/react-query';
// Import directly from tourApi to ensure we use multipart/form-data implementations
import { createTour, updateTour } from '@/http/tourApi';
import { useToast } from '@/components/ui/use-toast';
import { isAxiosError } from 'axios';

interface UseTourMutationProps {
  tourId?: string;
}

export const useTourMutation = ({ tourId }: UseTourMutationProps = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    onError: (error) => {
      console.log("form error", error);
      
      let errorMessage = 'An error occurred while saving the tour. Please try again later.';
      
      if (error && isAxiosError(error)) {
        // Extract more specific error information if available
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Failed to save tour',
        description: errorMessage,
        variant: "destructive"
      });
    },
  });
};