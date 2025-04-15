import { api } from './apiClient';
import { isAxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

/**
 * AI Completion API endpoints
 */

interface GenerateCompletionParams {
    prompt: string;
    option: string;
    command?: string;
}

export const generateCompletion = async (params: GenerateCompletionParams) => {
    try {
        const response = await api.post('/api/ai/generate', params);
        
        if (response.status !== 200) {
            throw new Error(`Error: ${response.statusText}`);
        }
        
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            // Handle Axios errors (network errors, 4xx, 5xx responses)
            const errorMessage = error.response?.data?.message || error.message;
            
            // Show toast notification for the error
            toast({
                title: "AI Generation Error",
                description: errorMessage,
                variant: "destructive",
            });
            
            throw new Error(`AI generation failed: ${errorMessage}`);
        } else {
            // Handle non-Axios errors
            const errorMessage = String(error);
            
            toast({
                title: "AI Generation Error",
                description: errorMessage,
                variant: "destructive",
            });
            
            throw new Error(`AI generation failed: ${errorMessage}`);
        }
    }
};
