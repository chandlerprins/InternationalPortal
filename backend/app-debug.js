require('dotenv').config();
const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());

// Test individual routes
console.log('Loading test routes...');

try {
    const testRoutes = require('./routes/testRoutes');
    app.use('/v1/test', testRoutes);
    console.log(' testRoutes loaded successfully');
} catch (err) {
    console.error(' testRoutes failed:', err.message);
}

try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/v1/auth', authRoutes);
    console.log(' authRoutes loaded successfully');
} catch (err) {
    console.error(' authRoutes failed:', err.message);
}

try {
    const paymentRoutes = require('./routes/paymentRoutes');
    app.use('/v1/payments', paymentRoutes);
    console.log(' paymentRoutes loaded successfully');
} catch (err) {
    console.error(' paymentRoutes failed:', err.message);
}

console.log('All routes loaded, starting server...');

const port = 3444;
app.listen(port, () => {
    console.log(` Debug server running on port ${port}`);
});
