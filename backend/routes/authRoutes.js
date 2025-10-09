const express = require('express');
const { register, login, verify2FA, setup2FA, disable2FA, logout } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middlewares/validators');
const { verifyAccessToken, verifyCsrfToken } = require('../middlewares/authMiddleware');

const router = express.Router();


// Public routes (no auth required)
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/verify-2fa', verify2FA);

// Protected routes (authentication + CSRF protection required)
router.post('/2fa-setup', verifyAccessToken, verifyCsrfToken, setup2FA);
router.post('/2fa-disable', verifyAccessToken, verifyCsrfToken, disable2FA);
router.post('/logout', verifyAccessToken, logout);

// Security status endpoint (for monitoring)
router.get('/security-status', verifyAccessToken, (req, res) => {
    res.json({
        authenticated: true,
        user: req.user.uid,
        timestamp: new Date().toISOString(),
        securityFeatures: {
            csrf: 'enabled',
            xss: 'enabled',
            rateLimiting: 'enabled',
            sessionTimeout: '15 minutes',
            https: process.env.NODE_ENV === 'production' ? 'enforced' : 'development'
        }
    });
});

module.exports = router;