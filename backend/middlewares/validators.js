const { body, validationResult } = require('express-validator');

const nameRegex = /^[A-Za-z\s.\-']{2,100}$/;
const accountRegex = /^\d{8,12}$/;
const employeeIdRegex = /^[A-Z]{3}\d{3,4}$/;
const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const currencyList = ['USD', 'EUR', 'ZAR', 'GBP'];

const dangerousCharsRegex = /[<>\"'&\\]/;
const scriptTagsRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const nullBytesRegex = /\x00/;

const emailBlacklist = [
  /<script/i, />script>/i, /javascript:/i, /vbscript:/i,
  /onload=/i, /onerror=/i, /onclick=/i, /<iframe/i, /<object/i, /<embed/i
];

const safeString = (fieldName) =>
  body(fieldName)
    .custom(value => {
      if (dangerousCharsRegex.test(value)) throw new Error(`${fieldName} contains invalid characters`);
      if (scriptTagsRegex.test(value)) throw new Error(`${fieldName} contains script content`);
      if (nullBytesRegex.test(value)) throw new Error(`${fieldName} contains null bytes`);
      return true;
    });

const validateEmail = body('email')
  .isEmail().normalizeEmail().isLength({ max: 254 })
  .withMessage('Email too long')
  .custom(value => {
    for (const pattern of emailBlacklist) {
      if (pattern.test(value)) throw new Error('Email contains invalid content');
    }
    return true;
  });

const validatePassword = body('password')
  .isLength({ min: 12 })
  .withMessage('Password must be at least 12 characters')
  .custom(value => {
    if (dangerousCharsRegex.test(value)) throw new Error('Password contains invalid characters');
    if (nullBytesRegex.test(value)) throw new Error('Password contains null bytes');
    return true;
  });

// === Validation Schemas ===
const registerValidation = [
  body('fullName').trim().matches(nameRegex)
    .withMessage('Invalid name format')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  safeString('fullName'),
  validateEmail,
  body('accountNumber').matches(accountRegex)
    .withMessage('Account number must be 8–12 digits only'),
  safeString('accountNumber'),
  validatePassword
];

const loginValidation = [
  body('accountNumber')
    .exists().withMessage('Account number is required')
    .custom(value => {
      if (!accountRegex.test(value) && !employeeIdRegex.test(value))
        throw new Error('Invalid account number format');
      if (dangerousCharsRegex.test(value))
        throw new Error('Account number contains invalid characters');
      return true;
    }),
  body('password').exists().withMessage('Password is required'),
  safeString('password')
];

const paymentValidation = [
  body('payeeName').trim().matches(nameRegex)
    .withMessage('Invalid payee name')
    .isLength({ min: 2, max: 100 }),
  safeString('payeeName'),
  body('payeeAccount').matches(accountRegex)
    .withMessage('Payee account must be 8–12 digits only'),
  safeString('payeeAccount'),
  body('swift').matches(swiftRegex)
    .withMessage('Invalid SWIFT code'),
  safeString('swift'),
  body('currency').isIn(currencyList)
    .withMessage(`Currency must be one of: ${currencyList.join(', ')}`),
  body('amount').isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
  body('reference').optional().trim().isLength({ max: 140 })
    .withMessage('Reference too long'),
  safeString('reference')
];

const employeeValidation = [
  body('fullName').trim().matches(nameRegex)
    .withMessage('Invalid employee name')
    .isLength({ min: 2, max: 100 }),
  safeString('fullName'),
  validateEmail,
  body('accountNumber').matches(employeeIdRegex)
    .withMessage('Employee ID must be in format EMP001 or ADM0001'),
  safeString('accountNumber'),
  validatePassword,
  body('role').optional().isIn(['employee', 'admin'])
    .withMessage('Role must be employee or admin')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(`[VALIDATION] Failed: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      message: 'Input validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  paymentValidation,
  employeeValidation,
  validate
};
