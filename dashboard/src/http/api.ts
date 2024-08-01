import useTokenStore from '@/store';
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
    console.log("this is api page log",data)
    return api.post('/api/users/login/verify', data);
}
   

export const forgotPassword = async (data: { email: string }) => 
    api.post('/api/users/login/forgot', data);

export const resetPassword = async (data: { token: string, password: string }) => 
    api.post('/api/users/login/reset', data);
//tours
export const getTours = async () => api.get('/api/tours');

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
    } catch (error: any) {
        console.error('Error in subscribe function:', error.response?.data || error.message);
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
export const getAllImages = async () => {
    try {
      // Fetch images without cursor parameter
      const response = await api.get('/api/gallery/images');
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Error getting all images: ${error.response?.data.message || error.message}`);
      } else {
        throw new Error(`Error getting all images: ${String(error)}`);
      }
    }
  };

export const addImages = async (data: FormData, userId: string) =>
    api.post(`/api/gallery/${userId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });


export const deleteImage = async (userId: string, imageIds: string | string[]) => {
    console.log('deleteImage', userId, imageIds);
    try {
        const ids = Array.isArray(imageIds) ? imageIds : [imageIds];
        console.log('deleteImage response', ids);

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