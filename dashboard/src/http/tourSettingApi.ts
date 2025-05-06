import { api } from './apiClient';
import { isAxiosError } from 'axios';

export interface TourSetting {
  id?: string;
  partialPayments: {
    enabled: boolean;
    depositPercentage: number;
  };
  pickupLocations: Array<{
    id: string;
    name: string;
    address: string;
    transferMode: string;
  }>;
  cancellationPolicy: {
    type: string;
    details: string;
  };
  requirements: {
    passportRequired: boolean;
    visaRequired: boolean;
    additionalRequirements: string;
  };
  groupSize: {
    minSize: number;
    maxSize: number;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    serviceAnimalsAllowed: boolean;
    notes: string;
  };
  ageRestrictions: {
    minimumAge: number;
    seniorAge: number;
    hasAgeRestriction: boolean;
  };
}

export const getTourSettings = async () => {
  try {
    const response = await api.get('/api/tour-settings');
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error fetching tour settings: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error fetching tour settings: ${String(error)}`);
    }
  }
};

export const updateTourSettings = async (data: TourSetting) => {
  try {
    const response = await api.post('/api/tour-settings', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`Error updating tour settings: ${error.response?.data.message || error.message}`);
    } else {
      throw new Error(`Error updating tour settings: ${String(error)}`);
    }
  }
};
