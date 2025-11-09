import { api } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * Post API endpoints
 */

export const getPost = async () => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return api.get(`/api/posts?_t=${timestamp}`);
};

export const getAllUserPosts = async () => api.get('/api/posts/user');

export const getSinglePost = async (postId: string) => {
    try {
        // Add timestamp to prevent caching issues
        const timestamp = new Date().getTime();
        const response = await api.get(`/api/posts/${postId}`, {
            params: { _t: timestamp },
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
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
