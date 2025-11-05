import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Enable cookies for authentication
  timeout: 10000, // 10 second timeout for banking security
  // HTTPS configuration for secure communication
  httpsAgent: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser handle HTTPS
});

// Request interceptor for adding CSRF tokens and logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Log API requests for debugging
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add CSRF token to non-GET requests (except login/register)
    if (config.method !== 'get') {
      const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Get CSRF token from cookie
        const csrfToken = getCookie('csrf_token');
        if (csrfToken) {
          config.headers['x-csrf-token'] = csrfToken;
          console.log(`[API] Adding CSRF token to ${config.method?.toUpperCase()} request`);
        } else {
          console.warn(`[API] No CSRF token found for ${config.method?.toUpperCase()} request to ${config.url}`);
        }
      }
    }
    
    // Add timestamp for request tracking
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Response interceptor for error handling and logging
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    
    return response;
  },
  (error) => {
    // Log error responses
    const status = error.response?.status || 'Network Error';
    const method = error.config?.method?.toUpperCase() || 'Unknown';
    const url = error.config?.url || 'Unknown';
    
    console.error(`[API] ${status} ${method} ${url}:`, error.response?.data?.message || error.message);
    
    // Handle specific banking API errors
    if (error.response?.status === 401) {
      console.warn('[AUTH] Authentication required - redirecting to login');
      // Could dispatch logout action here if needed
    }
    
    if (error.response?.status === 403) {
      console.warn('[SECURITY] CSRF token invalid or missing');
    }
    
    if (error.response?.status === 429) {
      console.warn('[SECURITY] Rate limit exceeded');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;   