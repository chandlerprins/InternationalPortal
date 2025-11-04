require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { connectToMongo } = require('./services/dbService');

const app = express();

// Trust proxy for proper IP detection (important for rate limiting and security)
app.set('trust proxy', 1);

// Enhanced logging for security monitoring
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));

// COMPREHENSIVE SECURITY HEADERS (Clickjacking, XSS, MITM Protection)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"] // CLICKJACKING PROTECTION - DENY option
            // Removed upgradeInsecureRequests array - this was causing the path-to-regexp error
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    frameguard: { action: 'deny' }, // Additional clickjacking protection
    noSniff: true, // Prevent MIME sniffing
    xssFilter: true // XSS protection
}));

// DDOS PROTECTION - Multiple rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Enhanced DDoS protection
    skip: (req, res) => {
        return req.ip === '127.0.0.1' && req.path === '/health';
    }
});

// Strict auth rate limiting (Session Hijacking Prevention)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Very strict for auth endpoints
    message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Payment rate limiting
const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Maximum 10 payments per 10 minutes
    message: { message: 'Payment limit exceeded. Please wait before submitting more payments.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(generalLimiter);

// CORS with strict security settings
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'https://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    optionsSuccessStatus: 200
}));

// Body parsers with size limits (security)
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// SQL INJECTION PROTECTION (NoSQL injection prevention)
app.use(mongoSanitize({
    replaceWith: '_', // Replace prohibited characters
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized input detected: ${key} from IP: ${req.ip}`);
    }
}));

// XSS PROTECTION - Clean user input
app.use(xss());

// SESSION SECURITY MIDDLEWARE
app.use((req, res, next) => {
    // Security headers for every response
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY'); // Clickjacking protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
});

// Request logging for security monitoring
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - UA: ${userAgent?.substring(0, 50)}`);
    next();
});

// Health check endpoint (bypasses auth for monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes with specific rate limiting
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

app.use('/v1/auth', authLimiter, authRoutes);
app.use('/v1/payments', paymentLimiter, paymentRoutes);
app.use('/v1/employee', generalLimiter, employeeRoutes); // Employee routes with general rate limiting

// Keep test routes for compatibility
const testRoutes = require('./routes/testRoutes');
app.use('/v1/test', testRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Resource not found',
        timestamp: new Date().toISOString()
    });
});

// Global error handler 
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Security
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(err.status || 500).json({
        message: isProduction ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server with HTTPS and comprehensive security
(async () => {
    try {
        await connectToMongo();
        
        const port = process.env.API_PORT || 3443;
        
       
        if (process.env.NODE_ENV === 'production') {
            const fs = require('fs');
            const https = require('https');
            
            const cert = {
                key: fs.readFileSync('./certs/server.key'),
                cert: fs.readFileSync('./certs/server.crt')
            };
            
            const server = https.createServer(cert, app);
            server.listen(port, () => {
                console.log(` SECURE Customer Portal API running on HTTPS port ${port}`);
                console.log('  Security features enabled: HTTPS, HSTS, CSP, CSRF, XSS, Rate Limiting, 2FA');
            });
        } else {
            app.listen(port, () => {
                console.log(` Customer Portal API running on HTTP port ${port}`);
                console.log('  Security features enabled: CSP, CSRF, XSS, Rate Limiting, 2FA');
                console.log('  For production, enable HTTPS by setting NODE_ENV=production');
            });
        }
        
    } catch (err) {
        console.error(' Failed to start server:', err.message);
        process.exit(1);
    }
})();