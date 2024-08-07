import { useMutation } from "@tanstack/react-query";
import { generateCompletion } from "@/http/api";
import { toast } from "sonner";

export const useGenerateCompletion = () => {
  return useMutation({
    mutationFn: generateCompletion,
    onSuccess: (data) => {
      if (data.completion) {
        console.log("Completion received:", data.completion);
      }
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 429) {
        toast.error("You have reached your request limit for the day.");
      } else {
        toast.error(error.message || 'Internal Server Error');
      }
    }
  });
};
