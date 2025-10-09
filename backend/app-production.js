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

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Logging
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));

// Basic security headers (simplified to avoid path-to-regexp issues)
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Very strict for auth endpoints
    message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Maximum 10 payments per 10 minutes
    message: { message: 'Payment limit exceeded. Please wait before submitting more payments.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(generalLimiter);

// CORS
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'https://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    optionsSuccessStatus: 200
}));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized input detected: ${key} from IP: ${req.ip}`);
    }
}));

app.use(xss());

// Security headers for every response
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
});

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - UA: ${userAgent?.substring(0, 50)}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes with rate limiting
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testRoutes = require('./routes/testRoutes');

app.use('/v1/auth', authLimiter, authRoutes);
app.use('/v1/payments', paymentLimiter, paymentRoutes);
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
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(err.status || 500).json({
        message: isProduction ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
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
