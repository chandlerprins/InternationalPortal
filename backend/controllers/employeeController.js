const Payment = require('../models/paymentModel');
const User = require('../models/userModel');

// === Utility Helpers ===
const handleError = (res, label, err, message) => {
  console.error(`[${label}] Error:`, err);
  return res.status(500).json({ message, timestamp: new Date().toISOString() });
};

const findPayment = async (paymentId, res, label) => {
  const payment = await Payment.findById(paymentId).populate('user', 'fullName email accountNumber');
  if (!payment) {
    console.warn(`[${label}] Payment not found: ${paymentId}`);
    res.status(404).json({ message: 'Payment not found' });
    return null;
  }
  return payment;
};

const checkPaymentStatus = (payment, expectedStatus, action, res, label) => {
  if (payment.status !== expectedStatus) {
    console.warn(`[${label}] Invalid status for ${action}: ${payment.status}`);
    res.status(400).json({ message: `Payment cannot be ${action}. Current status: ${payment.status}` });
    return false;
  }
  return true;
};

const buildResponse = (res, success, data, message) => {
  res.json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

// === Employee Payment Functions ===
const getAllPayments = async (req, res) => {
  try {
    console.log(`[EMPLOYEE] Payment review request by employee: ${req.user.uid}`);
    const payments = await Payment.find({})
      .populate('user', 'fullName email accountNumber role')
      .select('-payeeAccount -__v')
      .sort({ createdAt: -1 })
      .limit(200);

    const summary = {
      totalPayments: payments.length,
      pendingCount: payments.filter(p => p.status === 'pending').length,
      verifiedCount: payments.filter(p => p.status === 'verified').length,
      sentCount: payments.filter(p => p.status === 'sent').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0)
    };

    buildResponse(res, true, { payments, summary });
  } catch (err) {
    handleError(res, 'EMPLOYEE', err, 'Failed to retrieve payments for review.');
  }
};

const getPendingPayments = async (req, res) => {
  try {
    console.log(`[EMPLOYEE] Pending payments request by employee: ${req.user.uid}`);
    const payments = await Payment.find({ status: 'pending' })
      .populate('user', 'fullName email accountNumber role')
      .select('-payeeAccount -__v')
      .sort({ createdAt: -1 });

    buildResponse(res, true, { payments, count: payments.length });
  } catch (err) {
    handleError(res, 'EMPLOYEE', err, 'Failed to retrieve pending payments.');
  }
};

const updatePaymentStatus = async (req, res, targetStatus, label, successMessage) => {
  try {
    const { paymentId } = req.params;
    const employeeId = req.user.uid;
    const payment = await findPayment(paymentId, res, label);
    if (!payment) return;

    const validTransitions = {
      verified: 'pending',
      sent: 'verified',
      denied: 'pending'
    };
    const expectedStatus = validTransitions[targetStatus];

    if (!checkPaymentStatus(payment, expectedStatus, targetStatus, res, label)) return;

    payment.status = targetStatus;
    await payment.save();

    buildResponse(res, true, {
      payment,
      [`${targetStatus}By`]: employeeId,
      [`${targetStatus}At`]: new Date().toISOString()
    }, successMessage);
  } catch (err) {
    handleError(res, label, err, `${targetStatus} payment failed. Please try again.`);
  }
};

// Reuse for multiple endpoints
const verifyPayment = (req, res) => updatePaymentStatus(req, res, 'verified', 'EMPLOYEE_VERIFY', 'Payment verified successfully');
const sendPayment = (req, res) => updatePaymentStatus(req, res, 'sent', 'EMPLOYEE_SEND', 'Payment sent successfully');
const denyPayment = (req, res) => updatePaymentStatus(req, res, 'denied', 'EMPLOYEE_DENY', 'Payment denied successfully');

const getPaymentHistory = async (req, res) => {
  try {
    console.log(`[EMPLOYEE] Payment history request by employee: ${req.user.uid}`);
    const payments = await Payment.find({ status: { $in: ['verified', 'sent', 'denied'] } })
      .populate('user', 'fullName email accountNumber role')
      .select('-payeeAccount -__v')
      .sort({ updatedAt: -1 })
      .limit(500);

    const summary = {
      totalHistory: payments.length,
      verifiedCount: payments.filter(p => p.status === 'verified').length,
      sentCount: payments.filter(p => p.status === 'sent').length,
      deniedCount: payments.filter(p => p.status === 'denied').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
    };

    buildResponse(res, true, { payments, summary });
  } catch (err) {
    handleError(res, 'EMPLOYEE', err, 'Failed to retrieve payment history.');
  }
};

const getPaymentStats = async (req, res) => {
  try {
    console.log(`[EMPLOYEE] Payment stats request by employee: ${req.user.uid}`);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals, pending, verified, sent, today, week, month] = await Promise.all([
      Payment.countDocuments({}),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'verified' }),
      Payment.countDocuments({ status: 'sent' }),
      Payment.countDocuments({ createdAt: { $gte: startOfDay } }),
      Payment.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Payment.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    const [totalAmount, pendingAmount] = await Promise.all([
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    buildResponse(res, true, {
      overview: {
        totalPayments: totals,
        pendingPayments: pending,
        verifiedPayments: verified,
        sentPayments: sent,
        totalAmount: totalAmount[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0
      },
      recent: {
        today,
        thisWeek: week,
        thisMonth: month
      }
    });
  } catch (err) {
    handleError(res, 'EMPLOYEE', err, 'Failed to retrieve payment statistics.');
  }
};

// === Admin and Monitoring ===
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'admin'] } })
      .select('fullName email accountNumber role createdAt is2FAEnabled')
      .sort({ createdAt: -1 });

    buildResponse(res, true, {
      employees: employees.map(e => ({
        id: e._id,
        fullName: e.fullName,
        email: e.email,
        accountNumber: e.accountNumber,
        role: e.role,
        is2FAEnabled: e.is2FAEnabled,
        createdAt: e.createdAt
      })),
      totalEmployees: employees.length
    });
  } catch (err) {
    handleError(res, 'ADMIN', err, 'Failed to retrieve employees.');
  }
};

const getUserActivity = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('fullName email accountNumber createdAt is2FAEnabled')
      .sort({ createdAt: -1 });

    const userStats = await Promise.all(users.map(async u => ({
      user: u.toSafeJSON(),
      paymentCount: await Payment.countDocuments({ user: u._id }),
      pendingCount: await Payment.countDocuments({ user: u._id, status: 'pending' })
    })));

    buildResponse(res, true, { users: userStats, totalUsers: users.length });
  } catch (err) {
    handleError(res, 'EMPLOYEE', err, 'Failed to retrieve user activity.');
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
  getEmployees
};
