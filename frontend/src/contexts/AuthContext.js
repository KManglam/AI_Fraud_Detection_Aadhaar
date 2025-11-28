import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    if (response.success) {
                        setUser(response.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (usernameOrEmail, password) => {
        try {
            const response = await authAPI.login(usernameOrEmail, password);
            if (response.success) {
                localStorage.setItem('access_token', response.tokens.access_token);
                localStorage.setItem('refresh_token', response.tokens.refresh_token);
                setUser(response.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const response = await authAPI.register(userData);
            if (response.success) {
                localStorage.setItem('access_token', response.tokens.access_token);
                localStorage.setItem('refresh_token', response.tokens.refresh_token);
                setUser(response.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, errors: response.errors || 'Registration failed' };
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                errors: error.response?.data?.errors || { general: 'Registration failed. Please try again.' }
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const refreshTokenValue = localStorage.getItem('refresh_token');
            if (!refreshTokenValue) {
                throw new Error('No refresh token');
            }
            const response = await authAPI.refreshToken(refreshTokenValue);
            if (response.success) {
                localStorage.setItem('access_token', response.tokens.access_token);
                localStorage.setItem('refresh_token', response.tokens.refresh_token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    }, [logout]);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
