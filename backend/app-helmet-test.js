require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { connectToMongo } = require('./services/dbService');

const app = express();

console.log(' Testing middleware step by step...');

// Basic middleware
app.use(express.json());
console.log(' Basic middleware loaded');

// Test Helmet
try {
    app.use(helmet({
        contentSecurityPolicy: false, // Simplify first
        crossOriginEmbedderPolicy: false
    }));
    console.log(' Helmet loaded successfully');
} catch (err) {
    console.error(' Helmet failed:', err.message);
}

// Routes
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/v1/test', testRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/payments', paymentRoutes);

console.log(' All routes loaded');

// Start server
(async () => {
    try {
        await connectToMongo();
        
        const port = 3446;
        app.listen(port, () => {
            console.log(` Helmet test server running on port ${port}`);
        });
        
    } catch (err) {
        console.error(' Failed to start server:', err.message);
        process.exit(1);
    }
})();
