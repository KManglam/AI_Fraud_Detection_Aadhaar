import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/auth';
import { LogoIcon, EyeIcon, EyeOffIcon, ErrorIcon, CheckIcon, EmailIcon } from '../components/icons/index';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Email validation regex
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Format email input (lowercase, trim)
const formatEmail = (email) => {
    return email.toLowerCase().trim();
};

function Login() {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState('');
    
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from === '/login' ? '/' : from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        // Format email if the field contains @
        if (name === 'usernameOrEmail' && value.includes('@')) {
            formattedValue = formatEmail(value);
            // Validate email format
            if (value.length > 3 && !isValidEmail(formattedValue)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
        } else {
            setEmailError('');
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        setError('');
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        
        if (!resetEmail) {
            setResetError('Please enter your email address');
            return;
        }
        
        const formattedEmail = formatEmail(resetEmail);
        if (!isValidEmail(formattedEmail)) {
            setResetError('Please enter a valid email address');
            return;
        }
        
        setResetLoading(true);
        
        try {
            const result = await authAPI.resetPassword(formattedEmail);
            if (result.success) {
                setResetSuccess(true);
            } else {
                setResetError(result.message || 'Failed to send reset email');
            }
        } catch (err) {
            setResetError('Failed to send reset email. Please try again.');
        }
        
        setResetLoading(false);
    };

    const handleBackToLogin = () => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetError('');
        setResetSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.usernameOrEmail || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        
        // Format and validate email if it looks like an email
        let loginId = formData.usernameOrEmail;
        if (loginId.includes('@')) {
            loginId = formatEmail(loginId);
            if (!isValidEmail(loginId)) {
                setError('Please enter a valid email address');
                return;
            }
        }
        
        setLoading(true);
        
        const result = await login(loginId, formData.password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            // Provide more helpful error messages
            let errorMessage = result.message;
            if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (errorMessage.includes('Email not confirmed')) {
                errorMessage = 'Please verify your email before logging in. Check your inbox for a verification link.';
            }
            setError(errorMessage);
        }
        
        setLoading(false);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-[80vh] flex items-center justify-center px-4"
        >
            <motion.div variants={itemVariants} className="w-full max-w-md">
                <Card className="p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <LogoIcon size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900">Welcome Back</h1>
                        <p className="text-secondary-500 mt-1">Sign in to your AadhaarAuth account</p>
                    </div>
                    
                    {/* Forgot Password View */}
                    {showForgotPassword ? (
                        <div>
                            {resetSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-4"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                                        <CheckIcon size={32} className="text-success-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">Check Your Email</h3>
                                    <p className="text-secondary-600 mb-6">
                                        We've sent a password reset link to <strong>{resetEmail}</strong>. 
                                        Please check your inbox and spam folder.
                                    </p>
                                    <Button variant="outline" onClick={handleBackToLogin} className="w-full">
                                        Back to Login
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-5">
                                    <p className="text-secondary-600 text-sm mb-4">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                    
                                    {resetError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-error-50 border border-error-200 rounded-xl flex items-center gap-3"
                                        >
                                            <ErrorIcon size={18} className="text-error-600 flex-shrink-0" />
                                            <p className="text-sm text-error-700">{resetError}</p>
                                        </motion.div>
                                    )}
                                    
                                    <div>
                                        <label htmlFor="resetEmail" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="resetEmail"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(formatEmail(e.target.value))}
                                                className="w-full px-4 py-3 pl-11 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                                placeholder="Enter your email"
                                            />
                                            <EmailIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
                                        </div>
                                    </div>
                                    
                                    <Button type="submit" variant="primary" className="w-full py-3" loading={resetLoading}>
                                        Send Reset Link
                                    </Button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        className="w-full text-center text-sm text-secondary-600 hover:text-primary-600 transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <>
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-start gap-3"
                        >
                            <ErrorIcon size={20} className="text-error-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-error-700">{error}</p>
                        </motion.div>
                    )}
                    
                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username/Email Field */}
                        <div>
                            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                id="usernameOrEmail"
                                name="usernameOrEmail"
                                value={formData.usernameOrEmail}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                placeholder="Enter your username or email"
                                autoComplete="username"
                            />
                        </div>
                        
                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                                >
                                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3"
                            loading={loading}
                            disabled={!!emailError}
                        >
                            Sign In
                        </Button>
                    </form>
                    
                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-secondary-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                        </>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default Login;
