import { api, handleApiError } from './apiClient';
import { isAxiosError } from 'axios';

/**
 * Media API endpoints
 */

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

export const extractPublicId = (url: string) => {
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
      if (isAxiosError(error)) {
        throw new Error(`Error uploading media: ${error.response?.data.message || error.message}`);
      } else {
        throw new Error(`Error uploading media: ${String(error)}`);
      }
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
      if (isAxiosError(error)) {
        throw new Error(`Error updating media: ${error.response?.data.message || error.message}`);
      } else {
        throw new Error(`Error updating media: ${String(error)}`);
      }
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
      throw new Error(`Error deleting media: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error deleting media: ${String(error)}`);
    }
  }
};
