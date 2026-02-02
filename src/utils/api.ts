import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // Important for sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};

        // Get CSRF token from cookie
        const csrfToken = Cookies.get('XSRF-TOKEN');

        // Get JWT token from localStorage
        const token = localStorage.getItem('token');

        // Add CSRF token to headers if it exists
        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
        }

        // If data is FormData, let the browser set the Content-Type header with the boundary
        // If data is FormData, let the browser set the Content-Type header with the boundary
        if (config.data instanceof FormData) {
            if (config.headers && typeof (config.headers as any).delete === 'function') {
                (config.headers as any).delete('Content-Type');
                console.log('API Interceptor: Removed Content-Type for FormData using .delete()');
            } else if (config.headers) {
                delete config.headers['Content-Type'];
                console.log('API Interceptor: Removed Content-Type for FormData using delete operator');
            }
        }

        // Add Authorization header if token exists
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // For non-GET requests, add _csrf field to the request body if it's form data
        if (config.method !== 'get' && config.data && !(config.data instanceof FormData)) {
            config.data = {
                ...config.data,
                _csrf: csrfToken
            };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                await axios.get('/api/v1/users/refresh-token', {
                    withCredentials: true
                });

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                const isAdmin = window.location.pathname.startsWith('/admin');
                window.location.href = isAdmin ? '/admin/login' : '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
