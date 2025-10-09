import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            <div className="container">
                <div className="home-content">
                    <h1>Secure International Payments Portal</h1>
                    
                    <div className="home-buttons">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-secondary">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .home-page {
                    min-height: calc(100vh - 80px);
                    background: var(--background-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 0;
                }

                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .home-content {
                    text-align: center;
                    background: var(--card-background);
                    padding: 3rem;
                    border-radius: 12px;
                    box-shadow: var(--shadow-md);
                }

                h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 2rem;
                    line-height: 1.2;
                }

                .home-buttons {
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
                    .home-page {
                        padding: 1rem;
                    }

                    .home-content {
                        padding: 2rem;
                    }

                    h1 {
                        font-size: 2rem;
                    }

                    .home-buttons {
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

export default Home;
