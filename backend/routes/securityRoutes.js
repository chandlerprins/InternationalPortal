const express = require('express');
const {
    getSecurityEvents,
    getTrustedDevices,
    revokeDeviceTrust,
    getSecuritySettings,
    updateSecuritySettings
} = require('../controllers/securityController');
const { verifyAccessToken, verifyCsrfToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get security events/audit log (GET) - No CSRF needed
router.get('/events', verifyAccessToken, getSecurityEvents);

// Get trusted devices (GET) - No CSRF needed
router.get('/devices', verifyAccessToken, getTrustedDevices);

// Revoke device trust (DELETE) - Requires CSRF protection
router.delete('/devices/:deviceId', verifyAccessToken, verifyCsrfToken, revokeDeviceTrust);

// Get security settings (GET) - No CSRF needed
router.get('/settings', verifyAccessToken, getSecuritySettings);

// Update security settings (PUT) - Requires CSRF protection
router.put('/settings', verifyAccessToken, verifyCsrfToken, updateSecuritySettings);

module.exports = router;
