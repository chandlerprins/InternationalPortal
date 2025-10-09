import axios from '../interfaces/axiosInstance.js';

/**
 * Customer International Payments Portal API Service
 * Handles all API communications with the banking backend
 */

class ApiService {
    // Generic request methods
    async get(endpoint) {
        try {
            const response = await axios.get(endpoint);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }

    async post(endpoint, data, config = {}) {
        try {
            const response = await axios.post(endpoint, data, config);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }

    async put(endpoint, data, config = {}) {
        try {
            const response = await axios.put(endpoint, data, config);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }

    async delete(endpoint, config = {}) {
        try {
            const response = await axios.delete(endpoint, config);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }

    // Authentication endpoints
    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    async verify2FA(code) {
        return this.post('/auth/verify-2fa', { code });
    }

    async setup2FA() {
        return this.post('/auth/2fa-setup');
    }

    async disable2FA() {
        return this.post('/auth/2fa-disable');
    }

    async logout() {
        return this.post('/auth/logout');
    }

    async getSecurityStatus() {
        return this.get('/auth/security-status');
    }

    async changePassword(passwordData) {
        return this.post('/auth/change-password', passwordData);
    }

    // Dashboard endpoints
    async getBalance() {
        return this.get('/payments/balance');
    }

    async getTransactionHistory() {
        return this.get('/payments/history');
    }

    // Payment endpoints
    async createPayment(paymentData) {
        return this.post('/payments', paymentData);
    }

    async getPayments() {
        return this.get('/payments');
    }

    async getPaymentById(id) {
        return this.get(`/payments/${id}`);
    }

    async getExchangeRate(fromCurrency, toCurrency, amount) {
        return this.get(`/payments/exchange-rate?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`);
    }

    async downloadReceipt(transactionId) {
        return this.get(`/payments/${transactionId}/receipt`);
    }

    // Profile endpoints
    async updateProfile(profileData) {
        return this.put('/profile', profileData);
    }

    async getNotificationSettings() {
        return this.get('/profile/notifications');
    }

    async updateNotificationSettings(settings) {
        return this.put('/profile/notifications', settings);
    }

    // Document endpoints
    async getDocuments() {
        return this.get('/profile/documents');
    }

    async uploadDocument(formData) {
        return this.post('/profile/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    async downloadDocument(documentId) {
        return this.get(`/profile/documents/${documentId}/download`);
    }

    async deleteDocument(documentId) {
        return this.delete(`/profile/documents/${documentId}`);
    }

    // Security endpoints
    async getSecurityEvents() {
        return this.get('/security/events');
    }

    async getActiveDevices() {
        return this.get('/security/devices');
    }

    async logoutDevice(deviceId) {
        return this.post(`/security/devices/${deviceId}/logout`);
    }

    // Health check endpoints
    async healthCheck() {
        return this.get('/health');
    }

    async testGreeting(message) {
        return this.post('/test/greet', { message });
    }
}

// Export singleton instance
const apiServiceInstance = new ApiService();

// Named export for import { apiService }
export const apiService = apiServiceInstance;

// Default export for import apiService
export default apiServiceInstance;

// Legacy book endpoints - deprecated but maintained for compatibility
export const getAllBooks = () => console.warn('getAllBooks is deprecated - use payment endpoints');
export const getBookById = (id) => console.warn('getBookById is deprecated - use payment endpoints');
export const createBook = (bookData) => console.warn('createBook is deprecated - use payment endpoints');
export const updateBook = (id, bookData) => console.warn('updateBook is deprecated - use payment endpoints');
export const deleteBook = (id) => console.warn('deleteBook is deprecated - use payment endpoints');