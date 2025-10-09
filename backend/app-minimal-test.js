require('dotenv').config();
const express = require('express');
const { connectToMongo } = require('./services/dbService');

const app = express();

// Minimal middleware
app.use(express.json());

console.log(' Testing routes individually...');

// Test routes one by one to isolate the issue
try {
    console.log('Loading test routes...');
    const testRoutes = require('./routes/testRoutes');
    app.use('/v1/test', testRoutes);
    console.log(' Test routes loaded');
} catch (err) {
    console.error(' Test routes failed:', err.message);
}

try {
    console.log('Loading auth routes...');
    const authRoutes = require('./routes/authRoutes');
    app.use('/v1/auth', authRoutes);
    console.log(' Auth routes loaded');
} catch (err) {
    console.error(' Auth routes failed:', err.message);
}

try {
    console.log('Loading payment routes...');
    const paymentRoutes = require('./routes/paymentRoutes');
    app.use('/v1/payments', paymentRoutes);
    console.log(' Payment routes loaded');
} catch (err) {
    console.error(' Payment routes failed:', err.message);
}

console.log(' Starting server...');

// Start server
(async () => {
    try {
        await connectToMongo();
        
        const port = 3444;
        app.listen(port, () => {
            console.log(`🚀 Minimal server running on port ${port}`);
        });
        
    } catch (err) {
        console.error(' Server start failed:', err.message);
        process.exit(1);
    }
})();
