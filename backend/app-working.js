require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectToMongo } = require('./services/dbService');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);
console.log(' Loading Customer Portal with Security Features...');

// Essential security middleware (avoiding problematic configurations)
app.use(helmet({
    contentSecurityPolicy: false, // Simplified to avoid path-to-regexp issues
    crossOriginEmbedderPolicy: false
}));

// Rate limiting (essential for banking security)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased from 5 to 50 for development
    message: { message: 'Too many authentication attempts. Please try again later.' }
});

const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Increased from 10 to 100 for development
    message: { message: 'Payment limit exceeded. Please wait.' }
});

// Basic middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// CORS for frontend communication
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

// Security: SQL injection protection and XSS
app.use(mongoSanitize());
app.use(xss());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Customer Portal API'
    });
});

// Load routes with security
console.log(' Loading secure routes...');

const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const securityRoutes = require('./routes/securityRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

app.use('/v1/test', testRoutes);
app.use('/v1/auth', authLimiter, authRoutes);  // Rate limited auth
app.use('/v1/payments', paymentLimiter, paymentRoutes);  // Rate limited payments
app.use('/v1/profile', profileRoutes);  // Profile management
app.use('/v1/security', securityRoutes);  // Security management
app.use('/v1/employee', employeeRoutes);  // Employee routes

console.log(' All secure routes loaded successfully');

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Resource not found',
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server with database
(async () => {
    try {
        await connectToMongo();
        
        const port = process.env.API_PORT || 3447;
        app.listen(port, () => {
            console.log(` Customer Portal API running on port ${port}`);
            console.log('  Security: Rate Limiting, XSS Protection, CSRF, Input Validation');
            console.log(' Features: Authentication, 2FA, International Payments');
            console.log(' MongoDB: Connected and Ready');
        });
        
    } catch (err) {
        console.error(' Failed to start server:', err.message);
        process.exit(1);
    }
})();
