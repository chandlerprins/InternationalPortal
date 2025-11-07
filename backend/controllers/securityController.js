const User = require('../models/userModel');


// Get security events/audit log
const getSecurityEvents = async (req, res) => {
    try {
        const userId = req.user.uid;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Mock security events
        const securityEvents = [
            {
                id: '1',
                eventType: 'login_success',
                description: 'Successful login',
                timestamp: new Date().toISOString(),
                ipAddress: clientIP,
                userAgent: req.get('User-Agent') || 'Unknown',
                location: 'Unknown', 
                riskLevel: 'low'
            },
            {
                id: '2',
                eventType: 'password_change',
                description: 'Password changed successfully',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: 'New York, USA',
                riskLevel: 'medium'
            },
            {
                id: '3',
                eventType: 'login_attempt',
                description: 'Failed login attempt',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                ipAddress: '203.0.113.45',
                userAgent: 'Unknown',
                location: 'Unknown',
                riskLevel: 'high'
            },
            {
                id: '4',
                eventType: '2fa_enabled',
                description: 'Two-factor authentication enabled',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: 'New York, USA',
                riskLevel: 'low'
            },
            {
                id: '5',
                eventType: 'payment_created',
                description: 'International payment initiated',
                timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: 'New York, USA',
                riskLevel: 'medium'
            }
        ];
        
        console.log(`[SECURITY] Security events retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: {
                events: securityEvents,
                summary: {
                    totalEvents: securityEvents.length,
                    highRiskEvents: securityEvents.filter(e => e.riskLevel === 'high').length,
                    mediumRiskEvents: securityEvents.filter(e => e.riskLevel === 'medium').length,
                    lowRiskEvents: securityEvents.filter(e => e.riskLevel === 'low').length,
                    lastActivity: securityEvents[0]?.timestamp
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[SECURITY] Get security events error:', err);
        res.status(500).json({
            message: 'Failed to retrieve security events',
            timestamp: new Date().toISOString()
        });
    }
};

// Get trusted devices
const getTrustedDevices = async (req, res) => {
    try {
        const userId = req.user.uid;
        const currentUserAgent = req.get('User-Agent') || 'Unknown';
        const currentIP = req.ip || req.connection.remoteAddress;
        
        // Mock trusted devices 
        const trustedDevices = [
            {
                id: '1',
                deviceName: 'Windows PC - Chrome',
                deviceType: 'desktop',
                browser: 'Chrome 118.0',
                operatingSystem: 'Windows 11',
                ipAddress: currentIP,
                lastSeen: new Date().toISOString(),
                firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                location: 'New York, USA',
                isCurrent: true,
                trusted: true
            },
            {
                id: '2',
                deviceName: 'iPhone 13 - Safari',
                deviceType: 'mobile',
                browser: 'Safari 16.0',
                operatingSystem: 'iOS 17.0',
                ipAddress: '192.168.1.150',
                lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                firstSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
                location: 'New York, USA',
                isCurrent: false,
                trusted: true
            },
            {
                id: '3',
                deviceName: 'MacBook Pro - Chrome',
                deviceType: 'desktop',
                browser: 'Chrome 117.0',
                operatingSystem: 'macOS 14.0',
                ipAddress: '203.0.113.100',
                lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                firstSeen: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
                location: 'California, USA',
                isCurrent: false,
                trusted: false
            }
        ];
        
        console.log(`[SECURITY] Trusted devices retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: {
                devices: trustedDevices,
                summary: {
                    totalDevices: trustedDevices.length,
                    trustedDevices: trustedDevices.filter(d => d.trusted).length,
                    untrustedDevices: trustedDevices.filter(d => !d.trusted).length,
                    currentDevice: trustedDevices.find(d => d.isCurrent),
                    lastActivity: trustedDevices[0]?.lastSeen
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[SECURITY] Get trusted devices error:', err);
        res.status(500).json({
            message: 'Failed to retrieve trusted devices',
            timestamp: new Date().toISOString()
        });
    }
};

// Revoke device trust
const revokeDeviceTrust = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { deviceId } = req.params;
        
        // In real implementation, this would update the device trust status in the database
        console.log(`[SECURITY] Device trust revoked - User: ${userId}, Device: ${deviceId}`);
        
        res.json({
            success: true,
            message: 'Device trust revoked successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[SECURITY] Revoke device trust error:', err);
        res.status(500).json({
            message: 'Failed to revoke device trust',
            timestamp: new Date().toISOString()
        });
    }
};

// Get security settings
const getSecuritySettings = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        const user = await User.findById(userId).select('is2FAEnabled email fullName');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        
        const securitySettings = {
            twoFactorEnabled: user.is2FAEnabled || false,
            loginNotifications: true, // Mock setting
            paymentNotifications: true, // Mock setting
            securityAlerts: true, // Mock setting
            sessionTimeout: 15, // minutes
            passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            accountCreated: user.createdAt || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            lastPasswordCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        };
        
        console.log(`[SECURITY] Security settings retrieved for user: ${userId}`);
        
        res.json({
            success: true,
            data: securitySettings,
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[SECURITY] Get security settings error:', err);
        res.status(500).json({
            message: 'Failed to retrieve security settings',
            timestamp: new Date().toISOString()
        });
    }
};

// Update security settings
const updateSecuritySettings = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { loginNotifications, paymentNotifications, securityAlerts, sessionTimeout } = req.body;
        
        // In real implementation, this would update security settings in the database
        console.log(`[SECURITY] Security settings updated for user: ${userId}`);
        
        res.json({
            success: true,
            message: 'Security settings updated successfully',
            data: {
                loginNotifications: loginNotifications !== undefined ? loginNotifications : true,
                paymentNotifications: paymentNotifications !== undefined ? paymentNotifications : true,
                securityAlerts: securityAlerts !== undefined ? securityAlerts : true,
                sessionTimeout: sessionTimeout || 15
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('[SECURITY] Update security settings error:', err);
        res.status(500).json({
            message: 'Failed to update security settings',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    getSecurityEvents,
    getTrustedDevices,
    revokeDeviceTrust,
    getSecuritySettings,
    updateSecuritySettings
};
