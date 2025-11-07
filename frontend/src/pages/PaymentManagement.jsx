import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../services/apiService.js';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const response = await apiService.getEmployeePayments();

            if (response.success) {
                setPayments(response.data.data?.payments || []);
            } else {
                setError(response.message || 'Failed to load payments');
            }
        } catch (err) {
            setError('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (paymentId) => {
        try {
            setActionLoading(paymentId);
            const response = await apiService.verifyPayment(paymentId);

            if (response.success) {
                // Update payment status locally
                setPayments(prev => prev.map(payment =>
                    payment._id === paymentId
                        ? { ...payment, status: 'verified' }
                        : payment
                ));
            } else {
                setError(response.message || 'Failed to verify payment');
            }
        } catch (err) {
            setError('Failed to verify payment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendPayment = async (paymentId) => {
        try {
            setActionLoading(paymentId);
            const response = await apiService.sendPayment(paymentId);

            if (response.success) {
                // Update payment status locally
                setPayments(prev => prev.map(payment =>
                    payment._id === paymentId
                        ? { ...payment, status: 'sent' }
                        : payment
                ));
            } else {
                setError(response.message || 'Failed to send payment');
            }
        } catch (err) {
            setError('Failed to send payment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDenyPayment = async (paymentId) => {
        try {
            setActionLoading(paymentId);
            const response = await apiService.denyPayment(paymentId);

            if (response.success) {
                // Update payment status locally
                setPayments(prev => prev.map(payment =>
                    payment._id === paymentId
                        ? { ...payment, status: 'denied' }
                        : payment
                ));
            } else {
                setError(response.message || 'Failed to deny payment');
            }
        } catch (err) {
            setError('Failed to deny payment');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'verified': return '#10b981';
            case 'sent': return '#3b82f6';
            case 'denied': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '';
            case 'verified': return '';
            case 'sent': return '';
            case 'denied': return '';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="payment-management-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading payments...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-management-page">
            <div className="container">
                <div className="page-header">
                    <h1>Payment Management</h1>
                    <p>Review and process customer payment requests</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')} className="alert-close">×</button>
                    </div>
                )}

                <div className="payments-section">
                    <div className="section-header">
                        <h2>All Payments ({payments.length})</h2>
                        <button onClick={loadPayments} className="btn btn-secondary">
                            Refresh
                        </button>
                    </div>

                    {payments.length === 0 ? (
                        <div className="empty-state">
                            <h3>No payments found</h3>
                            <p>All customer payments have been processed.</p>
                        </div>
                    ) : (
                        <div className="payments-grid">
                            {payments.map(payment => (
                                <div key={payment._id} className="payment-card">
                                    <div className="payment-header">
                                        <div className="payment-id">
                                            Payment #{payment._id.slice(-8)}
                                        </div>
                                        <div
                                            className="payment-status"
                                            style={{ backgroundColor: getStatusColor(payment.status) }}
                                        >
                                            {getStatusIcon(payment.status)} {payment.status}
                                        </div>
                                    </div>

                                    <div className="payment-details">
                                        <div className="detail-row">
                                            <span className="label">Amount:</span>
                                            <span className="value">
                                                {payment.amount} {payment.fromCurrency}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">From:</span>
                                            <span className="value">
                                                {payment.fromCurrency} → {payment.toCurrency}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Customer:</span>
                                            <span className="value">
                                                {payment.customerId?.slice(-8) || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Date:</span>
                                            <span className="value">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {payment.recipientDetails && (
                                            <div className="detail-row">
                                                <span className="label">Recipient:</span>
                                                <span className="value">
                                                    {payment.recipientDetails.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="payment-actions">
                                        {payment.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleVerifyPayment(payment._id)}
                                                    className="btn btn-success"
                                                    disabled={actionLoading === payment._id}
                                                >
                                                    {actionLoading === payment._id ? (
                                                        <>
                                                            <div className="loading-spinner small"></div>
                                                            Verifying...
                                                        </>
                                                    ) : (
                                                        'Verify Payment'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDenyPayment(payment._id)}
                                                    className="btn btn-danger"
                                                    disabled={actionLoading === payment._id}
                                                >
                                                    {actionLoading === payment._id ? (
                                                        <>
                                                            <div className="loading-spinner small"></div>
                                                            Denying...
                                                        </>
                                                    ) : (
                                                        'Deny Payment'
                                                    )}
                                                </button>
                                            </>
                                        )}

                                        {payment.status === 'verified' && (
                                            <button
                                                onClick={() => handleSendPayment(payment._id)}
                                                className="btn btn-primary"
                                                disabled={actionLoading === payment._id}
                                            >
                                                {actionLoading === payment._id ? (
                                                    <>
                                                        <div className="loading-spinner small"></div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Send Payment'
                                                )}
                                            </button>
                                        )}

                                        {payment.status === 'sent' && (
                                            <div className="status-completed">
                                                Payment completed successfully
                                            </div>
                                        )}

                                        {payment.status === 'denied' && (
                                            <div className="status-denied">
                                                Payment denied
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .payment-management-page {
                    padding: 2rem 0;
                    min-height: 100vh;
                    background: var(--background);
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .page-header p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                }

                .alert {
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .alert-error {
                    background: #fef2f2;
                    color: var(--error-color);
                    border: 1px solid #fecaca;
                }

                .alert-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--error-color);
                    padding: 0;
                    margin-left: 1rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .section-header h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .payments-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .payment-card {
                    background: var(--card-background);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border-color);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .payment-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                .payment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .payment-id {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 1.1rem;
                }

                .payment-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .payment-details {
                    margin-bottom: 1.5rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .label {
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .value {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .payment-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    flex: 1;
                    justify-content: center;
                }

                .btn-success {
                    background: #10b981;
                    color: white;
                }

                .btn-success:hover {
                    background: #059669;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: var(--primary-hover);
                }

                .btn-secondary {
                    background: var(--background-hover);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--card-background);
                }

                .btn-danger {
                    background: #ef4444;
                    color: white;
                }

                .btn-danger:hover {
                    background: #dc2626;
                }

                .status-completed {
                    color: #10b981;
                    font-weight: 600;
                    text-align: center;
                    padding: 0.5rem;
                    background: #f0fdf4;
                    border-radius: 6px;
                    border: 1px solid #bbf7d0;
                    flex: 1;
                }

                .status-denied {
                    color: #ef4444;
                    font-weight: 600;
                    text-align: center;
                    padding: 0.5rem;
                    background: #fef2f2;
                    border-radius: 6px;
                    border: 1px solid #fecaca;
                    flex: 1;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    gap: 1rem;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border-color);
                    border-top: 4px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .loading-spinner.small {
                    width: 20px;
                    height: 20px;
                    border-width: 2px;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--card-background);
                    border-radius: 12px;
                    border: 2px dashed var(--border-color);
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: var(--text-secondary);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .payment-management-page {
                        padding: 1rem 0;
                    }

                    .page-header h1 {
                        font-size: 2rem;
                    }

                    .section-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }

                    .payments-grid {
                        grid-template-columns: 1fr;
                    }

                    .payment-card {
                        padding: 1rem;
                    }

                    .payment-actions {
                        flex-direction: column;
                    }

                    .btn {
                        padding: 0.75rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentManagement;
