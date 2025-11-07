const express = require('express');
const { 
    createPayment, 
    getPayments, 
    getPayment, 
    getBalance, 
    getPaymentHistory, 
    getExchangeRate 
} = require('../controllers/paymentController');
const { verifyAccessToken, verifyCsrfToken } = require('../middlewares/authMiddleware');
const { paymentValidation, validate } = require('../middlewares/validators');

const router = express.Router();

// Get account balance and summary (GET) - No CSRF needed
router.get('/balance', verifyAccessToken, getBalance);

// Get payment history (GET) - No CSRF needed  
router.get('/history', verifyAccessToken, getPaymentHistory);

// Get exchange rate and fees (GET) - No CSRF needed
router.get('/exchange-rate', verifyAccessToken, getExchangeRate);

// Create payment (POST) - Requires CSRF protection
router.post('/', verifyAccessToken, verifyCsrfToken, paymentValidation, validate, createPayment);

// Get all payments for user (GET) - No CSRF needed for GET requests
router.get('/', verifyAccessToken, getPayments);

// Get specific payment by ID (GET) - No CSRF needed for GET requests
router.get('/:id', verifyAccessToken, getPayment);

module.exports = router;