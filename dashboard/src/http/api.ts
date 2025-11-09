import { toast } from '@/components/ui/use-toast';
import useTokenStore from '@/store/store';
import axios, { isAxiosError } from 'axios';

// Base API configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000', // Use environment variable with fallback
    timeout: 10000,
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


export const getUserSetting = async (userId: string) => {
    const response = await api.get(`/api/users/setting/${userId}`);
    return response.data;
};

export const userSetting = async (userId: string, data: FormData) =>
    api.patch(`/api/users/setting/${userId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

// Get decrypted API key (only when needed for actual API operations)
export const getDecryptedApiKey = async (userId: string, keyType: string) => {
    const response = await api.get(`/api/users/setting/${userId}/key?keyType=${keyType}`);
    return response.data;
};
  
//tours
export const getTours = async (page = 1, limit = 10) => api.get(`/api/tours?page=${page}&limit=${limit}`);

export const getUsersTours = async (userId:string) => api.get(`/api/tours/user/${userId}`);

export const getLatestTours = async () => api.get('/api/tour/search/latest');

export const getSingleTour = async (tourId: string) => {
    try {
        // Use the new specific endpoint for single tour
        const response = await api.get(`/api/tours/single/${tourId}`);
        
        // Handle both response structures
        // If response.data.tour exists, use that structure
        // Otherwise, assume the tour data is directly in response.data
        const tourData = response.data.tour || response.data;
        const breadcrumbs = response.data.breadcrumbs || [];
        
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

export const createTour = async (data: FormData) => {
    return api.post(`/api/tours`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
export const updateTour = async (tourId: string, data: FormData) => {
    return api.patch(`/api/tours/${tourId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
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


// category - deprecated, use getAllCategories from categoryApi instead
// export const getCategories = async () => api.get('/api/category');

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
export const getPost = async () => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return api.get(`/api/posts?_t=${timestamp}`);
};

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

export const likePost = async (postId: string, userId: string) => {
  try {
    const response = await api.patch(`/api/posts/like/${postId}`, { userId });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error liking post: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error liking post: ${String(error)}`);
    }
  }
};

export const viewPost = async (postId: string) => {
  try {
    const response = await api.patch(`/api/posts/view/${postId}`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error tracking post view: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error tracking post view: ${String(error)}`);
    }
  }
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

// New comment functions
// export const addReply = async (commentData: FormData, commentId: string) => {
//   try {
//     const response = await api.post(`/api/posts/comment/reply/${commentId}`, commentData);
//     return response.data;
//   } catch (error) {
//     if (isAxiosError(error)) {
//       throw new Error(`Error adding reply: ${error.response?.data.message || error.message}`);
//     } else {
//       throw new Error(`Error adding reply: ${String(error)}`);
//     }
//   }// In api.ts, change the addReply function:
  export const addReply = async (data: { text: string, user: string, post: string }, commentId: string) => {
    try {
      const response = await api.post(`/api/posts/comment/reply/${commentId}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Error adding reply: ${error.response?.data.message || error.message}`);
      } else {
        throw new Error(`Error adding reply: ${String(error)}`);
      }
    }
  };
  


export const likeComment = async (commentId: string, userId: string) => {
  try {
    const response = await api.patch(`/api/posts/comment/like/${commentId}`, { userId });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error toggling comment like: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error toggling comment like: ${String(error)}`);
    }
  }
};

export const viewComment = async (commentId: string) => {
  try {
    const response = await api.patch(`/api/posts/comment/view/${commentId}`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error tracking comment view: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error tracking comment view: ${String(error)}`);
    }
  }
};

export const getCommentWithReplies = async (commentId: string) => {
  try {
    const response = await api.get(`/api/posts/comment/${commentId}/replies`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error getting comment with replies: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error getting comment with replies: ${String(error)}`);
    }
  }
};

// Avatar functions
export const uploadAvatar = async (userId: string, avatarData: File | FormData | string) => {
  try {
    const formData = new FormData();
    
    if (typeof avatarData === 'string') {
      // If avatarData is a string (URL), append it as avatarUrl
      formData.append('avatarUrl', avatarData);
    } else if (avatarData instanceof File) {
      // If avatarData is a File, append it as avatar
      formData.append('avatar', avatarData);
    } else if (avatarData instanceof FormData) {
      // If avatarData is already a FormData, use it directly
      return api.post(`/api/users/${userId}/avatar`, avatarData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(response => response.data);
    }
    
    const response = await api.post(`/api/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error uploading avatar: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error uploading avatar: ${String(error)}`);
    }
  }
};

export const getUserAvatar = async (userId: string) => {
  try {
    const response = await api.get(`/api/users/${userId}/avatar`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      // Return null if avatar not found (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error getting avatar: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error getting avatar: ${String(error)}`);
    }
  }
};

// Change password for a user
export const changeUserPassword = async (userId: string, data: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await api.post(`/api/users/${userId}/change-password`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error changing password: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error changing password: ${String(error)}`);
    }
  }
};

//reviews
export const getPendingReviews = async () => {
  try {
    const response = await api.get('/api/tours/reviews/pending');
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error fetching pending reviews: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error fetching pending reviews: ${String(error)}`);
    }
  }
};

export const getTourReviews = async (tourId: string, status?: string) => {
  try {
    const url = status 
      ? `/api/tours/${tourId}/reviews?status=${status}` 
      : `/api/tours/${tourId}/reviews`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error fetching tour reviews: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error fetching tour reviews: ${String(error)}`);
    }
  }
};

export const updateReviewStatus = async (tourId: string, reviewId: string, status: 'approved' | 'rejected') => {
  try {
    const response = await api.patch(`/api/tours/${tourId}/reviews/${reviewId}/status`, { status });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error updating review status: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error updating review status: ${String(error)}`);
    }
  }
};

export const addReviewReply = async (tourId: string, reviewId: string, comment: string) => {
  try {
    const response = await api.post(`/api/tours/${tourId}/reviews/${reviewId}/replies`, { comment });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error adding reply: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error adding reply: ${String(error)}`);
    }
  }
};

export const likeReview = async (tourId: string, reviewId: string) => {
  try {
    const response = await api.post(`/api/tours/${tourId}/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error liking review: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error liking review: ${String(error)}`);
    }
  }
};

export const addReview = async (tourId: string, rating: number, comment: string) => {
  try {
    const response = await api.post(`/api/tours/${tourId}/reviews`, { rating, comment });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error submitting review: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error submitting review: ${String(error)}`);
    }
  }
};

export const getAllReviews = async () => {
  try {
    const response = await api.get('/api/tours/reviews/all');
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error fetching all reviews: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error fetching all reviews: ${String(error)}`);
    }
  }
};

export const incrementReviewView = async (tourId: string, reviewId: string) => {
  try {
    const response = await api.post(`/api/tours/${tourId}/reviews/${reviewId}/view`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error incrementing review view: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error incrementing review view: ${String(error)}`);
    }
  }
};

export const incrementReplyView = async (tourId: string, replyId: string) => {
  try {
    const response = await api.post(`/api/tours/${tourId}/replies/${replyId}/view`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error incrementing reply view: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error incrementing reply view: ${String(error)}`);
    }
  }
};

export const likeReply = async (tourId: string, replyId: string) => {
  try {
    const response = await api.post(`/api/tours/${tourId}/replies/${replyId}/like`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error liking reply: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error liking reply: ${String(error)}`);
    }
  }
};
