import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../services/apiService.js';

const EmployeeDashboard = () => {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            // Load pending payments
            const pendingResponse = await apiService.getPendingPayments();
            if (pendingResponse.success) {
                setPendingPayments(pendingResponse.data.payments || []);
            } else {
                setError('Failed to load pending payments');
            }

            // Load payment history
            const historyResponse = await apiService.getPaymentHistory();
            if (historyResponse.success) {
                setPaymentHistory(historyResponse.data.payments || []);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId) => {
        try {
            const response = await apiService.verifyPayment(paymentId);
            if (response.success) {
                loadData(); // Refresh data
            } else {
                setError('Failed to approve payment');
            }
        } catch (err) {
            setError('Failed to approve payment');
        }
    };

    const handleDeny = async (paymentId) => {
        try {
            const response = await apiService.denyPayment(paymentId);
            if (response.success) {
                loadData(); // Refresh data
            } else {
                setError('Failed to deny payment');
            }
        } catch (err) {
            setError('Failed to deny payment');
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="alert alert-error">
                        {error}
                    </div>
                    <button onClick={loadData} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Employee Dashboard</h1>
                    <p>Welcome back, {user?.uid || 'Employee'}</p>
                    <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                        Log Off
                    </button>
                </div>

                {/* Pending Payments Section */}
                <div className="section">
                    <h2>Pending Payments</h2>
                    {pendingPayments.length === 0 ? (
                        <p className="no-data">No pending payments to review.</p>
                    ) : (
                        <div className="payments-list">
                            {pendingPayments.map((payment) => (
                                <div key={payment._id} className="payment-card">
                                    <div className="payment-info">
                                        <h3>Payment ID: {payment._id}</h3>
                                        <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
                                        <p><strong>Payee:</strong> {payment.payeeName}</p>
                                        <p><strong>SWIFT:</strong> {payment.swift}</p>
                                        <p><strong>Reference:</strong> {payment.reference}</p>
                                        <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="payment-actions">
                                        <button
                                            onClick={() => handleApprove(payment._id)}
                                            className="btn btn-success"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDeny(payment._id)}
                                            className="btn btn-danger"
                                        >
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payment History Section */}
                <div className="section">
                    <h2>Payment History</h2>
                    {paymentHistory.length === 0 ? (
                        <p className="no-data">No payment history available.</p>
                    ) : (
                        <div className="payments-list">
                            {paymentHistory.map((payment) => (
                                <div key={payment._id} className="payment-card history-card">
                                    <div className="payment-info">
                                        <h3>Payment ID: {payment._id}</h3>
                                        <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
                                        <p><strong>Payee:</strong> {payment.payeeName}</p>
                                        <p><strong>SWIFT:</strong> {payment.swift}</p>
                                        <p><strong>Reference:</strong> {payment.reference}</p>
                                        <p><strong>Status:</strong> <span className={`status ${payment.status.toLowerCase()}`}>{payment.status}</span></p>
                                        <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
                                        {payment.updatedAt && (
                                            <p><strong>Processed:</strong> {new Date(payment.updatedAt).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .dashboard-page {
                    padding: 2rem 0;
                    min-height: 100vh;
                    background: var(--background);
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .dashboard-header {
                    position: relative;
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .dashboard-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .dashboard-header p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                }

                .logout-btn {
                    position: absolute;
                    top: 0;
                    right: 0;
                }

                .section {
                    margin-bottom: 3rem;
                    background: var(--card-background);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border-color);
                }

                .section h2 {
                    font-size: 1.75rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid var(--primary-color);
                    padding-bottom: 0.5rem;
                }

                .no-data {
                    text-align: center;
                    color: var(--text-secondary);
                    font-style: italic;
                    padding: 2rem;
                }

                .payments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .payment-card {
                    background: var(--background);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .payment-card.history-card {
                    opacity: 0.8;
                }

                .payment-info {
                    flex: 1;
                }

                .payment-info h3 {
                    margin: 0 0 1rem 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                }

                .payment-info p {
                    margin: 0.25rem 0;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .payment-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }

                .status {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status.approved {
                    background: #d1fae5;
                    color: #065f46;
                }

                .status.denied {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .status.pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                }

                .btn-success {
                    background: #10b981;
                    color: white;
                }

                .btn-success:hover {
                    background: #059669;
                    transform: translateY(-1px);
                }

                .btn-danger {
                    background: #ef4444;
                    color: white;
                }

                .btn-danger:hover {
                    background: #dc2626;
                    transform: translateY(-1px);
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: var(--background-hover);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--card-background);
                    border-color: var(--primary-color);
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

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .alert-error {
                    background: #fef2f2;
                    color: var(--error-color);
                    border: 1px solid #fecaca;
                }

                @media (max-width: 768px) {
                    .dashboard-page {
                        padding: 1rem 0;
                    }

                    .dashboard-header h1 {
                        font-size: 2rem;
                    }

                    .section {
                        padding: 1.5rem;
                    }

                    .payment-card {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .payment-actions {
                        justify-content: center;
                    }

                    .logout-btn {
                        position: static;
                        margin-top: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
