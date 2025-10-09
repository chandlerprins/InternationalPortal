import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/apiService.js';

const History = () => {
    const { user, isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchTransactions();
        }
    }, [isAuthenticated]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const response = await apiService.getTransactionHistory();
            
            if (response.success) {
                // The backend returns { success: true, data: { payments: [...], summary: {...} } }
                // and apiService wraps it as { success: true, data: response.data }
                setTransactions(response.data?.data?.payments || []);
            } else {
                setError('Failed to load transaction history');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to load transaction history. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount, currency = 'ZAR') => {
        const locale = currency === 'ZAR' ? 'en-ZA' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to view your transaction history.</p>
            </div>
        );
    }

    return (
        <div className="transaction-history">
            <div className="container">
                <h1>Transaction History</h1>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner large"></div>
                        <p>Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <h3>No transactions found</h3>
                        <p>You haven't made any transfers yet.</p>
                    </div>
                ) : (
                    <div className="transactions-container">
                        <div className="transactions-list">
                            {transactions.map((transaction) => (
                                <div key={transaction._id} className="transaction-card">
                                    <div className="transaction-header">
                                        <h3>To: {transaction.payeeName}</h3>
                                        <span className={`status-badge status-${transaction.status}`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                    
                                    <div className="transaction-details">
                                        <div className="detail-row">
                                            <span>Amount:</span>
                                            <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Date:</span>
                                            <span>{formatDate(transaction.createdAt)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Transaction ID:</span>
                                            <span>{transaction._id}</span>
                                        </div>
                                        {transaction.swift && (
                                            <div className="detail-row">
                                                <span>SWIFT Code:</span>
                                                <span>{transaction.swift}</span>
                                            </div>
                                        )}
                                        {transaction.payeeAccount && (
                                            <div className="detail-row">
                                                <span>Account:</span>
                                                <span>****{transaction.payeeAccount.slice(-4)}</span>
                                            </div>
                                        )}
                                        {transaction.reference && (
                                            <div className="detail-row">
                                                <span>Reference:</span>
                                                <span>{transaction.reference}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .transaction-history {
                    min-height: calc(100vh - 80px);
                    background: var(--background-color);
                    padding: 2rem 0;
                }

                .container {
                    max-width: 800px;
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

                .loading-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--card-background);
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                }

                .empty-state h3 {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .auth-required {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-secondary);
                }

                .transactions-container {
                    background: var(--card-background);
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                }

                .transaction-card {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .transaction-card:last-child {
                    border-bottom: none;
                }

                .transaction-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .transaction-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-sent {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-verified {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .status-pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .transaction-details {
                    display: grid;
                    gap: 0.5rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                }

                .detail-row:last-child {
                    border-bottom: none;
                }

                .detail-row span:first-child {
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .detail-row span:last-child {
                    color: var(--text-primary);
                    font-weight: 600;
                    word-break: break-all;
                }

                @media (max-width: 768px) {
                    .transaction-history {
                        padding: 1rem 0;
                    }

                    h1 {
                        font-size: 1.5rem;
                    }

                    .transaction-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .detail-row {
                        flex-direction: column;
                        gap: 0.25rem;
                    }

                    .detail-row span:last-child {
                        word-break: break-word;
                    }
                }
            `}</style>
        </div>
    );
};

export default History;
