const express = require('express');
const {
    getProfile,
    updateProfile,
    getNotifications,
    getDocuments,
    markNotificationRead
} = require('../controllers/profileController');
const { verifyAccessToken, verifyCsrfToken } = require('../middlewares/authMiddleware');

const router = express.Router();


// Get user profile (GET) - No CSRF needed
router.get('/', verifyAccessToken, getProfile);

// Update user profile (PUT) - Requires CSRF protection
router.put('/', verifyAccessToken, verifyCsrfToken, updateProfile);

// Get user notifications (GET) - No CSRF needed
router.get('/notifications', verifyAccessToken, getNotifications);

// Get user documents (GET) - No CSRF needed
router.get('/documents', verifyAccessToken, getDocuments);

// Mark notification as read (PUT) - Requires CSRF protection
router.put('/notifications/:notificationId/read', verifyAccessToken, verifyCsrfToken, markNotificationRead);

module.exports = router;
