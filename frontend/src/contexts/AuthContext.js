import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, supabaseAuthAPI } from '../services/auth';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

// Use Supabase Auth
const USE_SUPABASE = true;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Listen for Supabase auth state changes
    useEffect(() => {
        if (!USE_SUPABASE) {
            // Legacy auth initialization
            const initLegacyAuth = async () => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        const response = await authAPI.getMe();
                        if (response.success) {
                            setUser(response.user);
                            setIsAuthenticated(true);
                        } else {
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
            initLegacyAuth();
            return;
        }

        // Supabase auth initialization
        const initSupabaseAuth = async () => {
            try {
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.name || '',
                        username: session.user.email?.split('@')[0] || '',
                    });
                    setIsAuthenticated(true);
                    localStorage.setItem('access_token', session.access_token);
                    localStorage.setItem('refresh_token', session.refresh_token);
                }
            } catch (error) {
                console.error('Supabase auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        initSupabaseAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.name || '',
                        username: session.user.email?.split('@')[0] || '',
                    });
                    setIsAuthenticated(true);
                    localStorage.setItem('access_token', session.access_token);
                    localStorage.setItem('refresh_token', session.refresh_token);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setIsAuthenticated(false);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    localStorage.setItem('access_token', session.access_token);
                    localStorage.setItem('refresh_token', session.refresh_token);
                }
            }
        );

        // Cleanup subscription
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const login = useCallback(async (emailOrUsername, password) => {
        try {
            const response = await authAPI.login(emailOrUsername, password);
            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Login failed. Please try again.' 
            };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const response = await authAPI.register(userData);
            if (response.success) {
                // Check if email verification is needed
                if (response.needsEmailVerification) {
                    return { 
                        success: true, 
                        needsEmailVerification: true,
                        message: response.message 
                    };
                }
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
            const response = await authAPI.refreshToken();
            if (response.success) {
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
