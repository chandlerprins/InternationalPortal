import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/apiService.js';

const Security = () => {
    const { isAuthenticated, setup2FA, disable2FA } = useAuth();
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchSecurityStatus();
        }
    }, [isAuthenticated]);

    const fetchSecurityStatus = async () => {
        try {
            const response = await apiService.getSecurityStatus();
            if (response.success) {
                setTwoFAEnabled(response.data.twoFactorEnabled);
            }
        } catch (error) {
            console.error('Error fetching security status:', error);
        }
    };

    const handleToggle2FA = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');
            
            if (twoFAEnabled) {
                // Disable 2FA
                if (!window.confirm('Are you sure you want to disable email-based two-factor authentication?')) {
                    setIsLoading(false);
                    return;
                }
                
                const response = await disable2FA();
                if (response.success) {
                    setTwoFAEnabled(false);
                    setSuccess('Email-based two-factor authentication disabled successfully');
                } else {
                    setError(response.message || 'Failed to disable 2FA');
                }
            } else {
                // Enable 2FA
                const response = await setup2FA();
                if (response.success) {
                    setTwoFAEnabled(true);
                    setSuccess('Email-based two-factor authentication enabled successfully');
                } else {
                    setError(response.message || 'Failed to enable 2FA');
                }
            }
        } catch (error) {
            setError('Failed to update 2FA settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to access security settings.</p>
            </div>
        );
    }

    return (
        <div className="security">
            <div className="container">
                <h1>Security</h1>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="security-option">
                    <div className="option-info">
                        <h3>Email-Based Two-Factor Authentication</h3>
                        <p>Receive a 6-digit verification code via email when logging in</p>
                        <p className="status">
                            Status: <span className={twoFAEnabled ? 'enabled' : 'disabled'}>
                                {twoFAEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleToggle2FA}
                        className={`btn ${twoFAEnabled ? 'btn-danger' : 'btn-primary'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .security {
                    min-height: calc(100vh - 80px);
                    background: var(--background-color);
                    padding: 2rem 0;
                }

                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                }

                .alert-error {
                    background: #fee2e2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }

                .alert-success {
                    background: #dcfce7;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }

                .auth-required {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-secondary);
                }

                .security-option {
                    background: var(--card-background);
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                }

                .option-info {
                    flex: 1;
                }

                .option-info h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .option-info p {
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .status {
                    font-weight: 600;
                }

                .enabled {
                    color: #166534;
                }

                .disabled {
                    color: #dc2626;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 120px;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                }

                .btn-danger {
                    background: #dc2626;
                    color: white;
                }

                .btn-danger:hover {
                    background: #b91c1c;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .security {
                        padding: 1rem 0;
                    }

                    h1 {
                        font-size: 1.5rem;
                    }

                    .security-option {
                        flex-direction: column;
                        text-align: center;
                        gap: 1.5rem;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Security;
