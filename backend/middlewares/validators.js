const { body, validationResult } = require('express-validator');

// ENHANCED REGEX WHITELISTING/BLACKLISTING PATTERNS
// Whitelist: Only allow specific characters/patterns
const nameRegex = /^[A-Za-z\s\.\-']{2,100}$/; // Names: letters, spaces, dots, hyphens, apostrophes
const accountRegex = /^\d{8,12}$/; // Account numbers: 8-12 digits only
const employeeIdRegex = /^[A-Z]{3}\d{3,4}$/; // Employee IDs: EMP001, ADM0001 format
const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // SWIFT codes
const currencyList = ['USD','EUR','ZAR','GBP'];

// BLACKLIST: Dangerous characters and patterns to reject
const dangerousCharsRegex = /[<>\"'&\\]/; // XSS/SQL injection characters
const scriptTagsRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi; // Script tags
const sqlInjectionRegex = /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i; // SQL keywords
const pathTraversalRegex = /\.\.[\/\\]/; // Directory traversal
const nullBytesRegex = /\x00/; // Null bytes

// Enhanced email validation with blacklist
const emailBlacklist = [
    /<script/i, />script>/i, /javascript:/i, /vbscript:/i, /onload=/i,
    /onerror=/i, /onclick=/i, /<iframe/i, /<object/i, /<embed/i
];

const registerValidation = [
    body('fullName')
        .trim()
        .matches(nameRegex)
        .withMessage('Name must contain only letters, spaces, dots, hyphens, and apostrophes')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Name contains invalid characters');
            }
            if (scriptTagsRegex.test(value)) {
                throw new Error('Name contains script content');
            }
            return true;
        }),

    body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Email too long')
        .custom(value => {
            // Check against blacklist patterns
            for (const pattern of emailBlacklist) {
                if (pattern.test(value)) {
                    throw new Error('Email contains invalid content');
                }
            }
            return true;
        }),

    body('accountNumber')
        .matches(accountRegex)
        .withMessage('Account number must be 8-12 digits only')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Account number contains invalid characters');
            }
            return true;
        }),

    body('password')
        .isLength({ min: 12 })
        .withMessage('Password must be at least 12 characters')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Password contains invalid characters');
            }
            if (nullBytesRegex.test(value)) {
                throw new Error('Password contains null bytes');
            }
            return true;
        })
];

const loginValidation = [
    body('accountNumber')
        .exists()
        .withMessage('Account number is required')
        .custom(value => {
            // Allow both customer (digits) and employee (EMP/ADM format) account numbers
            if (!accountRegex.test(value) && !employeeIdRegex.test(value)) {
                throw new Error('Invalid account number format');
            }
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Account number contains invalid characters');
            }
            return true;
        }),

    body('password')
        .exists()
        .withMessage('Password is required')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Password contains invalid characters');
            }
            if (nullBytesRegex.test(value)) {
                throw new Error('Password contains null bytes');
            }
            return true;
        })
];

const paymentValidation = [
    body('payeeName')
        .trim()
        .matches(nameRegex)
        .withMessage('Payee name must contain only letters, spaces, dots, hyphens, and apostrophes')
        .isLength({ min: 2, max: 100 })
        .withMessage('Payee name must be 2-100 characters')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Payee name contains invalid characters');
            }
            if (scriptTagsRegex.test(value)) {
                throw new Error('Payee name contains script content');
            }
            return true;
        }),

    body('payeeAccount')
        .matches(accountRegex)
        .withMessage('Payee account must be 8-12 digits only')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Payee account contains invalid characters');
            }
            return true;
        }),

    body('swift')
        .matches(swiftRegex)
        .withMessage('SWIFT code must be 8 or 11 characters (6 letters + 2 alphanumerics + optional 3 alphanumerics)')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('SWIFT code contains invalid characters');
            }
            return true;
        }),

    body('currency')
        .isIn(currencyList)
        .withMessage('Currency must be one of: USD, EUR, ZAR, GBP'),

    body('amount')
        .isFloat({ min: 0.01, max: 1000000 })
        .withMessage('Amount must be between 0.01 and 1,000,000'),

    body('reference')
        .optional()
        .trim()
        .isLength({ max: 140 })
        .withMessage('Reference cannot exceed 140 characters')
        .custom(value => {
            if (value && dangerousCharsRegex.test(value)) {
                throw new Error('Reference contains invalid characters');
            }
            if (value && scriptTagsRegex.test(value)) {
                throw new Error('Reference contains script content');
            }
            return true;
        })
];

// Employee creation validation (admin only)
const employeeValidation = [
    body('fullName')
        .trim()
        .matches(nameRegex)
        .withMessage('Employee name must contain only letters, spaces, dots, hyphens, and apostrophes')
        .isLength({ min: 2, max: 100 })
        .withMessage('Employee name must be 2-100 characters')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Employee name contains invalid characters');
            }
            if (scriptTagsRegex.test(value)) {
                throw new Error('Employee name contains script content');
            }
            return true;
        }),

    body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Email too long')
        .custom(value => {
            for (const pattern of emailBlacklist) {
                if (pattern.test(value)) {
                    throw new Error('Email contains invalid content');
                }
            }
            return true;
        }),

    body('accountNumber')
        .matches(employeeIdRegex)
        .withMessage('Employee ID must be in format EMP001 or ADM0001')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Employee ID contains invalid characters');
            }
            return true;
        }),

    body('password')
        .isLength({ min: 12 })
        .withMessage('Password must be at least 12 characters')
        .custom(value => {
            if (dangerousCharsRegex.test(value)) {
                throw new Error('Password contains invalid characters');
            }
            if (nullBytesRegex.test(value)) {
                throw new Error('Password contains null bytes');
            }
            return true;
        }),

    body('role')
        .optional()
        .isIn(['employee', 'admin'])
        .withMessage('Role must be employee or admin')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn(`[VALIDATION] Validation failed: ${JSON.stringify(errors.array())}`);
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
