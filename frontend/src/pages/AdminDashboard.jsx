import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../services/apiService.js';

const AdminDashboard = () => {
    const { user, userRole, logout } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        accountNumber: '',
        password: '',
        fullName: '',
        email: ''
    });

    useEffect(() => {
        if (userRole === 'admin') {
            loadEmployees();
        }
    }, [userRole]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiService.getEmployees();
            if (response.success) {
                setEmployees(response.data.data.employees || []);
            } else {
                setError('Failed to load employees');
            }
        } catch (err) {
            setError('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            const response = await apiService.createEmployee(newEmployee);
            if (response.success) {
                setNewEmployee({ accountNumber: '', password: '', fullName: '', email: '' });
                setShowCreateForm(false);
                loadEmployees(); // Refresh list
            } else {
                setError('Failed to create employee');
            }
        } catch (err) {
            setError('Failed to create employee');
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }
        try {
            const response = await apiService.deleteEmployee(employeeId);
            if (response.success) {
                loadEmployees(); // Refresh list
            } else {
                setError('Failed to delete employee');
            }
        } catch (err) {
            setError('Failed to delete employee');
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    if (userRole !== 'admin') {
        return (
            <div className="dashboard-container">
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, {user?.fullName || 'Administrator'}</p>
                <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                    Log Off
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}

            {/* Create Employee Section */}
            <div className="section">
                <div className="section-header">
                    <h2>Employee Management</h2>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn btn-primary"
                    >
                        {showCreateForm ? 'Cancel' : 'Create New Employee'}
                    </button>
                </div>

                {showCreateForm && (
                    <form onSubmit={handleCreateEmployee} className="create-form">
                        <div className="form-group">
                            <label>Account Number:</label>
                            <input
                                type="text"
                                value={newEmployee.accountNumber}
                                onChange={(e) => setNewEmployee({...newEmployee, accountNumber: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="password"
                                value={newEmployee.password}
                                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Full Name:</label>
                            <input
                                type="text"
                                value={newEmployee.fullName}
                                onChange={(e) => setNewEmployee({...newEmployee, fullName: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-success">
                            Create Employee
                        </button>
                    </form>
                )}
            </div>

            {/* Employees List Section */}
            <div className="section">
                <h2>Employee Accounts</h2>
                {employees.length === 0 ? (
                    <p className="no-data">No employees found.</p>
                ) : (
                    <div className="employees-list">
                        {employees.map((employee) => (
                            <div key={employee.id || employee.accountNumber} className="employee-card">
                                <div className="employee-info">
                                    <h3>{employee.fullName}</h3>
                                    <p><strong>Account Number:</strong> {employee.accountNumber}</p>
                                    <p><strong>Role:</strong> {employee.role}</p>
                                    <p><strong>Created:</strong> {new Date(employee.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="employee-actions">
                                    <button
                                        onClick={() => handleDeleteEmployee(employee.id)}
                                        className="btn btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .dashboard-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    padding-top: 100px;
                }

                .dashboard-header {
                    position: relative;
                    margin-bottom: 2rem;
                }

                .dashboard-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .dashboard-header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .logout-btn {
                    position: absolute;
                    top: 0;
                    right: 0;
                }

                .section {
                    background: var(--card-background);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border-color);
                    margin-bottom: 2rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .section h2 {
                    font-size: 1.75rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                    border-bottom: 2px solid var(--primary-color);
                    padding-bottom: 0.5rem;
                }

                .create-form {
                    background: var(--background);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-top: 1rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .form-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 1rem;
                    background: var(--background);
                    color: var(--text-primary);
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .no-data {
                    text-align: center;
                    color: var(--text-secondary);
                    font-style: italic;
                    padding: 2rem;
                }

                .employees-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .employee-card {
                    background: var(--background);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .employee-info {
                    flex: 1;
                }

                .employee-info h3 {
                    margin: 0 0 1rem 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                }

                .employee-info p {
                    margin: 0.25rem 0;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .employee-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-shrink: 0;
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

                .access-denied {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .access-denied h2 {
                    color: var(--error-color);
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .access-denied p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 1rem;
                        padding-top: 80px;
                    }

                    .section {
                        padding: 1.5rem;
                    }

                    .section-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .employee-card {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .employee-actions {
                        justify-content: center;
                    }

                    .create-form {
                        padding: 1rem;
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

export default AdminDashboard;
