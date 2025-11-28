import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

const authAxios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
authAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    /**
     * Register a new user
     * @param {Object} userData - { username, email, name, password, password_confirm }
     */
    register: async (userData) => {
        const response = await authAxios.post('/register/', userData);
        return response.data;
    },

    /**
     * Login user with username/email and password
     * @param {string} usernameOrEmail 
     * @param {string} password 
     */
    login: async (usernameOrEmail, password) => {
        const response = await authAxios.post('/login/', {
            username_or_email: usernameOrEmail,
            password: password
        });
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        const response = await authAxios.post('/logout/');
        return response.data;
    },

    /**
     * Refresh access token
     * @param {string} refreshToken 
     */
    refreshToken: async (refreshToken) => {
        const response = await authAxios.post('/refresh/', {
            refresh_token: refreshToken
        });
        return response.data;
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        const response = await authAxios.get('/me/');
        return response.data;
    },

    /**
     * Update user profile
     * @param {Object} profileData 
     */
    updateProfile: async (profileData) => {
        const response = await authAxios.put('/profile/', profileData);
        return response.data;
    },

    /**
     * Change user password
     * @param {Object} passwordData - { old_password, new_password, new_password_confirm }
     */
    changePassword: async (passwordData) => {
        const response = await authAxios.post('/change-password/', passwordData);
        return response.data;
    }
};

export default authAPI;
