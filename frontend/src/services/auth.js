import axios from 'axios';
import { supabase, supabaseAuth } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/auth` 
  : 'http://127.0.0.1:8000/api/auth';

// Use Supabase Auth by default (set to false for legacy auth)
const USE_SUPABASE_AUTH = true;

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

/**
 * Supabase Auth API - Uses Supabase directly for authentication
 */
export const supabaseAuthAPI = {
    /**
     * Register a new user with Supabase
     * @param {Object} userData - { email, password, name, username }
     */
    register: async (userData) => {
        try {
            const { email, password, name, username } = userData;
            console.log('Registering user with Supabase:', { email, name, username });
            
            const data = await supabaseAuth.signUp(email, password, { 
                name: name || username,
                username: username 
            });
            
            console.log('Supabase signup response:', data);
            
            if (data.user) {
                // Sync user to Django backend with custom username (for username login support)
                try {
                    await authAxios.post('/supabase/sync-user/', {
                        email: email,
                        username: username || email.split('@')[0],
                        name: name || username || '',
                        supabase_id: data.user.id
                    });
                    console.log('User synced to Django backend');
                } catch (syncErr) {
                    console.warn('User sync to backend failed (non-critical):', syncErr);
                    // Continue anyway - user can still login with email
                }
                
                // Check if email confirmation is required
                const needsEmailVerification = !data.session;
                
                // Store tokens if session exists
                if (data.session) {
                    localStorage.setItem('access_token', data.session.access_token);
                    localStorage.setItem('refresh_token', data.session.refresh_token);
                }
                
                return {
                    success: true,
                    message: needsEmailVerification 
                        ? 'Account created! Please check your email to verify your account.' 
                        : 'Registration successful',
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.name || name || '',
                        username: data.user.user_metadata?.username || username || '',
                    },
                    tokens: data.session ? {
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    } : null,
                    needsEmailVerification,
                };
            }
            return { success: false, message: 'Registration failed - no user returned' };
        } catch (error) {
            console.error('Supabase register error:', error);
            // Parse Supabase error message
            let errorMessage = error.message || 'Registration failed';
            if (errorMessage.includes('already registered')) {
                errorMessage = 'This email is already registered. Please login instead.';
            }
            return { 
                success: false, 
                errors: { general: errorMessage }
            };
        }
    },

    /**
     * Login user with Supabase (supports both email and username)
     * @param {string} emailOrUsername - Can be email or username
     * @param {string} password 
     */
    login: async (emailOrUsername, password) => {
        try {
            let email = emailOrUsername;
            
            // If input doesn't contain @, it's a username - fetch email from backend
            if (!emailOrUsername.includes('@')) {
                try {
                    const response = await authAxios.post('/supabase/get-email/', {
                        username: emailOrUsername
                    });
                    
                    if (response.data.success && response.data.email) {
                        email = response.data.email;
                    } else {
                        return { 
                            success: false, 
                            message: 'Invalid username or password'
                        };
                    }
                } catch (err) {
                    console.error('Username lookup error:', err);
                    return { 
                        success: false, 
                        message: 'Invalid username or password'
                    };
                }
            }
            
            const data = await supabaseAuth.signIn(email, password);
            
            if (data.user && data.session) {
                localStorage.setItem('access_token', data.session.access_token);
                localStorage.setItem('refresh_token', data.session.refresh_token);
                
                return {
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.name || '',
                        username: emailOrUsername.includes('@') ? data.user.email?.split('@')[0] : emailOrUsername,
                    },
                    tokens: {
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    },
                };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            console.error('Supabase login error:', error);
            return { 
                success: false, 
                message: error.message || 'Invalid email or password'
            };
        }
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await supabaseAuth.signOut();
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return { success: true, message: 'Logout successful' };
        } catch (error) {
            console.error('Supabase logout error:', error);
            // Clear tokens anyway
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return { success: true, message: 'Logged out' };
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        try {
            const session = await supabaseAuth.refreshSession();
            if (session) {
                localStorage.setItem('access_token', session.access_token);
                localStorage.setItem('refresh_token', session.refresh_token);
                return {
                    success: true,
                    tokens: {
                        access_token: session.access_token,
                        refresh_token: session.refresh_token,
                    },
                };
            }
            return { success: false, message: 'Failed to refresh token' };
        } catch (error) {
            console.error('Supabase refresh error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current user
     */
    getMe: async () => {
        try {
            const user = await supabaseAuth.getUser();
            if (user) {
                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.name || '',
                        username: user.email?.split('@')[0] || '',
                    },
                };
            }
            return { success: false, message: 'Not authenticated' };
        } catch (error) {
            console.error('Supabase getMe error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Update user profile
     * @param {Object} profileData 
     */
    updateProfile: async (profileData) => {
        try {
            const data = await supabaseAuth.updateUser({
                data: profileData,
            });
            return {
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.name || '',
                },
            };
        } catch (error) {
            console.error('Supabase update error:', error);
            return { success: false, errors: { general: error.message } };
        }
    },

    /**
     * Change user password
     * @param {Object} passwordData - { new_password }
     */
    changePassword: async (passwordData) => {
        try {
            await supabaseAuth.updateUser({
                password: passwordData.new_password,
            });
            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            console.error('Supabase password change error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Reset password (send email)
     * @param {string} email 
     */
    resetPassword: async (email) => {
        try {
            await supabaseAuth.resetPassword(email);
            return { success: true, message: 'Password reset email sent' };
        } catch (error) {
            console.error('Supabase reset password error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current session
     */
    getSession: async () => {
        try {
            const session = await supabaseAuth.getSession();
            return session;
        } catch (error) {
            return null;
        }
    },
};

/**
 * Legacy Auth API - Uses Django backend endpoints
 */
export const legacyAuthAPI = {
    register: async (userData) => {
        const response = await authAxios.post('/register/', userData);
        return response.data;
    },

    login: async (usernameOrEmail, password) => {
        const response = await authAxios.post('/login/', {
            username_or_email: usernameOrEmail,
            password: password
        });
        return response.data;
    },

    logout: async () => {
        const response = await authAxios.post('/logout/');
        return response.data;
    },

    refreshToken: async (refreshToken) => {
        const response = await authAxios.post('/refresh/', {
            refresh_token: refreshToken
        });
        return response.data;
    },

    getMe: async () => {
        const response = await authAxios.get('/me/');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await authAxios.put('/profile/', profileData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await authAxios.post('/change-password/', passwordData);
        return response.data;
    }
};

// Export the appropriate auth API based on configuration
export const authAPI = USE_SUPABASE_AUTH ? supabaseAuthAPI : legacyAuthAPI;

export default authAPI;
