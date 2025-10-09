require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToMongo } = require('./services/dbService');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic CORS
app.use(cors({
    origin: true,
    credentials: true
}));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testRoutes = require('./routes/testRoutes');

app.use('/v1/auth', authRoutes);
app.use('/v1/payments', paymentRoutes);
app.use('/v1/test', testRoutes);

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
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Start server
(async () => {
    try {
        await connectToMongo();
        
        const port = process.env.API_PORT || 3443;
        
        app.listen(port, () => {
            console.log(` Simple Customer Portal API running on port ${port}`);
        });
        
    } catch (err) {
        console.error(' Failed to start server:', err.message);
        process.exit(1);
    }
})();
