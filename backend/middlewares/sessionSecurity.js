const jwt = require('jsonwebtoken');
require('dotenv').config();

// Track active sessions for security monitoring
const activeSessions = new Map();
const suspiciousActivity = new Map();

const sessionSecurityMiddleware = (req, res, next) => {
    const token = req.cookies['access_token'];
    
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const userId = payload.uid;
            const userAgent = req.get('User-Agent');
            const ip = req.ip || req.connection.remoteAddress;
            const sessionKey = `${userId}_${ip}`;
            
            // Track session activity
            const now = Date.now();
            const lastActivity = activeSessions.get(sessionKey);
            
            // 1. SESSION TIMEOUT PROTECTION (15 minutes for banking)
            const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
            if (lastActivity && (now - lastActivity.timestamp) > SESSION_TIMEOUT) {
                console.warn(`Session timeout for user ${userId} from IP ${ip}`);
                activeSessions.delete(sessionKey);
                clearSessionCookies(res);
                return res.status(401).json({
                    message: 'Session expired due to inactivity',
                    action: 'redirect_to_login'
                });
            }
            
            // 2. SUSPICIOUS ACTIVITY DETECTION
            if (lastActivity) {
                // Detect IP address changes
                if (lastActivity.ip !== ip) {
                    console.warn(`IP change detected - User: ${userId}, Old IP: ${lastActivity.ip}, New IP: ${ip}`);
                    logSuspiciousActivity(userId, 'IP_CHANGE', { oldIp: lastActivity.ip, newIp: ip });
                    
                    // Force re-authentication for IP changes
                    activeSessions.delete(sessionKey);
                    clearSessionCookies(res);
                    return res.status(401).json({
                        message: 'Suspicious activity detected. Please log in again.',
                        action: 'redirect_to_login'
                    });
                }
                
                // Detect unusual user agent changes
                if (lastActivity.userAgent !== userAgent) {
                    console.warn(`User agent change detected - User: ${userId}, IP: ${ip}`);
                    logSuspiciousActivity(userId, 'USER_AGENT_CHANGE', { oldUA: lastActivity.userAgent, newUA: userAgent });
                }
                
                // Detect rapid requests (potential automation/bot)
                if (now - lastActivity.timestamp < 1000) { // Less than 1 second
                    const suspiciousKey = `${userId}_${ip}`;
                    const suspiciousCount = suspiciousActivity.get(suspiciousKey) || 0;
                    
                    if (suspiciousCount > 10) { // More than 10 rapid requests
                        console.warn(`Rapid requests detected - User: ${userId}, IP: ${ip}`);
                        activeSessions.delete(sessionKey);
                        clearSessionCookies(res);
                        return res.status(429).json({
                            message: 'Suspicious activity detected. Account temporarily locked.',
                            action: 'redirect_to_login'
                        });
                    }
                    
                    suspiciousActivity.set(suspiciousKey, suspiciousCount + 1);
                }
            }
            
            // 3. UPDATE SESSION TRACKING
            activeSessions.set(sessionKey, {
                timestamp: now,
                userAgent: userAgent,
                ip: ip,
                userId: userId
            });
            
            // 4. SESSION ID REGENERATION (for critical actions)
            if (isCriticalAction(req)) {
                console.log(`Critical action detected - regenerating session for user ${userId}`);
                // This will be handled in the auth middleware by issuing new tokens
                req.regenerateSession = true;
            }
            
        } catch (err) {
            // Token verification failed, let auth middleware handle it
            console.warn(`Token verification failed: ${err.message}`);
        }
    }
    
    next();
};

// Helper function to clear all session cookies
const clearSessionCookies = (res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie(process.env.CSRF_COOKIE_NAME || 'csrf_token');
};

// Helper function to identify critical actions requiring session regeneration
const isCriticalAction = (req) => {
    const criticalPaths = [
        '/v1/payments',
        '/v1/auth/2fa-setup',
        '/v1/auth/verify-2fa'
    ];
    
    return criticalPaths.some(path => req.path.startsWith(path)) && req.method === 'POST';
};

// Log suspicious activity for security monitoring
const logSuspiciousActivity = (userId, activityType, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId,
        activityType,
        details,
        severity: 'HIGH'
    };
    
    console.warn('SECURITY ALERT:', JSON.stringify(logEntry));
    

};

// Cleanup expired sessions every 5 minutes
setInterval(() => {
    const now = Date.now();
    const expiredThreshold = 15 * 60 * 1000; // 15 minutes
    
    for (const [key, session] of activeSessions.entries()) {
        if (now - session.timestamp > expiredThreshold) {
            console.log(`Cleaning up expired session: ${key}`);
            activeSessions.delete(key);
        }
    }
    
    // Clean up suspicious activity tracking
    suspiciousActivity.clear();
    
}, 5 * 60 * 1000); // Run every 5 minutes

// Force logout specific user session
const forceLogoutUser = (userId, ip = null) => {
    if (ip) {
        const sessionKey = `${userId}_${ip}`;
        activeSessions.delete(sessionKey);
    } else {
        // Logout all sessions for this user
        for (const [key, session] of activeSessions.entries()) {
            if (session.userId === userId) {
                activeSessions.delete(key);
            }
        }
    }
};

// Get security statistics
const getSecurityStats = () => {
    return {
        activeSessions: activeSessions.size,
        sessionsDetails: Array.from(activeSessions.entries()).map(([key, session]) => ({
            sessionKey: key,
            userId: session.userId,
            ip: session.ip,
            lastActivity: new Date(session.timestamp).toISOString()
        }))
    };
};

module.exports = {
    sessionSecurityMiddleware,
    forceLogoutUser,
    getSecurityStats,
    clearSessionCookies
};
