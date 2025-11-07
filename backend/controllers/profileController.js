const User = require('../models/userModel');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        const user = await User.findById(userId).select('-passwordHash -__v');
        
        if (!user) {
            return res.status(404).json({
                message: 'User profile not found'
            });
        }
        
        console.log(`[PROFILE] Profile retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: user.toSafeJSON(),
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PROFILE] Get profile error:', err);
        res.status(500).json({
            message: 'Failed to retrieve profile information',
            timestamp: new Date().toISOString()
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { fullName, email, phone, address } = req.body;
        
        // Validate input
        if (!fullName || !email) {
            return res.status(400).json({
                message: 'Full name and email are required'
            });
        }
        
        // Check if email is already in use by another user
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(), 
            _id: { $ne: userId } 
        });
        
        if (existingUser) {
            return res.status(400).json({
                message: 'Email address is already in use'
            });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullName: fullName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone ? phone.trim() : undefined,
                address: address ? address.trim() : undefined,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-passwordHash -__v');
        
        console.log(`[PROFILE] Profile updated for user: ${userId}`);
        
        res.json({
            success: true,
            data: updatedUser.toSafeJSON(),
            message: 'Profile updated successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PROFILE] Update profile error:', err);
        res.status(500).json({
            message: 'Failed to update profile information',
            timestamp: new Date().toISOString()
        });
    }
};

// Get user notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Mock notifications data 
        const notifications = [
            {
                id: '1',
                type: 'payment',
                title: 'Payment Processed',
                message: 'Your international payment of $500.00 USD to John Smith has been processed successfully.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                read: false,
                priority: 'normal'
            },
            {
                id: '2',
                type: 'security',
                title: 'New Device Login',
                message: 'A new device has been used to access your account. If this wasn\'t you, please contact support immediately.',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
                read: true,
                priority: 'high'
            },
            {
                id: '3',
                type: 'system',
                title: 'Scheduled Maintenance',
                message: 'The payment system will undergo scheduled maintenance on Sunday, 12:00 AM - 4:00 AM UTC.',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                read: true,
                priority: 'low'
            }
        ];
        
        console.log(`[PROFILE] Notifications retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: {
                notifications: notifications,
                unreadCount: notifications.filter(n => !n.read).length,
                totalCount: notifications.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PROFILE] Get notifications error:', err);
        res.status(500).json({
            message: 'Failed to retrieve notifications',
            timestamp: new Date().toISOString()
        });
    }
};

// Get user documents
const getDocuments = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Mock documents data 
        const documents = [
            {
                id: '1',
                name: 'Account Statement - September 2025',
                type: 'statement',
                format: 'PDF',
                size: '245 KB',
                uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                downloadUrl: '/api/documents/download/1'
            },
            {
                id: '2',
                name: 'Tax Certificate 2024',
                type: 'tax',
                format: 'PDF',
                size: '180 KB',
                uploadDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
                downloadUrl: '/api/documents/download/2'
            },
            {
                id: '3',
                name: 'Identity Verification',
                type: 'verification',
                format: 'PDF',
                size: '1.2 MB',
                uploadDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
                downloadUrl: '/api/documents/download/3'
            }
        ];
        
        console.log(`[PROFILE] Documents retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: {
                documents: documents,
                totalCount: documents.length,
                totalSize: documents.reduce((sum, doc) => {
                    const sizeInKB = parseFloat(doc.size);
                    return sum + (doc.size.includes('MB') ? sizeInKB * 1024 : sizeInKB);
                }, 0)
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PROFILE] Get documents error:', err);
        res.status(500).json({
            message: 'Failed to retrieve documents',
            timestamp: new Date().toISOString()
        });
    }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { notificationId } = req.params;
        
        // In real implementation, this would update the notification in the database
        console.log(`[PROFILE] Notification ${notificationId} marked as read for user: ${userId}`);
        
        res.json({
            success: true,
            message: 'Notification marked as read',
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[PROFILE] Mark notification read error:', err);
        res.status(500).json({
            message: 'Failed to update notification',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getNotifications,
    getDocuments,
    markNotificationRead
};
