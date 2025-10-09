const { body, validationResult } = require('express-validator');

const nameRegex = /^[A-Za-z\s.'-]{2,100}$/;
const accountRegex = /^\d{8,12}$/;
const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const currencyList = ['USD','EUR','ZAR','GBP'];

const registerValidation = [
    body('fullName').trim().matches(nameRegex).withMessage('Invalid name'),
    body('email').isEmail().normalizeEmail(),
    body('accountNumber').matches(accountRegex).withMessage('Account number must be 8-12 digits'),
    body('password').isLength({ min: 10 }).withMessage('Password must be >= 10 chars') // stricter
];

const loginValidation = [
    body('accountNumber').exists().withMessage('accountNumber required'),
    body('password').exists().withMessage('password required')
];

const paymentValidation = [
    body('payeeName').trim().matches(/^[A-Za-z\s\.\-']{2,100}$/).withMessage('Invalid payee name'),
    body('payeeAccount').matches(accountRegex).withMessage('Invalid payee account'),
    body('swift').matches(swiftRegex).withMessage('Invalid SWIFT'),
    body('currency').isIn(currencyList).withMessage('Invalid currency'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Invalid amount'),
    body('reference').optional().trim().escape().isLength({ max: 140 })
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    paymentValidation,
    validate
};
