import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/auth';
import { 
    CloseIcon, 
    EyeIcon, 
    EyeOffIcon, 
    ErrorIcon,
    LockIcon,
    CheckIcon,
    EmailIcon
} from './icons/index';
import Button from './ui/Button';

// Email validation regex
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Format email input (lowercase, trim)
const formatEmail = (email) => {
    return email.toLowerCase().trim();
};

// Format username (lowercase, trim, remove spaces)
const formatUsername = (username) => {
    return username.toLowerCase().trim().replace(/\s/g, '');
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
};

function AuthModal({ isOpen, onClose, message = "Please login to continue" }) {
    const [mode, setMode] = useState('login'); // 'login', 'register', or 'forgot'
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        usernameOrEmail: '',
        password: '',
        password_confirm: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    
    const { login, register } = useAuth();

    // Reset form when modal opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                username: '',
                email: '',
                usernameOrEmail: '',
                password: '',
                password_confirm: ''
            });
            setError('');
            setErrors({});
            setSuccessMessage('');
            setShowPassword(false);
            setShowConfirmPassword(false);
            setResetEmail('');
            setResetSuccess(false);
        }
    }, [isOpen, mode]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        // Format email fields
        if (name === 'email' || (name === 'usernameOrEmail' && value.includes('@'))) {
            formattedValue = formatEmail(value);
        }
        
        // Format username
        if (name === 'username') {
            formattedValue = formatUsername(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        setError('');
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
        
        // Real-time email validation
        if (name === 'email' && formattedValue.length > 3 && !isValidEmail(formattedValue)) {
            setErrors(prev => ({
                ...prev,
                email: 'Please enter a valid email address'
            }));
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        
        const formattedEmail = formatEmail(resetEmail);
        if (!formattedEmail || !isValidEmail(formattedEmail)) {
            setError('Please enter a valid email address');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await authAPI.resetPassword(formattedEmail);
            if (result.success) {
                setResetSuccess(true);
            } else {
                setError(result.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        }
        
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.usernameOrEmail || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        
        // Validate email format if it looks like an email
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
            onClose();
        } else {
            // Provide more helpful error messages
            let errorMessage = result.message;
            if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (errorMessage.includes('Email not confirmed')) {
                errorMessage = 'Please verify your email before logging in.';
            }
            setError(errorMessage);
        }
        
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validate
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Passwords do not match';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        const result = await register(formData);
        
        if (result.success) {
            if (result.needsEmailVerification) {
                // Show success message for email verification
                setSuccessMessage(result.message || 'Account created! Please check your email to verify your account.');
            } else {
                onClose();
            }
        } else {
            if (typeof result.errors === 'object') {
                setErrors(result.errors);
                if (result.errors.general) {
                    setError(result.errors.general);
                }
            } else {
                setError(result.errors || 'Registration failed');
            }
        }
        
        setLoading(false);
    };

    const getInputClassName = (fieldName) => {
        const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none";
        return errors[fieldName] 
            ? `${baseClass} border-error-300 bg-error-50` 
            : `${baseClass} border-secondary-300`;
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="relative w-full max-w-md bg-gray-50 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                        >
                            <CloseIcon size={20} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
                                {mode === 'forgot' ? (
                                    <EmailIcon size={28} className="text-primary-600" />
                                ) : (
                                    <LockIcon size={28} className="text-primary-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-secondary-900">
                                {mode === 'login' ? 'Sign In Required' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                            </h2>
                            <p className="text-secondary-500 mt-1 text-sm">
                                {mode === 'forgot' ? 'Enter your email to receive a reset link' : message}
                            </p>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"
                            >
                                <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                                <p className="text-xs text-green-600 mt-1">You can close this and login after verifying.</p>
                            </motion.div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-error-50 border border-error-200 rounded-xl flex items-center gap-2"
                            >
                                <ErrorIcon size={18} className="text-error-600 flex-shrink-0" />
                                <p className="text-sm text-error-700">{error}</p>
                            </motion.div>
                        )}

                        {/* Forgot Password Form */}
                        {mode === 'forgot' && (
                            <div>
                                {resetSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-4"
                                    >
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-success-100 rounded-full mb-4">
                                            <CheckIcon size={28} className="text-success-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Check Your Email</h3>
                                        <p className="text-secondary-600 text-sm mb-4">
                                            We've sent a password reset link to <strong>{resetEmail}</strong>
                                        </p>
                                        <Button variant="outline" onClick={() => setMode('login')} className="w-full">
                                            Back to Login
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={resetEmail}
                                                    onChange={(e) => setResetEmail(formatEmail(e.target.value))}
                                                    className="w-full px-4 py-3 pl-11 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                                    placeholder="Enter your email"
                                                />
                                                <EmailIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
                                            </div>
                                        </div>
                                        
                                        <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
                                            Send Reset Link
                                        </Button>
                                        
                                        <button
                                            type="button"
                                            onClick={() => setMode('login')}
                                            className="w-full text-center text-sm text-secondary-600 hover:text-primary-600 transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Login Form */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                        Username or Email
                                    </label>
                                    <input
                                        type="text"
                                        name="usernameOrEmail"
                                        value={formData.usernameOrEmail}
                                        onChange={handleChange}
                                        className={getInputClassName('usernameOrEmail')}
                                        placeholder="Enter username or email"
                                    />
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-secondary-700">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot')}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`${getInputClassName('password')} pr-12`}
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                        >
                                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-3"
                                    loading={loading}
                                >
                                    Sign In
                                </Button>
                            </form>
                        )}

                        {/* Register Form */}
                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={getInputClassName('name')}
                                        placeholder="Enter your name"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={getInputClassName('username')}
                                        placeholder="Choose a username"
                                    />
                                    {errors.username && <p className="mt-1 text-xs text-error-600">{errors.username}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={getInputClassName('email')}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`${getInputClassName('password')} pr-12`}
                                            placeholder="Create a password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400"
                                        >
                                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-error-600">{errors.password}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="password_confirm"
                                            value={formData.password_confirm}
                                            onChange={handleChange}
                                            className={`${getInputClassName('password_confirm')} pr-12`}
                                            placeholder="Confirm password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400"
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                    {errors.password_confirm && <p className="mt-1 text-xs text-error-600">{errors.password_confirm}</p>}
                                </div>
                                
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-3 mt-4"
                                    loading={loading}
                                >
                                    Create Account
                                </Button>
                            </form>
                        )}

                        {/* Toggle Mode */}
                        <div className="mt-4 text-center text-sm">
                            {mode === 'login' ? (
                                <p className="text-secondary-600">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setMode('register')}
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Create one
                                    </button>
                                </p>
                            ) : (
                                <p className="text-secondary-600">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setMode('login')}
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default AuthModal;
