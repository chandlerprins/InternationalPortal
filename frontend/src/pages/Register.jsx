import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        accountNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Full name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        } else if (!/^[A-Za-z\s.'-]+$/.test(formData.fullName)) {
            newErrors.fullName = 'Full name contains invalid characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Account number validation
        if (!formData.accountNumber) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{8,12}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account number must be 8-12 digits';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 12) {
            newErrors.password = 'Password must be at least 12 characters';
        } else {
            const passwordChecks = {
                hasUpper: /[A-Z]/.test(formData.password),
                hasLower: /[a-z]/.test(formData.password),
                hasNumber: /\d/.test(formData.password),
                hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
                hasNoCommonPatterns: !/^(password|123456|qwerty|admin)/i.test(formData.password)
            };

            if (!passwordChecks.hasUpper) {
                newErrors.password = 'Password must contain uppercase letters';
            } else if (!passwordChecks.hasLower) {
                newErrors.password = 'Password must contain lowercase letters';
            } else if (!passwordChecks.hasNumber) {
                newErrors.password = 'Password must contain numbers';
            } else if (!passwordChecks.hasSpecial) {
                newErrors.password = 'Password must contain special characters (!@#$%^&*()_+-=[]{};\'"\\|,.<>?/)';
            } else if (!passwordChecks.hasNoCommonPatterns) {
                newErrors.password = 'Password cannot start with common patterns (password, 123456, qwerty, admin)';
            }
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const result = await register({
                fullName: formData.fullName.trim(),
                email: formData.email.toLowerCase().trim(),
                accountNumber: formData.accountNumber.trim(),
                password: formData.password
            });

            if (result.success) {
                setMessage('Registration successful! Please log in with your credentials.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let score = 0;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

        const levels = [
            { strength: 0, label: 'Very Weak', color: '#ef4444' },
           { strength: 1, label: 'Weak', color: '#f59e0b' },
            { strength: 2, label: 'Fair', color: '#f59e0b' },
           { strength: 3, label: 'Good', color: '#3b82f6' },
            { strength: 4, label: 'Strong', color: '#10b981' },
            { strength: 5, label: 'Very Strong', color: '#10b981' }
        ];

        return levels[score];
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="register-page">
            <div className="container">
                <div className="register-container">
                    <div className="register-header">
                        <div className="register-icon">
                        </div>
                        <h1 className="register-title">Create Your Account</h1>
                        <p className="register-subtitle">
                            Join our secure international payments platform
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        {message && (
                            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`}>
                                {message}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="fullName" className="form-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`form-input ${errors.fullName ? 'error' : ''}`}
                                placeholder="Enter your full name"
                                required
                            />
                            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="Enter your email address"
                                required
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="accountNumber" className="form-label">
                                Account Number
                            </label>
                            <input
                                type="text"
                                id="accountNumber"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className={`form-input ${errors.accountNumber ? 'error' : ''}`}
                                placeholder="8-12 digit account number"
                                maxLength={12}
                                required
                            />
                            {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
                            <small className="form-help">Your unique banking account identifier</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div 
                                            className="strength-fill"
                                            style={{ 
                                                width: `${(passwordStrength.strength / 5) * 100}%`,
                                                backgroundColor: passwordStrength.color
                                            }}
                                        ></div>
                                    </div>
                                    <span 
                                        className="strength-label"
                                        style={{ color: passwordStrength.color }}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}
                            {errors.password && <span className="error-text">{errors.password}</span>}
                            <div className="password-requirements">
                                <small>Password must contain:</small>
                                <ul>
                                    <li className={formData.password.length >= 12 ? 'valid' : ''}>
                                        At least 12 characters
                                    </li>
                                    <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                        Uppercase letters (A-Z)
                                    </li>
                                    <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                                        Lowercase letters (a-z)
                                    </li>
                                    <li className={/\d/.test(formData.password) ? 'valid' : ''}>
                                        Numbers (0-9)
                                    </li>
                                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'valid' : ''}>
                                        Special characters (!@#$%^&*)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        <div className="register-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="security-notice">
                        <div>
                            <h4>Your Security is Our Priority</h4>
                            <p>
                                We use bank-grade encryption and never store your password in plain text.
                                Your personal information is protected according to international banking standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .register-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    padding: 2rem 0;
                    display: flex;
                    align-items: center;
                }

                .register-container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: var(--card-background);
                    border-radius: 16px;
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                }

                .register-header {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }

                .register-icon {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    font-size: 1.5rem;
                }

                .register-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .register-subtitle {
                    opacity: 0.9;
                    font-size: 1rem;
                }

                .register-form {
                    padding: 2rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .password-input-container {
                    position: relative;
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: color 0.3s ease;
                }

                .password-toggle:hover {
                    color: var(--primary-color);
                }

                .password-strength {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                }

                .strength-bar {
                    flex: 1;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .strength-fill {
                    height: 100%;
                    transition: all 0.3s ease;
                }

                .strength-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    min-width: 80px;
                }

                .password-requirements {
                    margin-top: 0.75rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color);
                }

                .password-requirements small {
                    color: var(--text-secondary);
                    font-weight: 600;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .password-requirements ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .password-requirements li {
                    padding: 0.25rem 0;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    position: relative;
                    padding-left: 1.5rem;
                }

                .password-requirements li::before {
                    content: '✗';
                    position: absolute;
                    left: 0;
                    color: var(--error-color);
                    font-weight: bold;
                }

                .password-requirements li.valid {
                    color: var(--success-color);
                }

                .password-requirements li.valid::before {
                    content: '✓';
                    color: var(--success-color);
                }

                .form-help {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .error-text {
                    display: block;
                    color: var(--error-color);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }

                .register-footer {
                    text-align: center;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                }

                .auth-link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                }

                .auth-link:hover {
                    text-decoration: underline;
                }

                .security-notice {
                    padding: 1.5rem 2rem;
                    background: #f0f9ff;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .security-icon {
                    color: var(--primary-color);
                    font-size: 1.25rem;
                    margin-top: 0.25rem;
                }

                .security-notice h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    color: var(--text-primary);
                }

                .security-notice p {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.4;
                }

                @media (max-width: 768px) {
                    .register-page {
                        padding: 1rem;
                    }

                    .register-container {
                        margin: 0;
                    }

                    .register-form {
                        padding: 1.5rem;
                    }

                    .register-header {
                        padding: 1.5rem;
                    }

                    .register-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;
