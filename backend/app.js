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

const app = express();

// === Trust proxy for rate limiting & real IP detection ===
app.set('trust proxy', 1);

// === Logging ===
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));

// === Security Headers (CSP, HSTS, Clickjacking, etc.) ===
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
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// === Rate Limiter Factory ===
const createLimiter = (minutes, max, message, skipCondition = null) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipCondition
  });

// Global, Auth, and Payment limiters
const generalLimiter = createLimiter(15, 100, 'Too many requests from this IP, please try again later.', (req) =>
  req.ip === '127.0.0.1' && req.path === '/health'
);
const authLimiter = createLimiter(15, 5, 'Too many authentication attempts. Please try again in 15 minutes.');
const paymentLimiter = createLimiter(10, 10, 'Payment limit exceeded. Please wait before submitting more payments.');

// Apply global limiter
app.use(generalLimiter);

// === CORS (strict) ===
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  optionsSuccessStatus: 200
}));

// === Parsers ===
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// === Sanitize Input (NoSQL injection protection) ===
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => console.warn(`Sanitized input detected: ${key} from IP: ${req.ip}`)
}));
app.use(xss());

// === Additional Security Headers ===
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  res.removeHeader('X-Powered-By');
  next();
});

// === Request Logging ===
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - UA: ${req.get('User-Agent')?.substring(0, 50)}`);
  next();
});

// === Health Check ===
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
const employeeRoutes = require('./routes/employeeRoutes');
const testRoutes = require('./routes/testRoutes');

app.use('/v1/auth', authLimiter, authRoutes);
app.use('/v1/payments', paymentLimiter, paymentRoutes);
app.use('/v1/employee', generalLimiter, employeeRoutes);
app.use('/v1/test', testRoutes);

// === 404 Handler ===
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Resource not found',
    timestamp: new Date().toISOString()
  });
});

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: isProd ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// === Start Server (HTTPS in Production) ===
(async () => {
  try {
    await connectToMongo();
    const port = process.env.API_PORT || 3443;
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const server = https.createServer({
        key: fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.crt')
      }, app);

      server.listen(port, () => {
        console.log(` SECURE Customer Portal API running on HTTPS port ${port}`);
      });
    } else {
      app.listen(port, () => {
        console.log(` Customer Portal API running on HTTP port ${port}`);
        console.log('Enable HTTPS by setting NODE_ENV=production');
      });
    }
  } catch (err) {
    console.error(' Failed to start server:', err.message);
    process.exit(1);
  }
})();
