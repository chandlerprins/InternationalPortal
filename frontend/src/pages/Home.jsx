import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Secure International Payments Portal</h1>
                    <p>Fast, secure, and reliable international money transfers with real-time exchange rates</p>

                    <div className="hero-buttons">
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
                <div className="hero-visual">
                    <div className="floating-card">
                        <div className="card-icon">💳</div>
                        <div className="card-text">Secure Payments</div>
                    </div>
                    <div className="floating-card">
                        <div className="card-icon">🌍</div>
                        <div className="card-text">Global Transfers</div>
                    </div>
                    <div className="floating-card">
                        <div className="card-icon">⚡</div>
                        <div className="card-text">Instant Processing</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2>Why Choose Our Platform?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Bank-Level Security</h3>
                            <p>Advanced encryption and multi-factor authentication protect your transactions</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💱</div>
                            <h3>Real-Time Rates</h3>
                            <p>Get the best exchange rates with live market data and competitive fees</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock customer support in multiple languages</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>Fast Transfers</h3>
                            <p>Send money internationally in minutes, not days</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Send Money Internationally?</h2>
                        <p>Join thousands of satisfied customers who trust us with their international payments</p>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn btn-primary btn-large">
                                Get Started Today
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <style jsx>{`
                .home-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, var(--background-color) 0%, #f8fafc 100%);
                }

                .hero {
                    display: flex;
                    align-items: center;
                    min-height: 80vh;
                    padding: 4rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    gap: 4rem;
                }

                .hero-content {
                    flex: 1;
                    text-align: center;
                }

                .hero h1 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    line-height: 1.1;
                }

                .hero p {
                    font-size: 1.25rem;
                    color: var(--text-secondary);
                    margin-bottom: 2.5rem;
                    line-height: 1.6;
                }

                .hero-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .hero-visual {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    align-items: center;
                }

                .floating-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    min-width: 250px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .floating-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                }

                .card-icon {
                    font-size: 2rem;
                }

                .card-text {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .features {
                    padding: 6rem 2rem;
                    background: white;
                }

                .features h2 {
                    text-align: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 3rem;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .feature-card {
                    background: var(--card-background);
                    padding: 2.5rem;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border-color);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
                }

                .feature-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                }

                .feature-card h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .feature-card p {
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .cta {
                    padding: 6rem 2rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
                    color: white;
                }

                .cta-content {
                    text-align: center;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .cta h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                .cta p {
                    font-size: 1.25rem;
                    margin-bottom: 2.5rem;
                    opacity: 0.9;
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
                    background: transparent;
                    color: var(--text-primary);
                    border: 2px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--background-color);
                    transform: translateY(-2px);
                }

                .btn-large {
                    padding: 1.25rem 3rem;
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .hero {
                        flex-direction: column;
                        text-align: center;
                        padding: 2rem 1rem;
                        gap: 2rem;
                    }

                    .hero h1 {
                        font-size: 2.5rem;
                    }

                    .hero p {
                        font-size: 1.1rem;
                    }

                    .hero-buttons {
                        flex-direction: column;
                        align-items: center;
                    }

                    .floating-card {
                        min-width: 200px;
                    }

                    .features {
                        padding: 4rem 1rem;
                    }

                    .features h2 {
                        font-size: 2rem;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .feature-card {
                        padding: 2rem;
                    }

                    .cta {
                        padding: 4rem 1rem;
                    }

                    .cta h2 {
                        font-size: 2rem;
                    }

                    .cta p {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
