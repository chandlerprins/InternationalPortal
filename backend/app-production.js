require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const https = require('https');

const { connectToMongo } = require('./services/dbService');

// === Utility functions ===
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { message },
  standardHeaders: true,
  legacyHeaders: false
});

const addSecurityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  res.removeHeader('X-Powered-By');
  next();
};

const logRequests = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent');
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - UA: ${userAgent?.substring(0, 50)}`);
  next();
};

// === Express app setup ===
const app = express();
app.set('trust proxy', 1);

// Logging
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));

// Helmet security headers
app.use(helmet());

// Global rate limit
app.use(createRateLimiter(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later.'));

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

// Input sanitization
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => console.warn(`Sanitized input detected: ${key} from IP: ${req.ip}`)
}));
app.use(xss());

// Apply headers & logging
app.use(addSecurityHeaders);
app.use(logRequests);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// === Routes ===
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testRoutes = require('./routes/testRoutes');

app.use('/v1/auth', createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts. Please try again in 15 minutes.'), authRoutes);
app.use('/v1/payments', createRateLimiter(10 * 60 * 1000, 10, 'Payment limit exceeded. Please wait before submitting more payments.'), paymentRoutes);
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
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: isProd ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// === Start server ===
(async () => {
  try {
    await connectToMongo();
    const port = process.env.API_PORT || 3443;
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const cert = {
        key: fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.crt')
      };
      https.createServer(cert, app).listen(port, () => {
        console.log(` SECURE API running on HTTPS port ${port}`);
      });
    } else {
      app.listen(port, () => {
        console.log(` API running on HTTP port ${port}`);
      });
    }
  } catch (err) {
    console.error(' Failed to start server:', err.message);
    process.exit(1);
  }
})();
