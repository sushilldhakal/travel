import { BaseApiService } from './baseApi';
import { isAxiosError } from 'axios';

export interface BookingData {
    tourId: string;
    tourTitle: string;
    tourCode: string;
    departureDate: string;
    participants: {
        adults: number;
        children: number;
        infants?: number;
    };
    pricing: {
        basePrice: number;
        adultPrice: number;
        childPrice: number;
        infantPrice?: number;
        totalPrice: number;
        currency: string;
    };
    contactInfo: {
        fullName: string;
        email: string;
        phone: string;
        country?: string;
    };
    specialRequests?: string;
}

class BookingApiService extends BaseApiService {
    constructor() {
        super('/api/bookings');
    }

    /**
     * Create a new booking
     */
    async createBooking(bookingData: BookingData) {
        try {
            return await this.create(bookingData);
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error creating booking: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get booking by reference
     */
    async getBookingByReference(reference: string) {
        try {
            const response = await this.request({
                url: `${this.endpoint}/reference/${reference}`,
                method: 'GET',
            });
            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error fetching booking: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get user bookings
     */
    async getUserBookings(params?: { page?: number; limit?: number }) {
        try {
            const response = await this.request({
                url: `${this.endpoint}/my-bookings`,
                method: 'GET',
                params,
            });
            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error fetching user bookings: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get all bookings (admin/seller)
     */
    async getAllBookings(params?: {
        page?: number;
        limit?: number;
        status?: string;
        paymentStatus?: string;
        tourId?: string;
    }) {
        try {
            return await this.getAll(params);
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error fetching bookings: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string) {
        try {
            return await this.getById(bookingId);
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error fetching booking: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Update booking status
     */
    async updateBookingStatus(bookingId: string, status: string, notes?: string) {
        try {
            const response = await this.request({
                url: `${this.endpoint}/${bookingId}/status`,
                method: 'PATCH',
                data: { status, notes },
            });
            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error updating booking status: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(
        bookingId: string,
        paymentStatus: string,
        paidAmount?: number,
        transactionId?: string
    ) {
        try {
            const response = await this.request({
                url: `${this.endpoint}/${bookingId}/payment`,
                method: 'PATCH',
                data: { paymentStatus, paidAmount, transactionId },
            });
            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error updating payment status: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, reason?: string) {
        try {
            const response = await this.request({
                url: `${this.endpoint}/${bookingId}/cancel`,
                method: 'POST',
                data: { reason },
            });
            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error cancelling booking: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get booking statistics
     */
    async getBookingStats() {
        try {
            const response = await this.request({
                url: `${this.endpoint}/stats`,
                method: 'GET',
            });
            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(`Error fetching booking stats: ${error.response?.data.message || error.message}`);
            }
            throw error;
        }
    }
}

export const bookingApi = new BookingApiService();

// Export individual functions for backward compatibility
export const createBooking = (data: BookingData) => bookingApi.createBooking(data);
export const getBookingByReference = (reference: string) => bookingApi.getBookingByReference(reference);
export const getUserBookings = (params?: any) => bookingApi.getUserBookings(params);
export const getAllBookings = (params?: any) => bookingApi.getAllBookings(params);
export const getBookingById = (id: string) => bookingApi.getBookingById(id);
export const updateBookingStatus = (id: string, status: string, notes?: string) =>
    bookingApi.updateBookingStatus(id, status, notes);
export const updatePaymentStatus = (
    id: string,
    paymentStatus: string,
    paidAmount?: number,
    transactionId?: string
) => bookingApi.updatePaymentStatus(id, paymentStatus, paidAmount, transactionId);
export const cancelBooking = (id: string, reason?: string) => bookingApi.cancelBooking(id, reason);
export const getBookingStats = () => bookingApi.getBookingStats();
