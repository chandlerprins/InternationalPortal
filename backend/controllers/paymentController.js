const Payment = require('../models/paymentModel');

// Get account balance and summary
const getBalance = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Mock balance data 
        const balanceData = {
            availableBalance: 125750.50,
            currency: 'ZAR',
            accountNumber: req.user.accountNumber,
            lastUpdated: new Date().toISOString(),
            pendingTransactions: await Payment.countDocuments({ user: userId, status: 'pending' }),
            completedTransactions: await Payment.countDocuments({ user: userId, status: 'completed' })
        };
        
        console.log(`[PAYMENT] Balance retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: balanceData,
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PAYMENT] Get balance error:', err);
        res.status(500).json({ 
            message: 'Failed to retrieve payment details.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get payment history (alias for getPayments)
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Fetch payments with enhanced details for history view
        const payments = await Payment.find({ user: userId })
            .select('-payeeAccount -user -__v') // Exclude sensitive fields
            .sort({ createdAt: -1 }) // Most recent first
            .limit(50); // Limit for performance
        
        // Calculate summary statistics
        const summary = {
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
            pendingCount: payments.filter(p => p.status === 'pending').length,
            completedCount: payments.filter(p => p.status === 'completed').length,
            failedCount: payments.filter(p => p.status === 'failed').length
        };
        
        console.log(`[PAYMENT] Payment history retrieved for user: ${userId}, Count: ${payments.length}`);
        
        res.json({
            success: true,
            data: {
                payments: payments,
                summary: summary
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PAYMENT] Get payment history error:', err);
        res.status(500).json({ 
            message: 'Failed to retrieve payment details.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get exchange rate and fees
const getExchangeRate = async (req, res) => {
    try {
        const { from, to, amount } = req.query;
        
        if (!from || !to || !amount) {
            return res.status(400).json({
                message: 'Missing required parameters: from, to, amount'
            });
        }
        
        const exchangeAmount = parseFloat(amount);
        if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
            return res.status(400).json({
                message: 'Invalid amount specified'
            });
        }
        
        // Mock exchange rates 
        const exchangeRates = {
            'USD_EUR': 0.85,
            'USD_GBP': 0.73,
            'USD_ZAR': 18.45,
            'EUR_USD': 1.18,
            'EUR_GBP': 0.86,
            'EUR_ZAR': 21.70,
            'GBP_USD': 1.37,
            'GBP_EUR': 1.16,
            'GBP_ZAR': 25.25,
            'ZAR_USD': 0.054,
            'ZAR_EUR': 0.046,
            'ZAR_GBP': 0.040
        };
        
        const rateKey = `${from.toUpperCase()}_${to.toUpperCase()}`;
        const rate = exchangeRates[rateKey] || 1.0;
        
        const convertedAmount = exchangeAmount * rate;
        const transferFee = Math.max(2.50, exchangeAmount * 0.001); // Min $2.50 or 0.1%
        const exchangeFee = from !== to ? convertedAmount * 0.002 : 0; // 0.2% for currency conversion
        const totalFees = transferFee + exchangeFee;
        
        const exchangeData = {
            fromCurrency: from.toUpperCase(),
            toCurrency: to.toUpperCase(),
            originalAmount: exchangeAmount,
            exchangeRate: rate,
            convertedAmount: convertedAmount,
            fees: {
                transferFee: transferFee,
                exchangeFee: exchangeFee,
                totalFees: totalFees
            },
            finalAmount: convertedAmount - totalFees,
            estimatedDelivery: '1-3 business days',
            rateValidUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
        
        console.log(`[PAYMENT] Exchange rate calculated: ${from} to ${to}, Amount: ${amount}`);
        
        res.json({
            success: true,
            data: exchangeData,
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PAYMENT] Get exchange rate error:', err);
        res.status(500).json({ 
            message: 'Failed to retrieve payment details.',
            timestamp: new Date().toISOString()
        });
    }
};

// Create payment (CSRF protection handled by middleware)
const createPayment = async (req, res) => {
    try {
        const userId = req.user.uid;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        console.log(`[PAYMENT] Payment creation attempt by user: ${userId} from IP: ${clientIP}`);
        
        // Validate and sanitize payment data
        const paymentData = {
            user: userId,
            payeeName: req.body.payeeName.trim(),
            payeeAccount: req.body.payeeAccount.trim(),
            swift: req.body.swift.toUpperCase().trim(),
            currency: req.body.currency.toUpperCase(),
            amount: parseFloat(req.body.amount),
            reference: req.body.reference ? req.body.reference.trim() : '',
            status: 'pending',
            createdAt: new Date()
        };
        
        // Additional security validation
        if (paymentData.amount <= 0 || paymentData.amount > 1000000) { // $1M limit
            return res.status(400).json({ 
                message: 'Invalid payment amount. Must be between $0.01 and $1,000,000.' 
            });
        }
        
        const payment = new Payment(paymentData);
        await payment.save();
        
        // Enhanced security logging for audit trail
        console.log(`[PAYMENT] Payment created successfully - User: ${userId}, Amount: ${paymentData.currency} ${paymentData.amount}, SWIFT: ${paymentData.swift}, IP: ${clientIP}`);
        
        // Return sanitized response (no sensitive account details)
        res.status(201).json({
            success: true,
            data: {
                id: payment._id,
                payeeName: payment.payeeName,
                amount: payment.amount,
                currency: payment.currency,
                reference: payment.reference,
                status: payment.status,
                createdAt: payment.createdAt
            },
            message: 'Payment submitted successfully'
        });
        
    } catch (err) {
        console.error('[PAYMENT] Create payment error:', err);
        res.status(500).json({ 
            message: 'Payment processing failed. Please try again.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get all payments for authenticated user
const getPayments = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Fetch payments with sensitive data excluded
        const payments = await Payment.find({ user: userId })
            .select('-payeeAccount -user -__v') // Exclude sensitive fields
            .sort({ createdAt: -1 }) // Most recent first
            .limit(100); // Limit to prevent large responses
        
        console.log(`[PAYMENT] Payment history retrieved for user: ${userId}, Count: ${payments.length}`);
        
        res.json({
            success: true,
            data: {
                payments: payments,
                count: payments.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PAYMENT] Get payments error:', err);
        res.status(500).json({ 
            message: 'Failed to retrieve payment history.',
            timestamp: new Date().toISOString()
        });
    }
};

// Get specific payment by ID (with ownership verification)
const getPayment = async (req, res) => {
    try {
        const userId = req.user.uid;
        const paymentId = req.params.id;
        
        // Verify payment belongs to authenticated user
        const payment = await Payment.findOne({ 
            _id: paymentId, 
            user: userId 
        }).select('-payeeAccount -user -__v');
        
        if (!payment) {
            console.warn(`[SECURITY] Unauthorized payment access attempt - User: ${userId}, Payment: ${paymentId}`);
            return res.status(404).json({ 
                message: 'Payment not found or access denied.' 
            });
        }
        
        console.log(`[PAYMENT] Payment details retrieved - User: ${userId}, Payment: ${paymentId}`);
        
        res.json({
            success: true,
            data: payment,
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PAYMENT] Get payment error:', err);
        res.status(500).json({ 
            message: 'Failed to retrieve payment details.',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = { 
    createPayment, 
    getPayments, 
    getPayment, 
    getBalance, 
    getPaymentHistory, 
    getExchangeRate 
};
