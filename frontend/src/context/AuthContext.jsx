import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState(null);
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState(null);

    // Check authentication status on app load
    useEffect(() => {
        console.log('[AuthContext] Initializing auth check...');
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        console.log('[AuthContext] Checking authentication status...');
        try {
            const response = await apiService.get('/auth/security-status');
            console.log('[AuthContext] Auth check response:', response);
            
            if (response.success && response.data.authenticated) {
                console.log('[AuthContext] User authenticated:', response.data.user);
                setIsAuthenticated(true);
                setUser({ uid: response.data.user });
            } else {
                console.log('[AuthContext] User not authenticated');
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            // User not authenticated or API not available, which is fine
            console.log('[AuthContext] Auth check failed:', error.message || error);
            console.log('[AuthContext] Full error:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            console.log('[AuthContext] Setting loading to false');
            setLoading(false);
        }
    };

    const login = async (accountNumber, password) => {
        try {
            console.log('[AuthContext] Attempting login...');
            const response = await apiService.post('/auth/login', {
                accountNumber,
                password
            });

            console.log('[AuthContext] Login response:', response);

            if (!response.success) {
                return { success: false, message: response.message || 'Login failed' };
            }

            const data = response.data;

            // Check if 2FA is required
            if (data.requiresTwoFactor) {
                setRequires2FA(true);
                setTempToken(data.tempToken);
                return { requires2FA: true };
            }

            // Regular login success
            console.log('[AuthContext] Setting authenticated state...');
            setIsAuthenticated(true);
            setUser(data.user);
            setCsrfToken(data.csrfToken);
            setRequires2FA(false);
            setTempToken(null);

            console.log('[AuthContext] Login successful, isAuthenticated set to true');
            return { success: true, message: data.message };
        } catch (error) {
            console.error('[AuthContext] Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, message };
        }
    };

    const skipTwoFA = async () => {
        try {
            // For testing: Skip 2FA and set basic authenticated state
            setIsAuthenticated(true);
            setUser({ uid: 'test-user' }); // Basic user object
            setRequires2FA(false);
            setTempToken(null);
            
            return { success: true, message: 'Authentication bypassed for testing' };
        } catch (error) {
            console.error('[AuthContext] Skip 2FA error:', error);
            return { success: false, message: 'Failed to skip 2FA' };
        }
    };

    const verify2FA = async (code) => {
        try {
            const response = await apiService.post('/auth/verify-2fa', {
                tempToken,
                code
            });

            const data = response.data;
            setIsAuthenticated(true);
            setUser(data.user);
            setCsrfToken(data.csrfToken);
            setRequires2FA(false);
            setTempToken(null);

            return { success: true, message: data.message };
        } catch (error) {
            const message = error.response?.data?.message || '2FA verification failed';
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            console.log('[AuthContext] Attempting registration with data:', userData);
            const response = await apiService.post('/auth/register', userData);
            console.log('[AuthContext] Registration response:', response);
            
            if (response.success) {
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('[AuthContext] Registration error:', error);
            return { success: false, message: 'Registration failed. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            await apiService.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setCsrfToken(null);
            setRequires2FA(false);
            setTempToken(null);
        }
    };

    const setup2FA = async () => {
        try {
            const response = await apiService.post('/auth/2fa-setup', {}, {
                headers: {
                    'x-csrf-token': csrfToken
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || '2FA setup failed';
            return { success: false, message };
        }
    };

    const disable2FA = async () => {
        try {
            const response = await apiService.post('/auth/2fa-disable', {}, {
                headers: {
                    'x-csrf-token': csrfToken
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to disable 2FA';
            return { success: false, message };
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        csrfToken,
        requires2FA,
        login,
        verify2FA,
        skipTwoFA,
        register,
        logout,
        setup2FA,
        disable2FA,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
