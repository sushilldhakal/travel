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

export const getUsersTours = async (userId:string) => api.get(`/api/tours/${userId}`);

export const getLatestTours = async () => api.get('/api/tour/search/latest');

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
export const getAllMedia = async ({ pageParam = null, mediaType }: { pageParam: number | null; mediaType: string }) => {
    try {
      // Fetch images without cursor parameter
      const response = await api.get(`/api/gallery/media`, {
        params: {
            mediaType,
            page: pageParam, 
            nextCursor: pageParam,
            pageSize: 10,
        },
      });
      return {
        resources: response.data[mediaType], // Access the correct media type
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

  export const getSingleMedia = async (imageUrl: string, user: string | null) => {
    const publicId = extractPublicId(imageUrl);
    const userId = user || null;
    const mediaType = imageUrl.split('/').slice(-3).join('/');
    const resourcesType = mediaType.split('/')[1];
    try {
        const response = await api.get(`/api/gallery/${publicId}`,  {
            params: { userId: userId, resourcesType: resourcesType },
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

  export const addMedia = async (formData: FormData, userId: string) => {
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

export const updateMedia = async (formData: FormData, userId: string, imageId: string, mediaType: string) => {
    console.log(`/api/gallery/${userId}/${imageId}?mediaType=${mediaType}`)
    console.log("formData in api",formData)
    try {
        const response = await api.patch(`/api/gallery/${userId}/${imageId}?mediaType=${mediaType}`, formData, {
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



export const deleteMedia = async (userId: string, imageIds: string | string[], mediaType: string) => {
    console.log("imageIds",userId, imageIds)
    try {
        const ids = Array.isArray(imageIds) ? imageIds : [imageIds];
      const response = await api.delete(`/api/gallery/${userId}`, {
        data: { imageIds: ids, mediaType },
      }
    );
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


// category
export const getCategories = async () => api.get('/api/category');

export const getUserCategories = async (userId: string) => {
    try {
        const response = await api.get(`/api/category/user/${userId}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};

export const getSingleCategory = async (categoryId: string) => {
    try {
        const response = await api.get(`/api/category/${categoryId}`);
        return response.data.categories;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};


export const addCategory = async (categoryData: FormData) => {
    return api.post('/api/category', categoryData);
};

export const updateCategory = async (categoryData: FormData, categoryId: string) => {
    return api.patch(`/api/category/${categoryId}`, categoryData);
};

export const deleteCategory = async (categoryId: string) => {
    console.log("categoryId",categoryId)
    return api.delete(`/api/category/${categoryId}`);
};


export const searchTours = async (query: string) => {
    try {
        const response = await api.get(`/api/tour/search?${query}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
}


//facts

export const getFacts = async () => api.get('/api/facts');

export const getUserFacts = async (userId: string) => {
    try {
        const response = await api.get(`/api/facts/user/${userId}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};

export const getSingleFacts = async (factId: string) => {
    try {
        const response = await api.get(`/api/facts/${factId}`);
        return response.data.facts;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};


export const addFacts = async (factData: FormData) => {
    return api.post('/api/facts', factData);
};

export const updateFacts = async (factData: FormData, factId: string) => {
    return api.patch(`/api/facts/${factId}`, factData);
};

export const deleteFacts = async (factId: string) => {
    console.log("factId",factId)
    return api.delete(`/api/facts/${factId}`);
};



//faq

export const getFaq = async () => api.get('/api/faqs');

export const getUserFaq = async (userId: string) => {
    try {
        const response = await api.get(`/api/faqs/user/${userId}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};

export const getSingleFaq = async (faqId: string) => {
    try {
        const response = await api.get(`/api/faqs/${faqId}`);
        return response.data.faqs;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching tour: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching tour: ${String(error)}`);
        }
    }
};


export const addFaq = async (faqData: FormData) => {
    return api.post('/api/faqs', faqData);
};

export const updateFaq = async (faqData: FormData, faqId: string) => {
    return api.patch(`/api/faqs/${faqId}`, faqData);
};

export const deleteFaq = async (faqId: string) => {
    return api.delete(`/api/faqs/${faqId}`);
};





//posts
export const getPost = async () => api.get('/api/posts');


export const getAllUserPosts = async () => api.get('/api/posts/user');

export const getSinglePost = async (postId: string) => {
    try {
        const response = await api.get(`/api/posts/${postId}`);
        
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching post: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching post: ${String(error)}`);
        }
    }
};

export const addPost = async (postData: FormData) => {
    return api.post('/api/posts/add', postData);
};

export const updatePost = async (postData: FormData, postId: string) => {
    return api.patch(`/api/posts/${postId}`, postData);
};

export const deletePost = async (postId: string) => {
    return api.delete(`/api/posts/${postId}`);
};

//comment
export const addComment = async (commentData: FormData, postId: string) => {
    return api.post(`/api/posts/comment/${postId}`, commentData);
};

export const getAllComments = async () => api.get('/api/posts/comment/post');

export const editComment = async (commentData: FormData, commentId: string) => {
    return api.patch(`/api/posts/comment/${commentId}`, commentData);
};


export const getCommentsByPost = async (postId: string) => {
    try {
        const response = await api.get(`/api/posts/comment/post/${postId}`);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching post: ${error.response?.data.message || error.message}`);
        } else {
            throw new Error(`Error fetching post: ${String(error)}`);
        }
    }
};

export const deleteComment = async (commentId: string) => {
    return api.delete(`/api/posts/comment/${commentId}`);
};

export const getUnapprovedCommentsCount = async () => {
    return api.get(`/api/posts/comment/unapproved/count`);
};
