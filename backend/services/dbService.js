const mongoose = require('mongoose');
require('dotenv').config(); // load environment variables from .env file

/**
 * MongoDB connection service for Customer Portal
 * Handles connection to MongoDB 
 */
const connectToMongo = async () => {
    try {
        const mongoUri = process.env.CONN_STRING;
        console.log('DEBUG: mongoUri =', mongoUri ? 'Present' : 'Missing');
        
        if (!mongoUri) {
            throw new Error('MongoDB connection string not found in environment variables');
        }

        console.log('Attempting to connect to MongoDB Atlas...');
        // Connect to MongoDB using the connection string from environment variables
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB successfully");

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = { connectToMongo } // Export the connection function for use in other files
