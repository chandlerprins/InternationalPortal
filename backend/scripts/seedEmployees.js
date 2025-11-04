const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
require('dotenv').config();

// Employee data to seed 
const employees = [
    {
        fullName: 'John Smith',
        email: 'john.smith@company.com',
        accountNumber: 'EMP001',
        password: 'SecurePass123!',
        role: 'employee'
    },
    {
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        accountNumber: 'EMP002',
        password: 'SecurePass123!',
        role: 'employee'
    },
    {
        fullName: 'Admin User',
        email: 'admin@company.com',
        accountNumber: 'ADM001',
        password: 'AdminSecure123!',
        role: 'admin'
    }
];

async function seedEmployees() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.CONN_STRING);
        console.log('Connected to MongoDB');

        const saltRounds = parseInt(process.env.SALT_ROUNDS || '12', 10);

        for (const emp of employees) {
            // Check if employee already exists
            const existingUser = await User.findOne({
                $or: [
                    { accountNumber: emp.accountNumber },
                    { email: emp.email }
                ]
            });

            if (existingUser) {
                console.log(`Employee ${emp.fullName} (${emp.accountNumber}) already exists, skipping...`);
                continue;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(emp.password, saltRounds);

            // Create employee user
            const user = new User({
                fullName: emp.fullName,
                email: emp.email,
                accountNumber: emp.accountNumber,
                passwordHash: passwordHash,
                role: emp.role,
                is2FAEnabled: false // Employees can enable 2FA if needed
            });

            await user.save();
            console.log(`Created employee: ${emp.fullName} (${emp.accountNumber}) - Role: ${emp.role}`);
        }

        console.log('Employee seeding completed successfully');

        // List all employees
        const allEmployees = await User.find({ role: { $in: ['employee', 'admin'] } })
            .select('fullName email accountNumber role createdAt')
            .sort({ createdAt: -1 });

        console.log('\nCurrent employees:');
        allEmployees.forEach(emp => {
            console.log(`- ${emp.fullName} (${emp.accountNumber}) - ${emp.email} - Role: ${emp.role}`);
        });

    } catch (error) {
        console.error('Error seeding employees:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run if called directly
if (require.main === module) {
    seedEmployees();
}

module.exports = { seedEmployees };
