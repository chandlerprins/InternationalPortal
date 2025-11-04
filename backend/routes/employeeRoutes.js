const express = require('express');
const {
    getAllPayments,
    getPendingPayments,
    verifyPayment,
    sendPayment,
    denyPayment,
    getPaymentHistory,
    getPaymentStats,
    getUserActivity,
    getEmployees,
    createEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const { verifyAccessToken, verifyCsrfToken, verifyRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// All employee routes require authentication and employee/admin role
const employeeAuth = [verifyAccessToken, verifyRole(['employee', 'admin'])];

// Admin-only routes require admin role
const adminAuth = [verifyAccessToken, verifyRole(['admin'])];

// Get payment statistics (GET) - No CSRF needed
router.get('/stats', employeeAuth, getPaymentStats);

// Get all payments for review (GET) - No CSRF needed
router.get('/payments', employeeAuth, getAllPayments);

// Get pending payments only (GET) - No CSRF needed
router.get('/payments/pending', employeeAuth, getPendingPayments);

// Get payment history (approved/denied payments) (GET) - No CSRF needed
router.get('/payments/history', employeeAuth, getPaymentHistory);

// Verify/approve a payment (POST) - Requires CSRF protection
router.post('/payments/:paymentId/verify', employeeAuth.concat(verifyCsrfToken), verifyPayment);

// Mark payment as sent (POST) - Requires CSRF protection
router.post('/payments/:paymentId/send', employeeAuth.concat(verifyCsrfToken), sendPayment);

// Deny a payment (POST) - Requires CSRF protection
router.post('/payments/:paymentId/deny', employeeAuth.concat(verifyCsrfToken), denyPayment);

// Get user activity summary (GET) - No CSRF needed
router.get('/users/activity', employeeAuth, getUserActivity);

// ADMIN ROUTES: Employee Management

// Get all employees (GET) - Admin only, No CSRF needed
router.get('/employees', adminAuth, getEmployees);

// Create new employee (POST) - Admin only, Requires CSRF protection
router.post('/employees', adminAuth.concat(verifyCsrfToken), createEmployee);

// Delete employee (DELETE) - Admin only, Requires CSRF protection
router.delete('/employees/:employeeId', adminAuth.concat(verifyCsrfToken), deleteEmployee);

// Security status endpoint for employees
router.get('/security-status', employeeAuth, (req, res) => {
    res.json({
        authenticated: true,
        user: req.user.uid,
        role: req.user.role,
        timestamp: new Date().toISOString(),
        securityFeatures: {
            csrf: 'enabled',
            xss: 'enabled',
            rateLimiting: 'enabled',
            sessionTimeout: '15 minutes',
            https: process.env.NODE_ENV === 'production' ? 'enforced' : 'development',
            roleBasedAccess: 'enabled'
        }
    });
});

module.exports = router;
