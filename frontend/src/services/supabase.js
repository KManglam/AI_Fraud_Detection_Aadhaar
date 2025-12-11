/**
 * Supabase Client Configuration for Frontend
 * 
 * This provides direct Supabase client access for:
 * - Authentication (sign up, sign in, sign out)
 * - Real-time subscriptions (optional)
 * - Storage access (optional)
 */
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Must match backend configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://czxedufrdwisjolhnidw.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eGVkdWZyZHdpc2pvbGhuaWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTU0NzYsImV4cCI6MjA4MTAzMTQ3Nn0.u9PYP3ElcnaenmHMOIIj3iAdIA66VS4g6PlYUab_edw';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
    },
});

/**
 * Supabase Auth Helper Functions
 */
export const supabaseAuth = {
    /**
     * Sign up a new user
     * @param {string} email 
     * @param {string} password 
     * @param {object} metadata - Optional user metadata (name, etc.)
     */
    signUp: async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign in with email and password
     * @param {string} email 
     * @param {string} password 
     */
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign out the current user
     */
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Get the current session
     */
    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    /**
     * Get the current user
     */
    getUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    /**
     * Refresh the session
     */
    refreshSession: async () => {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return session;
    },

    /**
     * Listen for auth state changes
     * @param {function} callback 
     */
    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    },

    /**
     * Update user data
     * @param {object} updates 
     */
    updateUser: async (updates) => {
        const { data, error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        return data;
    },

    /**
     * Reset password (send reset email)
     * @param {string} email 
     */
    resetPassword: async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return data;
    },
};

export default supabase;
