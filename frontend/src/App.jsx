import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Payments from './pages/Payments.jsx';
import History from './pages/History.jsx';
import Security from './pages/Security.jsx';
import EmployeeLogin from './pages/EmployeeLogin.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import PaymentManagement from './pages/PaymentManagement.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/payment-history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/security" element={
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route path="/employee/dashboard" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/payments" element={
              <ProtectedRoute requiredRole="employee">
                <PaymentManagement />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;