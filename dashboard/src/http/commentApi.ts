import { api } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * Comment API endpoints
 * 
 * Enhanced functionality includes:
 * - Reply to comments (nested structure)
 * - Like comments
 * - View tracking for comments
 * - Proper population of nested replies
 */


// Add a new comment to a post
export const addComment = async (commentData: FormData, postId: string) => {
    return api.post(`/api/posts/comment/${postId}`, commentData);
};

// Get all comments (admin function)

export const getAllComments = async () => api.get('/api/posts/comment/post');
// export const getAllComments = async () => {
//     try {
//         return api.get('/api/posts/comments');
//     } catch (error) {
//         if (isAxiosError(error)) {
//             throw new Error(`Error fetching comments: ${error.response?.data.message || error.message}`);
//         } else {
//             throw new Error(`Error fetching comments: ${String(error)}`);
//         }
//     }
// };


// Edit an existing comment
export const editComment = async (commentData: FormData, commentId: string) => {
    return api.patch(`/api/posts/comment/${commentId}`, commentData);
};


// Get all comments for a specific post
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

// Delete a comment
export const deleteComment = async (commentId: string) => {
    return api.delete(`/api/posts/comment/${commentId}`);
};

// Get count of unapproved comments
export const getUnapprovedCommentsCount = async () => {
    return api.get(`/api/posts/comment/unapproved/count`);
};

// Add a reply to a comment
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

// Like a comment
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

// Increment view count for a comment
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

// Get a comment with all its replies
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
