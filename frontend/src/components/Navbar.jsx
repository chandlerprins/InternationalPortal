import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, userRole, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsOpen(false);
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo">
                    <span className="logo-text">International Payments</span>
                </div>

                {/* Desktop Menu */}
                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            {userRole === 'employee' ? (
                                <>
                                    <Link
                                        to="/employee/dashboard"
                                        className={`nav-link ${isActive('/employee/dashboard') ? 'active' : ''}`}
                                    >
                                        Employee Dashboard
                                    </Link>
                                    <Link
                                        to="/employee/payments"
                                        className={`nav-link ${isActive('/employee/payments') ? 'active' : ''}`}
                                    >
                                        Payment Management
                                    </Link>
                                </>
                            ) : userRole === 'admin' ? (
                                <>
                                    <Link
                                        to="/admin/dashboard"
                                        className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                                    >
                                        Admin Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/payments"
                                        className={`nav-link ${isActive('/payments') ? 'active' : ''}`}
                                    >
                                        Send Payment
                                    </Link>
                                    <Link
                                        to="/history"
                                        className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                                    >
                                        Transaction History
                                    </Link>
                                    <Link
                                        to="/security"
                                        className={`nav-link ${isActive('/security') ? 'active' : ''}`}
                                    >
                                        Security
                                    </Link>
                                </>
                            )}
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/login"
                                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                            >
                                Customer Login
                            </Link>
                            <Link
                                to="/employee/login"
                                className={`nav-link ${isActive('/employee/login') ? 'active' : ''}`}
                            >
                                Employee Login
                            </Link>
                            <Link
                                to="/admin/login"
                                className={`nav-link ${isActive('/admin/login') ? 'active' : ''}`}
                            >
                                Admin Login
                            </Link>
                            <Link
                                to="/register"
                                className="nav-link btn btn-primary"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu">
                    <div className="mobile-menu-content">
                        {isAuthenticated ? (
                            <>
                                <div className="mobile-user-info">
                                    <span>Welcome, {user?.fullName || 'User'}</span>
                                </div>
                                {userRole === 'employee' ? (
                                    <>
                                        <Link
                                            to="/employee/dashboard"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Employee Dashboard
                                        </Link>
                                        <Link
                                            to="/employee/payments"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Payment Management
                                        </Link>
                                    </>
                                ) : userRole === 'admin' ? (
                                    <>
                                        <Link
                                            to="/admin/dashboard"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/payments"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Send Payment
                                        </Link>
                                        <Link
                                            to="/history"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Transaction History
                                        </Link>
                                        <Link
                                            to="/security"
                                            className="mobile-nav-link"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Security
                                        </Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/"
                                    className="mobile-nav-link"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/login"
                                    className="mobile-nav-link"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Customer Login
                                </Link>
                                <Link
                                    to="/employee/login"
                                    className="mobile-nav-link"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Employee Login
                                </Link>
                                <Link
                                    to="/admin/login"
                                    className="mobile-nav-link"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Admin Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="mobile-nav-link btn btn-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .navbar {
                    background: var(--card-background);
                    box-shadow: var(--shadow);
                    border-bottom: 1px solid var(--border-color);
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                }

                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 70px;
                }

                .navbar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--primary-color);
                    font-weight: 700;
                    font-size: 1.25rem;
                }

                .logo-text {
                    display: block;
                }

                .navbar-menu {
                    display: none;
                    align-items: center;
                    gap: 1rem;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    text-decoration: none;
                    color: var(--text-secondary);
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    font-weight: 500;
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-size: 0.95rem;
                }

                .nav-link:hover {
                    color: var(--primary-color);
                    background: #f8fafc;
                }

                .nav-link.active {
                    color: var(--primary-color);
                    background: #eff6ff;
                    font-weight: 600;
                }

                .logout-btn {
                    color: var(--error-color) !important;
                }

                .logout-btn:hover {
                    background: #fef2f2 !important;
                }

                .mobile-menu-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: none;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }

                .mobile-menu-btn:hover {
                    background: #f8fafc;
                }

                .mobile-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--card-background);
                    border-bottom: 1px solid var(--border-color);
                    box-shadow: var(--shadow-lg);
                }

                .mobile-menu-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 1rem;
                }

                .mobile-user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    text-decoration: none;
                    color: var(--text-primary);
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    font-weight: 500;
                    border: none;
                    background: none;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                    margin-bottom: 0.5rem;
                    font-size: 1rem;
                }

                .mobile-nav-link:hover {
                    background: #f8fafc;
                    color: var(--primary-color);
                }

                .mobile-nav-link.btn {
                    justify-content: center;
                    margin-top: 1rem;
                }

                @media (min-width: 768px) {
                    .navbar-menu {
                        display: flex;
                    }

                    .mobile-menu-btn {
                        display: none;
                    }

                    .mobile-menu {
                        display: none;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
