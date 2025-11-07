import axios from '../interfaces/axiosInstance.js';


class ApiService {
    
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

    
    async getBalance() {
        return this.get('/payments/balance');
    }

    async getTransactionHistory() {
        return this.get('/payments/history');
    }

    
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

    
    async updateProfile(profileData) {
        return this.put('/profile', profileData);
    }

    async getNotificationSettings() {
        return this.get('/profile/notifications');
    }

    async updateNotificationSettings(settings) {
        return this.put('/profile/notifications', settings);
    }

    
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

    
    async getSecurityEvents() {
        return this.get('/security/events');
    }

    async getActiveDevices() {
        return this.get('/security/devices');
    }

    async logoutDevice(deviceId) {
        return this.post(`/security/devices/${deviceId}/logout`);
    }

  
    async getEmployeeStats() {
        return this.get('/employee/stats');
    }

    async getEmployeePayments() {
        return this.get('/employee/payments');
    }

    async getPendingPayments() {
        return this.get('/employee/payments/pending');
    }

    async getPaymentHistory() {
        return this.get('/employee/payments/history');
    }

    async verifyPayment(paymentId) {
        return this.post(`/employee/payments/${paymentId}/verify`);
    }

    async sendPayment(paymentId) {
        return this.post(`/employee/payments/${paymentId}/send`);
    }

    async denyPayment(paymentId) {
        return this.post(`/employee/payments/${paymentId}/deny`);
    }

    
    async getEmployees() {
        return this.get('/employee/employees');
    }

    async createEmployee(employeeData) {
        return this.post('/employee/employees', employeeData);
    }

    async deleteEmployee(employeeId) {
        return this.delete(`/employee/employees/${employeeId}`);
    }

    
    async healthCheck() {
        return this.get('/health');
    }

    async testGreeting(message) {
        return this.post('/test/greet', { message });
    }
}


const apiServiceInstance = new ApiService();


export const apiService = apiServiceInstance;


export default apiServiceInstance;


export const getAllBooks = () => console.warn('getAllBooks is deprecated - use payment endpoints');
export const getBookById = (id) => console.warn('getBookById is deprecated - use payment endpoints');
export const createBook = (bookData) => console.warn('createBook is deprecated - use payment endpoints');
export const updateBook = (id, bookData) => console.warn('updateBook is deprecated - use payment endpoints');
export const deleteBook = (id) => console.warn('deleteBook is deprecated - use payment endpoints');
