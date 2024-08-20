import { toast } from '@/components/ui/use-toast';
import useTokenStore from '@/store/store';
import axios, { isAxiosError } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const token = useTokenStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
    }
    return config;
});


//login/register
export const login = async (data: { email: string; password: string, keepMeSignedIn: boolean }) => {
    return  api.post('/api/users/login', data);
};

export const getUsers = async () => api.get('/api/users/all');

export const getUserById = async (userId: string) => api.get(`/api/users/${userId}`);

export const register = async (data: { name: string; email: string; password: string, phone: string  }) =>{
    return  api.post('/api/users/register', data);
}
export const verifyEmail = async (data: { token: string }) => {
    return api.post('/api/users/login/verify', data);
}
export const forgotPassword = async (data: { email: string }) => 
    api.post('/api/users/login/forgot', data);

export const resetPassword = async (data: { token: string, password: string }) => 
    api.post('/api/users/login/reset', data);


export const getUserSetting = async (userId: string) => api.get(`/api/users/setting/${userId}`);

export const userSetting = async (userId: string, data: FormData) =>
    api.patch(`/api/users/setting/${userId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
  
//tours
export const getTours = async () => api.get('/api/tours');

export const getLatestTours = async () => api.get('/api/tours/latest');

export const getSingleTour = async (tourId: string) => {
    try {
        const response = await api.get(`/api/tours/${tourId}`);
        const tourData = response.data;
        const breadcrumbs = tourData.breadcrumbs || [];
        return {
            ...tourData,
            breadcrumbs: breadcrumbs,
        };
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};

export const createTour = async (data: FormData) =>
    api.post(`/api/tours`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
export const updateTour = async (tourId: string, data: FormData) =>
    api.patch(`/api/tours/${tourId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
export const deleteTour = async (tourId: string) => {
    try {
        const response = await api.delete(`/api/tours/${tourId}`);
        return response.data; 
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error deleting tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error deleting tour: ${String(error)}`);
        }
    }
};


//subscriber
export const subscribe = async (data: { email: string[] }) => {
    try {
        const response = await api.post('/api/subscribers/add', data);
        return response.data; 
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error in subscribe function:', error.message);
        } else {
            console.error('Error in subscribe function:', String(error));
        }
        throw error;
    }
}

export const unsubscribe = async (data: { email: string }) => {
    try {
        const response = await api.post('/api/subscribers/remove', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error unsubscribing: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error unsubscribing: ${String(error)}`);
        }
    }
}

export const getAllSubscribers = async () => {
    try {
        const response = await api.get('/api/subscribers');
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error getting all subscribers: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error getting all subscribers: ${String(error)}`);
        }
    }
}


//gallery 
export const getAllImages = async ({ pageParam = null }) => {
    try {
      // Fetch images without cursor parameter
      const response = await api.get('/api/gallery/images', {
        params: {
            nextCursor: pageParam,
            pageSize: 10,
        },
      });

      return {
        resources: response.data.data,
        nextCursor: response.data.nextCursor,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Error getting all images: ${error.response?.data.message || error.message}`);
      } else {
        throw new Error(`Error getting all images: ${String(error)}`);
      }
    }
  };

  export const getSingleImage = async (imageUrl: string, user: string | null) => {
    const publicId = extractPublicId(imageUrl);
    const userId = user || null;
    try {
        const response = await api.get(`/api/gallery/${publicId}`,  {
            params: { userId: userId },
          });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error getting image: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error getting image: ${String(error)}`);
        }
    }
  };

  const extractPublicId = (url: string) => {
    const parts = url.split('/');
    const fileName = parts.pop(); // Get the last part of the URL
    const publicId = fileName?.split('.')[0]; // Remove the file extension
    return publicId;
  };

  export const addImages = async (formData: FormData, userId: string) => {
    try {
        const response = await api.post(`/api/gallery/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
};


export const deleteImage = async (userId: string, imageIds: string | string[]) => {
    try {
        const ids = Array.isArray(imageIds) ? imageIds : [imageIds];
      const response = await api.delete(`/api/gallery/${userId}`, {
        data: { imageIds: ids },
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Error deleting image: ${error.response?.data.message || error.message}`);
      } else {
        throw new Error(`Error deleting image: ${String(error)}`);
      }
    }
  };



  export interface GenerateCompletionParams {
    prompt: string;
    option: string;
    command?: string;
  }


  export const generateCompletion = async (params: GenerateCompletionParams) => {
    try {
        const response = await api.post('/api/generate', params);
        return response.data;
      } catch (error: unknown) {
        // Check if the error is an AxiosError
        if (axios.isAxiosError(error)) {
          // Handle specific HTTP status codes
          if (error.response) {
            const status = error.response.status;
            if (status === 410) {
                toast({
                    variant: "destructive",
                    title: "No Open API Key Found",
                    description: "Please add Open API Key in setting",
                  })
            } else {
                toast({
                    variant: "destructive",
                    title: `HTTP Error: ${status}`,
                    description: `HTTP Error: ${status}`,
                  })
              
            }
          } else {
            toast({
                variant: "destructive",
                title:'An error occurred with the request.',
                description: `HTTP Error: ${error}`,
              })
          }
        } else {
            toast({
                variant: "destructive",
                title:'An unexpected error occurred.',
                description: `HTTP Error: ${error}`,
              })
        }
        throw error; // Rethrow the error if needed
      }
  };