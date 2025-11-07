require('dotenv').config();
const express = require('express');
const { connectToMongo } = require('./services/dbService');

const app = express();

// Basic middleware
app.use(express.json());

// Simple test route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Start server
(async () => {
    try {
        await connectToMongo();
        
        const port = process.env.API_PORT || 3443;
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
        
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
})();
