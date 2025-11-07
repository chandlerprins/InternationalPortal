/**
 *  script to disable 2FA for testing purposes
 */

const mongoose = require('mongoose');
const User = require('./models/userModel');
const config = require('./config');

async function disable2FA() {
    try {
        // Connect to database
        await mongoose.connect(config.mongoUri || 'mongodb://localhost:27017/library_db');
        console.log('Connected to database');

        // Find the user and disable 2FA
     
        const accountNumber = process.argv[2]; 
        
        if (!accountNumber) {
            console.log('Usage: node disable-2fa.js <account_number>');
            process.exit(1);
        }

        const user = await User.findOne({ accountNumber });
        
        if (!user) {
            console.log(`User with account number ${accountNumber} not found`);
            process.exit(1);
        }

        // Disable 2FA
        user.is2FAEnabled = false;
        user.twoFASecret = undefined; // Remove the secret
        await user.save();

        console.log(`2FA disabled for user: ${user.fullName} (${accountNumber})`);
        console.log('User can now login without 2FA');

    } catch (error) {
        console.error('Error disabling 2FA:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
        process.exit(0);
    }
}

disable2FA();
