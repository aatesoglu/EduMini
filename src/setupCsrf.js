import axios from 'axios';
import Cookies from 'js-cookie';

const setupCsrf = async () => {
    try {
        // First, try to get CSRF token from cookie
        let csrfToken = Cookies.get('XSRF-TOKEN');
        
        // If no token exists, fetch a new one from the server
        if (!csrfToken) {
            const response = await axios.get('/api/v1/auth/csrf-token', {
                withCredentials: true
            });
            
            if (response.data.csrfToken) {
                csrfToken = response.data.csrfToken;
                // Set the token in cookies for future requests
                Cookies.set('XSRF-TOKEN', csrfToken, {
                    expires: 1, // 1 day
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }
        }
        
        // Set the token in axios default headers
        if (csrfToken) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        }
        
        return csrfToken;
    } catch (error) {
        console.error('Error setting up CSRF token:', error);
        return null;
    }
};

export default setupCsrf;
