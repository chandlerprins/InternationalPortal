import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to access your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="container">
                <div className="welcome-section">
                    <h1>Welcome to the secure money portal: {user?.name || user?.accountNumber}</h1>
                    
                    <div className="action-buttons">
                        <Link to="/payments" className="btn btn-primary">
                            Send Money
                        </Link>
                        <Link to="/history" className="btn btn-secondary">
                            Transaction History
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard {
                    min-height: calc(100vh - 80px);
                    background: var(--background-color);
                    padding: 2rem 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-required {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-secondary);
                }

                .welcome-section {
                    text-align: center;
                    background: var(--card-background);
                    padding: 3rem;
                    border-radius: 12px;
                    box-shadow: var(--shadow-md);
                    max-width: 500px;
                    width: 100%;
                }

                .welcome-section h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 2rem;
                }

                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                }

                .btn {
                    display: inline-block;
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    text-align: center;
                    transition: all 0.3s ease;
                    min-width: 200px;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: var(--background-light);
                    color: var(--text-primary);
                    border: 2px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--background-color);
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .dashboard {
                        padding: 1rem;
                    }

                    .welcome-section {
                        padding: 2rem;
                    }

                    .welcome-section h1 {
                        font-size: 1.5rem;
                    }

                    .action-buttons {
                        gap: 0.75rem;
                    }

                    .btn {
                        min-width: 180px;
                        padding: 0.875rem 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;