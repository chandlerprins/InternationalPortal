import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
    const [formData, setFormData] = useState({
        accountNumber: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [twoFACode, setTwoFACode] = useState('');

    const { login, verify2FA, skipTwoFA, requires2FA, isAuthenticated, userRole, checkAuthStatus } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            if (userRole === 'employee') {
                navigate('/employee/dashboard');
            } else if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, userRole, navigate]);

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

        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{8,12}$/.test(formData.accountNumber.trim())) {
            newErrors.accountNumber = 'Account number must be 8-12 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            const result = await login(formData.accountNumber.trim(), formData.password);

            if (result.success) {
                if (userRole === 'employee') {
                    navigate('/employee/dashboard');
                } else if (userRole === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else if (result.requires2FA) {
                setShow2FA(true);
                setMessage('Please enter your 2FA code to continue');
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        
        if (!twoFACode.trim()) {
            setMessage('Please enter your 2FA code');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const result = await verify2FA(twoFACode.trim());

            if (result.success) {
                if (userRole === 'employee') {
                    navigate('/employee/dashboard');
                } else if (userRole === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage('2FA verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (show2FA || requires2FA) {
        return (
            <div className="login-page">
                <div className="container">
                    <div className="login-container">
                        <div className="login-header">
                            <div className="login-icon">
                            
                            </div>
                            <h1 className="login-title">Email Verification</h1>
                            <p className="login-subtitle">
                                We've sent a 6-digit code to your email address. Please enter it below.
                            </p>
                        </div>

                        <form onSubmit={handle2FASubmit} className="login-form">
                            {message && (
                                <div className={`alert ${message.includes('enter') ? 'alert-info' : 'alert-error'}`}>
                                    {message}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="twoFACode" className="form-label">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="twoFACode"
                                    value={twoFACode}
                                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="form-input code-input"
                                    placeholder="000000"
                                    maxLength={6}
                                    pattern="\d{6}"
                                    required
                                />
                                <small className="form-help">
                                    Check your email for the 6-digit verification code
                                </small>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary btn-full"
                                disabled={isLoading || twoFACode.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>

                            <div className="login-footer">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShow2FA(false);
                                        setTwoFACode('');
                                        setMessage('');
                                    }}
                                    className="btn btn-secondary btn-full"
                                >
                                    Back to Login
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={async () => {
                                        setMessage('Skipping 2FA for testing...');
                                        try {
                                            const result = await skipTwoFA();
                                            if (result.success) {
                                                setShow2FA(false);
                                                if (userRole === 'employee') {
                                                    navigate('/employee/dashboard');
                                                } else if (userRole === 'admin') {
                                                    navigate('/admin/dashboard');
                                                } else {
                                                    navigate('/dashboard');
                                                }
                                            } else {
                                                setMessage(result.message);
                                            }
                                        } catch (error) {
                                            setMessage('Failed to skip 2FA');
                                        }
                                    }}
                                    className="btn btn-outline btn-full"
                                    style={{ marginTop: '0.5rem' }}
                                    disabled={isLoading}
                                >
                                    Skip 2FA (Testing Mode)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-container">
                    <div className="login-header">
                        
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">
                            Sign in to your secure international payments account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {message && (
                            <div className="alert alert-error">
                                {message}
                            </div>
                        )}

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
                                placeholder="Enter your account number"
                                maxLength={12}
                                required
                            />
                            {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
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
                                    placeholder="Enter your password"
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
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className="login-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="auth-link">
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="security-notice">
                        <div>
                            <h4>Secure Login</h4>
                            <p>
                                Your connection is encrypted and protected. We never store your 
                                login credentials in plain text.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    padding: 2rem 0;
                    display: flex;
                    align-items: center;
                }

                .login-container {
                    max-width: 450px;
                    margin: 0 auto;
                    background: var(--card-background);
                    border-radius: 16px;
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                }

                .login-header {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }

                .login-icon {
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

                .login-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .login-subtitle {
                    opacity: 0.9;
                    font-size: 1rem;
                }

                .login-form {
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

                .code-input {
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 600;
                    letter-spacing: 0.5rem;
                    font-family: 'Courier New', monospace;
                }

                .form-help {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    text-align: center;
                }

                .error-text {
                    display: block;
                    color: var(--error-color);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }

                .login-footer {
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

                .btn-outline {
                    background: transparent;
                    color: var(--text-secondary);
                    border: 1px solid var(--border-color);
                }

                .btn-outline:hover {
                    background: var(--background-hover);
                    color: var(--text-primary);
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
                    .login-page {
                        padding: 1rem;
                    }

                    .login-container {
                        margin: 0;
                    }

                    .login-form {
                        padding: 1.5rem;
                    }

                    .login-header {
                        padding: 1.5rem;
                    }

                    .login-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;