const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/userModel');
const config = require('../config');
const { redactSensitive } = require('../middlewares/sanitizeLogger');
const { validatePasswordStrength, terminateSession } = require('../middlewares/authMiddleware');

// Simple email-based 2FA codes storage (in production, use Redis)
const emailCodes = new Map();
const CODE_EXPIRY = 5 * 60 * 1000; // 5 minutes


// Generate random 6-digit code for email 2FA
const generateEmailCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email code (simplified - just log it for now)
const sendEmailCode = async (email, code) => {
    // In production, integrate with email service (SendGrid, SES, etc.)
    console.log(`[EMAIL] 2FA Code for ${email}: ${code}`);
    console.log(`[EMAIL] Code expires in 5 minutes`);
    return true;
};
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Register new user with comprehensive security
const register = async (req, res) => {
    try {
        const { fullName, email, accountNumber, password } = req.body;
        
        console.log(`[AUTH] Registration attempt for account: ${accountNumber}`);
        
        // STRONG PASSWORD VALIDATION
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'Password does not meet security requirements',
                requirements: passwordValidation.requirements
            });
        }
        
        // Check for existing users
        if (await User.findOne({ accountNumber })) {
            console.warn(`[SECURITY] Registration attempt with existing account number: ${accountNumber}`);
            return res.status(400).json({ message: 'Account number already exists' });
        }
        
        if (await User.findOne({ email })) {
            console.warn(`[SECURITY] Registration attempt with existing email: ${email}`);
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // ENHANCED HASHING AND SALTING (12 rounds for banking security)
        const saltRounds = config.saltRounds || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const user = new User({
            fullName,
            email,
            accountNumber,
            passwordHash
        });
        
        await user.save();
        
        console.log(`[AUTH] User registered successfully: ${accountNumber}`);
        res.status(201).json({ 
            message: 'Registration successful. Please log in.',
            accountNumber: accountNumber // Safe to return
        });
        
    } catch (err) {
        console.error('[AUTH] Registration error:', err);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

// Enhanced login with comprehensive security checks
const login = async (req, res) => {
    try {
        const { accountNumber, password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        console.log(`[AUTH] Login attempt for account: ${accountNumber} from IP: ${clientIP}`);
        
        // BRUTE FORCE PROTECTION
        const attemptKey = `${accountNumber}_${clientIP}`;
        const attempts = loginAttempts.get(attemptKey) || { count: 0, lockedUntil: null };
        
        // Check if account is locked
        if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
            const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60);
            console.warn(`[SECURITY] Blocked login attempt for locked account: ${accountNumber}`);
            return res.status(423).json({ 
                message: `Account temporarily locked. Try again in ${remainingTime} minutes.`
            });
        }
        
        // Reset attempts if lockout period has expired
        if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
            loginAttempts.delete(attemptKey);
            attempts.count = 0;
            attempts.lockedUntil = null;
        }
        
        const user = await User.findOne({ accountNumber });
        
        if (!user) {
            // Increment failed attempts even for non-existent accounts to prevent enumeration
            attempts.count++;
            if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
                attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
                console.warn(`[SECURITY] Account locked due to multiple failed attempts: ${accountNumber}`);
            }
            loginAttempts.set(attemptKey, attempts);
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            attempts.count++;
            if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
                attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
                console.warn(`[SECURITY] Account locked due to multiple failed attempts: ${accountNumber}`);
            }
            loginAttempts.set(attemptKey, attempts);
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Successful login - clear failed attempts
        loginAttempts.delete(attemptKey);
        
        // TWO-FACTOR AUTHENTICATION CHECK
        if (user.is2FAEnabled) {
            // Generate and send email code
            const emailCode = generateEmailCode();
            const codeKey = `${user._id}_${Date.now()}`;
            
            emailCodes.set(codeKey, {
                code: emailCode,
                userId: user._id,
                email: user.email,
                createdAt: Date.now(),
                expiresAt: Date.now() + CODE_EXPIRY
            });
            
            // Send email (for now just log it)
            await sendEmailCode(user.email, emailCode);
            
            const tempToken = jwt.sign(
                { uid: user._id, twofa: true, codeKey: codeKey }, 
                config.jwtSecret, 
                { expiresIn: '10m' }
            );
            
            console.log(`[AUTH] Email 2FA code sent to user: ${user._id}`);
            return res.json({ 
                message: 'Please check your email for the verification code', 
                tempToken,
                requiresTwoFactor: true,
                method: 'email'
            });
        }
        
        // Generate secure session tokens
        const tokenData = { uid: user._id, accountNumber: user.accountNumber, role: user.role };
        const accessToken = jwt.sign(tokenData, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
        const refreshToken = jwt.sign(tokenData, config.refreshSecret, { expiresIn: config.refreshExpiresIn });
        
        // Set SECURE COOKIES (HttpOnly, Secure, SameSite)
        res.cookie('access_token', accessToken, {
            httpOnly: true, // XSS Protection
            sameSite: 'strict', // CSRF Protection
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            maxAge: 15 * 60 * 1000 // 15 minutes for banking security
        });
        
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // CSRF TOKEN (Double-submit cookie pattern)
        const csrfToken = uuidv4();
        res.cookie(config.csrfCookieName, csrfToken, {
            httpOnly: false, // need to read this for CSRF headers
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        console.log(`[AUTH] Successful login for user: ${user._id}`);
        res.json({ 
            message: 'Login successful',
            user: user.toSafeJSON(),
            csrfToken: csrfToken // need this for API calls
        });
        
    } catch (err) {
        console.error('[AUTH] Login error:', redactSensitive(err));
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// Enhanced email-based 2FA verification
const verify2FA = async (req, res) => {
    try {
        const { tempToken, code } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        if (!tempToken || !code) {
            return res.status(400).json({ message: 'Missing verification code or token' });
        }
        
        let payload;
        try {
            payload = jwt.verify(tempToken, config.jwtSecret);
        } catch (err) {
            console.warn(`[SECURITY] Invalid 2FA temp token from IP: ${clientIP}`);
            return res.status(401).json({ message: 'Invalid or expired verification token' });
        }
        
        if (!payload.twofa || !payload.codeKey) {
            return res.status(401).json({ message: 'Invalid verification token' });
        }
        
        // Find the stored code
        const storedData = emailCodes.get(payload.codeKey);
        if (!storedData) {
            return res.status(401).json({ message: 'Verification code not found or expired' });
        }
        
        // Check if code has expired
        if (Date.now() > storedData.expiresAt) {
            emailCodes.delete(payload.codeKey);
            return res.status(401).json({ message: 'Verification code has expired' });
        }
        
        // Verify the code
        if (storedData.code !== code.trim()) {
            console.warn(`[SECURITY] Failed email 2FA attempt for user: ${storedData.userId} from IP: ${clientIP}`);
            return res.status(401).json({ message: 'Invalid verification code' });
        }
        
        // Clean up used code
        emailCodes.delete(payload.codeKey);
        
        const user = await User.findById(storedData.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Successful 2FA - issue full session tokens
        const tokenData = { uid: user._id, accountNumber: user.accountNumber, role: user.role };
        const accessToken = jwt.sign(tokenData, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
        const refreshToken = jwt.sign(tokenData, config.refreshSecret, { expiresIn: config.refreshExpiresIn });
        
        // Set secure cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
        });
        
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        const csrfToken = uuidv4();
        res.cookie(config.csrfCookieName, csrfToken, {
            httpOnly: false,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        console.log(`[AUTH] Successful email 2FA verification for user: ${user._id}`);
        res.json({ 
            message: 'Authentication successful',
            user: user.toSafeJSON(),
            csrfToken: csrfToken
        });
        
    } catch (err) {
        console.error('[AUTH] 2FA verification error:', err);
        res.status(500).json({ message: '2FA verification failed. Please try again.' });
    }
};

// Email-based 2FA Setup (much simpler)
const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.is2FAEnabled = true;
        await user.save();
        
        console.log(`[AUTH] Email-based 2FA enabled for user: ${user._id}`);
        
        res.json({ 
            message: 'Email-based 2FA enabled successfully',
            method: 'email',
            description: 'You will receive a 6-digit code via email when logging in'
        });
        
    } catch (err) {
        console.error('[AUTH] 2FA setup error:', err);
        res.status(500).json({ message: '2FA setup failed. Please try again.' });
    }
};

// Disable 2FA
const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.is2FAEnabled = false;
        user.twoFASecret = undefined; // Remove any old secrets
        await user.save();
        
        console.log(`[AUTH] 2FA disabled for user: ${user._id}`);
        
        res.json({ 
            message: '2FA disabled successfully'
        });
        
    } catch (err) {
        console.error('[AUTH] 2FA disable error:', err);
        res.status(500).json({ message: 'Failed to disable 2FA. Please try again.' });
    }
};

// Secure logout with comprehensive session termination
const logout = async (req, res) => {
    try {
        const userId = req.user?.uid;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Clear all session cookies securely
        terminateSession(res);
        
        console.log(`[AUTH] User logged out: ${userId || 'unknown'} from IP: ${clientIP}`);
        res.json({ 
            message: 'Logout successful',
            action: 'redirect_to_login'
        });
        
    } catch (err) {
        console.error('[AUTH] Logout error:', err);
        res.status(500).json({ message: 'Logout failed' });
    }
};

// Cleanup old email codes periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of emailCodes.entries()) {
        if (now >= data.expiresAt) {
            emailCodes.delete(key);
        }
    }
    
    // Also cleanup old login attempts
    for (const [key, attempts] of loginAttempts.entries()) {
        if (attempts.lockedUntil && now >= attempts.lockedUntil) {
            loginAttempts.delete(key);
        }
    }
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = { register, login, verify2FA, setup2FA, disable2FA, logout };