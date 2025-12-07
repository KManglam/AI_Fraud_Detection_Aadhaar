import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/auth';
import { LogoIcon, EyeIcon, EyeOffIcon, ErrorIcon, CheckIcon, EmailIcon, AadhaarLogo, ShieldIcon, VerificationIcon } from '../components/icons/index';
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

// Decorative Side Panel Component
const DecorativePanel = () => (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-green-500 relative overflow-hidden">
        {/* 3D Wave SVG Background */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 800">
            <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {/* Back wave - green */}
            <path d="M-50,600 Q100,500 200,550 T400,450 L400,800 L-50,800 Z" fill="url(#wave1)" />
            {/* Middle wave - orange */}
            <path d="M-50,650 Q150,550 250,620 T450,520 L450,800 L-50,800 Z" fill="url(#wave2)" />
            {/* Front wave - white highlight */}
            <path d="M-50,700 Q100,620 200,680 T400,600 L400,800 L-50,800 Z" fill="url(#wave3)" />
            {/* Top decorative curve */}
            <path d="M400,0 Q350,100 400,200 L400,0 Z" fill="url(#wave1)" />
            <path d="M0,0 Q80,150 0,300 L0,0 Z" fill="url(#wave2)" />
        </svg>
        
        {/* Floating orbs for depth */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-green-300/20 rounded-full blur-xl" />
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-orange-200/20 rounded-full blur-lg" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8">
            {/* Combined Card Container with glass effect */}
            <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative"
                style={{ perspective: '1000px' }}
            >
                {/* Stats Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 mb-3 w-56 transform hover:scale-105 transition-transform duration-300">
                    <p className="text-orange-500 text-xs font-semibold mb-1">Verifications</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">10,247</p>
                    <div className="flex items-center gap-2">
                        <svg className="flex-1 h-8" viewBox="0 0 200 50">
                            <path d="M0,40 Q30,35 50,25 T100,30 T150,15 T200,25" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                            <path d="M0,45 Q40,40 70,35 T130,40 T180,30 T200,35" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        </svg>
                        <span className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                </div>
                
                {/* Connector element */}
                <div className="absolute left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-white/80 to-white/40 rounded-full" />
                
                {/* Security Info Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 w-56 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex flex-col gap-0.5">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full" />
                            <div className="w-1.5 h-3 bg-gradient-to-b from-orange-400 to-orange-300 rounded-full" />
                            <div className="w-1.5 h-2 bg-orange-200 rounded-full" />
                        </div>
                        <div className="flex-1">
                            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-1.5 w-fit mb-2">
                                <VerificationIcon size={14} className="text-orange-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-0.5">Your data, secured</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Bank-grade encryption protects your identity.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* Floating Badges with 3D effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                className="absolute top-16 right-10 bg-white rounded-full p-3 shadow-xl ring-4 ring-white/30"
            >
                <AadhaarLogo size={28} />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
                className="absolute bottom-24 right-14 bg-white rounded-full p-2.5 shadow-xl ring-4 ring-white/30"
            >
                <ShieldIcon size={20} className="text-green-600" />
            </motion.div>
        </div>
    </div>
);

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
        <div className="min-h-screen flex">
            {/* Left Side - Login Form */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white"
            >
                <motion.div variants={itemVariants} className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <AadhaarLogo size={56} />
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
                                                className="w-full px-4 py-3 pl-11 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
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
                                        className="w-full text-center text-sm text-secondary-600 hover:text-orange-600 transition-colors"
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
                                className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
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
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
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
                                    className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
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
                                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
            
            {/* Right Side - Decorative Panel */}
            <DecorativePanel />
        </div>
    );
}

export default Login;
