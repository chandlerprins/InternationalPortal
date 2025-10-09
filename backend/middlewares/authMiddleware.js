const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');


const verifyAccessToken = (req, res, next) => {
    const token = req.cookies['access_token'];
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Unauthorized - No access token provided',
            action: 'redirect_to_login'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        
        // Enhanced session security logging
        const userAgent = req.get('User-Agent');
        const ip = req.ip || req.connection.remoteAddress;
        
        console.log(`[AUTH] Session activity - User: ${payload.uid}, IP: ${ip}, UA: ${userAgent?.substring(0, 50)}`);
        
        // SESSION ID REGENERATION for critical actions
        if (req.regenerateSession) {
            console.log(`[AUTH] Regenerating session for user ${payload.uid}`);
            
            // Generate new tokens
            const newAccessToken = jwt.sign(
                { uid: payload.uid }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );
            
            const newRefreshToken = jwt.sign(
                { uid: payload.uid }, 
                process.env.REFRESH_TOKEN_SECRET, 
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
            );
            
            // Set new secure cookies (HttpOnly, Secure, SameSite)
            res.cookie('access_token', newAccessToken, {
                httpOnly: true, // Prevent XSS access to cookies
                sameSite: 'strict', // CSRF protection
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            
            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Generate new CSRF token
            const newCsrfToken = uuidv4();
            res.cookie(process.env.CSRF_COOKIE_NAME || 'csrf_token', newCsrfToken, {
                httpOnly: false, // need to read this for CSRF protection
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            
            console.log(`[AUTH] Session regenerated successfully for user ${payload.uid}`);
        }
        
        next();
        
    } catch (err) {
        console.warn(`[AUTH] Token verification failed: ${err.message}`);
        
        // Clear potentially compromised cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.clearCookie(process.env.CSRF_COOKIE_NAME || 'csrf_token');
        
        return res.status(401).json({ 
            message: 'Invalid or expired token',
            action: 'redirect_to_login'
        });
    }
};

/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */
const verifyCsrfToken = (req, res, next) => {
    // Skip CSRF for GET requests (they should be idempotent)
    if (req.method === 'GET') {
        return next();
    }
    
    const csrfCookie = req.cookies[process.env.CSRF_COOKIE_NAME || 'csrf_token'];
    const csrfHeader = req.header('x-csrf-token');
    
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        console.warn(`[SECURITY] CSRF token mismatch - IP: ${req.ip}, UA: ${req.get('User-Agent')?.substring(0, 50)}`);
        return res.status(403).json({ 
            message: 'Invalid CSRF token. Request rejected for security.',
            action: 'refresh_and_retry'
        });
    }
    
    next();
};

/**
 * Enhanced Password Security Check
 * Validates password strength according to banking standards
 */
const validatePasswordStrength = (password) => {
    const minLength = 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasNoCommonPatterns = !/^(password|123456|qwerty|admin)/i.test(password);
    
    return {
        isValid: password.length >= minLength && hasUppercase && hasLowercase && 
                hasNumbers && hasSpecialChars && hasNoCommonPatterns,
        requirements: {
            minLength: password.length >= minLength,
            hasUppercase,
            hasLowercase,
            hasNumbers,
            hasSpecialChars,
            hasNoCommonPatterns
        }
    };
};

/**
 * Secure session termination
 */
const terminateSession = (res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
    
    res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
    
    res.clearCookie(process.env.CSRF_COOKIE_NAME || 'csrf_token', {
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
};

module.exports = { 
    verifyAccessToken, 
    verifyCsrfToken,
    validatePasswordStrength,
    terminateSession
};


