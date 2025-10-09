const rateLimit = require('express-rate-limit');

// Enhanced auth rate limiting for DDoS protection
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8, // Reduced from default for banking security
    message: {
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Enhanced DDoS protection
    skip: (req, res) => {
        // Allow internal health checks
        return req.ip === '127.0.0.1' && req.path === '/health';
    }
});

// General rate limiter with DDoS protection
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // Reasonable limit for banking operations
    message: {
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for payment operations
const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // Maximum 20 payments per 10 minutes
    message: {
        message: 'Payment limit exceeded. Please wait before submitting more payments.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    generalLimiter,
    paymentLimiter
};
