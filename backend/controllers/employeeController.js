const Payment = require('../models/paymentModel');
const User = require('../models/userModel');

// Get all payments for employee review (with user details)
const getAllPayments = async (req, res) => {
    try {
        console.log(`[EMPLOYEE] Payment review request by employee: ${req.user.uid}`);

        // Fetch all payments with user details (excluding sensitive data)
        const payments = await Payment.find({})
            .populate('user', 'fullName email accountNumber role')
            .select('-payeeAccount -__v')
            .sort({ createdAt: -1 })
            .limit(200); // Limit for performance

        // Calculate summary statistics
        const summary = {
            totalPayments: payments.length,
            pendingCount: payments.filter(p => p.status === 'pending').length,
            verifiedCount: payments.filter(p => p.status === 'verified').length,
            sentCount: payments.filter(p => p.status === 'sent').length,
            totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
            pendingAmount: payments.filter(p => p.status === 'pending')
                .reduce((sum, payment) => sum + payment.amount, 0)
        };

        console.log(`[EMPLOYEE] Retrieved ${payments.length} payments for review`);

        res.json({
            success: true,
            data: {
                payments: payments,
                summary: summary
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[EMPLOYEE] Get all payments error:', err);
        res.status(500).json({
            message: 'Failed to retrieve payments for review.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get pending payments only
const getPendingPayments = async (req, res) => {
    try {
        console.log(`[EMPLOYEE] Pending payments request by employee: ${req.user.uid}`);

        const payments = await Payment.find({ status: 'pending' })
            .populate('user', 'fullName email accountNumber role')
            .select('-payeeAccount -__v')
            .sort({ createdAt: -1 });

        console.log(`[EMPLOYEE] Retrieved ${payments.length} pending payments`);

        res.json({
            success: true,
            data: {
                payments: payments,
                count: payments.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[EMPLOYEE] Get pending payments error:', err);
        res.status(500).json({
            message: 'Failed to retrieve pending payments.',
            timestamp: new Date().toISOString()
        });
    }
};

// Verify and approve a payment
const verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const employeeId = req.user.uid;
        const clientIP = req.ip || req.connection.remoteAddress;

        console.log(`[EMPLOYEE] Payment verification attempt - Payment: ${paymentId}, Employee: ${employeeId}, IP: ${clientIP}`);

        // Find payment and verify it exists and is pending
        const payment = await Payment.findById(paymentId).populate('user', 'fullName email accountNumber');
        if (!payment) {
            console.warn(`[EMPLOYEE] Payment verification failed - Payment not found: ${paymentId}`);
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            console.warn(`[EMPLOYEE] Payment verification failed - Invalid status: ${payment.status}`);
            return res.status(400).json({
                message: `Payment cannot be verified. Current status: ${payment.status}`
            });
        }

        // Update payment status
        payment.status = 'verified';
        await payment.save();

        console.log(`[EMPLOYEE] Payment verified successfully - Payment: ${paymentId}, Amount: ${payment.currency} ${payment.amount}, Employee: ${employeeId}`);

        res.json({
            success: true,
            data: {
                payment: payment,
                verifiedBy: employeeId,
                verifiedAt: new Date().toISOString()
            },
            message: 'Payment verified successfully'
        });

    } catch (err) {
        console.error('[EMPLOYEE] Verify payment error:', err);
        res.status(500).json({
            message: 'Payment verification failed. Please try again.',
            timestamp: new Date().toISOString()
        });
    }
};

// Mark payment as sent (after verification)
const sendPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const employeeId = req.user.uid;
        const clientIP = req.ip || req.connection.remoteAddress;

        console.log(`[EMPLOYEE] Payment send attempt - Payment: ${paymentId}, Employee: ${employeeId}, IP: ${clientIP}`);

        // Find payment and verify it exists and is verified
        const payment = await Payment.findById(paymentId).populate('user', 'fullName email accountNumber');
        if (!payment) {
            console.warn(`[EMPLOYEE] Payment send failed - Payment not found: ${paymentId}`);
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'verified') {
            console.warn(`[EMPLOYEE] Payment send failed - Invalid status: ${payment.status}`);
            return res.status(400).json({
                message: `Payment cannot be sent. Current status: ${payment.status}`
            });
        }

        // Update payment status
        payment.status = 'sent';
        await payment.save();

        console.log(`[EMPLOYEE] Payment sent successfully - Payment: ${paymentId}, Amount: ${payment.currency} ${payment.amount}, Employee: ${employeeId}`);

        res.json({
            success: true,
            data: {
                payment: payment,
                sentBy: employeeId,
                sentAt: new Date().toISOString()
            },
            message: 'Payment sent successfully'
        });

    } catch (err) {
        console.error('[EMPLOYEE] Send payment error:', err);
        res.status(500).json({
            message: 'Payment send failed. Please try again.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get payment statistics for dashboard
const getPaymentStats = async (req, res) => {
    try {
        console.log(`[EMPLOYEE] Payment stats request by employee: ${req.user.uid}`);

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get various statistics
        const [
            totalPayments,
            pendingPayments,
            verifiedPayments,
            sentPayments,
            todayPayments,
            weekPayments,
            monthPayments
        ] = await Promise.all([
            Payment.countDocuments({}),
            Payment.countDocuments({ status: 'pending' }),
            Payment.countDocuments({ status: 'verified' }),
            Payment.countDocuments({ status: 'sent' }),
            Payment.countDocuments({ createdAt: { $gte: startOfDay } }),
            Payment.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Payment.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);

        // Get total amounts
        const totalAmount = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const pendingAmount = await Payment.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const stats = {
            overview: {
                totalPayments,
                pendingPayments,
                verifiedPayments,
                sentPayments,
                totalAmount: totalAmount[0]?.total || 0,
                pendingAmount: pendingAmount[0]?.total || 0
            },
            recent: {
                today: todayPayments,
                thisWeek: weekPayments,
                thisMonth: monthPayments
            }
        };

        console.log(`[EMPLOYEE] Payment stats retrieved for employee: ${req.user.uid}`);

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[EMPLOYEE] Get payment stats error:', err);
        res.status(500).json({
            message: 'Failed to retrieve payment statistics.',
            timestamp: new Date().toISOString()
        });
    }
};

// Deny a payment (mark as denied)
const denyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const employeeId = req.user.uid;
        const clientIP = req.ip || req.connection.remoteAddress;

        console.log(`[EMPLOYEE] Payment denial attempt - Payment: ${paymentId}, Employee: ${employeeId}, IP: ${clientIP}`);

        // Find payment and verify it exists and is pending
        const payment = await Payment.findById(paymentId).populate('user', 'fullName email accountNumber');
        if (!payment) {
            console.warn(`[EMPLOYEE] Payment denial failed - Payment not found: ${paymentId}`);
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            console.warn(`[EMPLOYEE] Payment denial failed - Invalid status: ${payment.status}`);
            return res.status(400).json({
                message: `Payment cannot be denied. Current status: ${payment.status}`
            });
        }

        // Update payment status to denied
        payment.status = 'denied';
        await payment.save();

        console.log(`[EMPLOYEE] Payment denied successfully - Payment: ${paymentId}, Amount: ${payment.currency} ${payment.amount}, Employee: ${employeeId}`);

        res.json({
            success: true,
            data: {
                payment: payment,
                deniedBy: employeeId,
                deniedAt: new Date().toISOString()
            },
            message: 'Payment denied successfully'
        });

    } catch (err) {
        console.error('[EMPLOYEE] Deny payment error:', err);
        res.status(500).json({
            message: 'Payment denial failed. Please try again.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get payment history (approved/denied payments)
const getPaymentHistory = async (req, res) => {
    try {
        console.log(`[EMPLOYEE] Payment history request by employee: ${req.user.uid}`);

        // Get all non-pending payments (verified, sent, denied)
        const payments = await Payment.find({
            status: { $in: ['verified', 'sent', 'denied'] }
        })
            .populate('user', 'fullName email accountNumber role')
            .select('-payeeAccount -__v')
            .sort({ updatedAt: -1 })
            .limit(500); // Limit for performance

        // Calculate summary statistics for history
        const summary = {
            totalHistory: payments.length,
            verifiedCount: payments.filter(p => p.status === 'verified').length,
            sentCount: payments.filter(p => p.status === 'sent').length,
            deniedCount: payments.filter(p => p.status === 'denied').length,
            totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
        };

        console.log(`[EMPLOYEE] Retrieved ${payments.length} historical payments`);

        res.json({
            success: true,
            data: {
                payments: payments,
                summary: summary
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[EMPLOYEE] Get payment history error:', err);
        res.status(500).json({
            message: 'Failed to retrieve payment history.',
            timestamp: new Date().toISOString()
        });
    }
};

// ADMIN FUNCTIONS: Employee Management

// Get all employees (admin only)
const getEmployees = async (req, res) => {
    try {
        console.log(`[ADMIN] Employee list request by admin: ${req.user.uid}`);

        const employees = await User.find({ role: { $in: ['employee', 'admin'] } })
            .select('fullName email accountNumber role createdAt is2FAEnabled')
            .sort({ createdAt: -1 });

        console.log(`[ADMIN] Retrieved ${employees.length} employees`);

        res.json({
            success: true,
            data: {
                employees: employees.map(emp => ({
                    id: emp._id,
                    fullName: emp.fullName,
                    email: emp.email,
                    accountNumber: emp.accountNumber,
                    role: emp.role,
                    is2FAEnabled: emp.is2FAEnabled,
                    createdAt: emp.createdAt
                })),
                totalEmployees: employees.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[ADMIN] Get employees error:', err);
        res.status(500).json({
            message: 'Failed to retrieve employees.',
            timestamp: new Date().toISOString()
        });
    }
};

// Create new employee (admin only)
const createEmployee = async (req, res) => {
    try {
        const { fullName, email, accountNumber, password, role = 'employee' } = req.body;
        const adminId = req.user.uid;

        console.log(`[ADMIN] Employee creation attempt by admin: ${adminId} for account: ${accountNumber}`);

        // Validate role
        if (!['employee', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be employee or admin.' });
        }

        // Check for existing users
        if (await User.findOne({ accountNumber })) {
            console.warn(`[ADMIN] Employee creation failed - existing account number: ${accountNumber}`);
            return res.status(400).json({ message: 'Account number already exists' });
        }

        if (await User.findOne({ email })) {
            console.warn(`[ADMIN] Employee creation failed - existing email: ${email}`);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Validate password strength
        const { validatePasswordStrength } = require('../middlewares/authMiddleware');
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'Password does not meet security requirements',
                requirements: passwordValidation.requirements
            });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const config = require('../config');
        const saltRounds = config.saltRounds || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const employee = new User({
            fullName,
            email,
            accountNumber,
            passwordHash,
            role
        });

        await employee.save();

        console.log(`[ADMIN] Employee created successfully: ${accountNumber} (${role}) by admin: ${adminId}`);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                employee: employee.toSafeJSON(),
                createdBy: adminId
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[ADMIN] Create employee error:', err);
        res.status(500).json({
            message: 'Failed to create employee.',
            timestamp: new Date().toISOString()
        });
    }
};

// Delete employee (admin only)
const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const adminId = req.user.uid;

        console.log(`[ADMIN] Employee deletion attempt by admin: ${adminId} for employee: ${employeeId}`);

        // Find employee
        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Prevent deleting admins (unless super admin)
        if (employee.role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts' });
        }

        // Prevent self-deletion
        if (employee._id.toString() === adminId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Delete employee
        await User.findByIdAndDelete(employeeId);

        console.log(`[ADMIN] Employee deleted successfully: ${employee.accountNumber} by admin: ${adminId}`);

        res.json({
            success: true,
            message: 'Employee deleted successfully',
            data: {
                deletedEmployee: employee.accountNumber,
                deletedBy: adminId
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[ADMIN] Delete employee error:', err);
        res.status(500).json({
            message: 'Failed to delete employee.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get user activity summary (for employee monitoring)
const getUserActivity = async (req, res) => {
    try {
        console.log(`[EMPLOYEE] User activity request by employee: ${req.user.uid}`);

        const users = await User.find({ role: 'customer' })
            .select('fullName email accountNumber createdAt is2FAEnabled')
            .sort({ createdAt: -1 });

        // Get payment counts per user
        const userStats = await Promise.all(
            users.map(async (user) => {
                const paymentCount = await Payment.countDocuments({ user: user._id });
                const pendingCount = await Payment.countDocuments({ user: user._id, status: 'pending' });

                return {
                    user: user.toSafeJSON(),
                    paymentCount,
                    pendingCount
                };
            })
        );

        console.log(`[EMPLOYEE] User activity retrieved for ${users.length} customers`);

        res.json({
            success: true,
            data: {
                users: userStats,
                totalUsers: users.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[EMPLOYEE] Get user activity error:', err);
        res.status(500).json({
            message: 'Failed to retrieve user activity.',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    getAllPayments,
    getPendingPayments,
    verifyPayment,
    sendPayment,
    denyPayment,
    getPaymentHistory,
    getPaymentStats,
    getUserActivity,
    getEmployees,
    createEmployee,
    deleteEmployee
};
