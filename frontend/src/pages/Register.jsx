import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon, EyeIcon, EyeOffIcon, ErrorIcon, CheckIcon, AadhaarLogo, ShieldIcon, UsersIcon, DocumentsIcon } from '../components/icons/index';
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

// Decorative Side Panel Component for Register
const DecorativePanel = () => (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-green-400 to-orange-500 relative overflow-hidden">
        {/* 3D Wave SVG Background */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 800">
            <defs>
                <linearGradient id="regWave1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="regWave2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="regWave3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {/* Back wave - orange */}
            <path d="M450,600 Q300,500 200,550 T0,450 L0,800 L450,800 Z" fill="url(#regWave1)" />
            {/* Middle wave - green */}
            <path d="M450,650 Q250,550 150,620 T-50,520 L-50,800 L450,800 Z" fill="url(#regWave2)" />
            {/* Front wave - white highlight */}
            <path d="M450,700 Q300,620 200,680 T0,600 L0,800 L450,800 Z" fill="url(#regWave3)" />
            {/* Top decorative curve */}
            <path d="M0,0 Q50,100 0,200 L0,0 Z" fill="url(#regWave1)" />
            <path d="M400,0 Q320,150 400,300 L400,0 Z" fill="url(#regWave2)" />
        </svg>
        
        {/* Floating orbs for depth */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-orange-300/20 rounded-full blur-xl" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-200/20 rounded-full blur-lg" />
        
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
                {/* Welcome Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 mb-3 w-56 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <UsersIcon size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Join our community</p>
                            <p className="text-xl font-bold text-gray-900">5,000+</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Trusted users verifying documents daily</p>
                </div>
                
                {/* Connector element */}
                <div className="absolute left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-white/80 to-white/40 rounded-full" />
                
                {/* Features Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 w-56 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex flex-col gap-0.5">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-green-500 to-green-400 rounded-full" />
                            <div className="w-1.5 h-3 bg-gradient-to-b from-green-400 to-green-300 rounded-full" />
                            <div className="w-1.5 h-2 bg-green-200 rounded-full" />
                        </div>
                        <div className="flex-1">
                            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-full p-1.5 w-fit mb-2">
                                <ShieldIcon size={14} className="text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-0.5">Secure & Compliant</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                UIDAI compliant with end-to-end encryption.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* Floating Badges with 3D effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                className="absolute top-16 left-10 bg-white rounded-full p-3 shadow-xl ring-4 ring-white/30"
            >
                <AadhaarLogo size={28} />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
                className="absolute bottom-24 left-14 bg-white rounded-full p-2.5 shadow-xl ring-4 ring-white/30"
            >
                <DocumentsIcon size={20} className="text-orange-500" />
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

// Format username (lowercase, trim, remove spaces)
const formatUsername = (username) => {
    return username.toLowerCase().trim().replace(/\s/g, '');
};

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirm: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from === '/register' ? '/' : from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        // Format email
        if (name === 'email') {
            formattedValue = formatEmail(value);
        }
        
        // Format username (no spaces, lowercase)
        if (name === 'username') {
            formattedValue = formatUsername(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        
        // Clear specific field error and validate in real-time
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

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!formData.password_confirm) {
            newErrors.password_confirm = 'Please confirm your password';
        } else if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        const result = await register(formData);
        
        if (result.success) {
            if (result.needsEmailVerification) {
                setEmailVerificationSent(true);
            } else {
                navigate('/', { replace: true });
            }
        } else {
            if (typeof result.errors === 'object') {
                setErrors(result.errors);
            } else {
                setErrors({ general: result.errors || 'Registration failed' });
            }
        }
        
        setLoading(false);
    };

    const getInputClassName = (fieldName) => {
        const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none";
        return errors[fieldName] 
            ? `${baseClass} border-error-300 bg-error-50` 
            : `${baseClass} border-secondary-300`;
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Decorative Panel */}
            <DecorativePanel />
            
            {/* Right Side - Register Form */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white"
            >
                <motion.div variants={itemVariants} className="w-full max-w-md">
                    {/* Email Verification Success */}
                    {emailVerificationSent ? (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 mb-6">
                                <CheckIcon size={32} className="text-success-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Check Your Email</h2>
                            <p className="text-secondary-600 mb-6">
                                We've sent a verification link to <strong>{formData.email}</strong>. 
                                Please check your inbox and click the link to verify your account.
                            </p>
                            <div className="space-y-3">
                                <Link to="/login">
                                    <Button variant="primary" className="w-full">
                                        Go to Login
                                    </Button>
                                </Link>
                                <p className="text-sm text-secondary-500">
                                    Didn't receive the email? Check your spam folder.
                                </p>
                            </div>
                        </div>
                    ) : (
                    <>
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <AadhaarLogo size={56} />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900">Create Account</h1>
                        <p className="text-secondary-500 mt-1">Join AadhaarAuth verification system</p>
                    </div>
                    
                    {/* General Error Message */}
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-center gap-3"
                        >
                            <ErrorIcon size={20} className="text-error-600 flex-shrink-0" />
                            <p className="text-sm text-error-700">{errors.general}</p>
                        </motion.div>
                    )}
                    
                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={getInputClassName('name')}
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                            )}
                        </div>
                        
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={getInputClassName('username')}
                                placeholder="Choose a username"
                                autoComplete="username"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-error-600">{errors.username}</p>
                            )}
                        </div>
                        
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={getInputClassName('email')}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                            )}
                        </div>
                        
                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`${getInputClassName('password')} pr-12`}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                                >
                                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-error-600">{errors.password}</p>
                            )}
                        </div>
                        
                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="password_confirm" className="block text-sm font-medium text-secondary-700 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="password_confirm"
                                    name="password_confirm"
                                    value={formData.password_confirm}
                                    onChange={handleChange}
                                    className={`${getInputClassName('password_confirm')} pr-12`}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                </button>
                            </div>
                            {errors.password_confirm && (
                                <p className="mt-1 text-sm text-error-600">{errors.password_confirm}</p>
                            )}
                        </div>
                        
                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 mt-6"
                            loading={loading}
                        >
                            Create Account
                        </Button>
                    </form>
                    
                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-secondary-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                    </>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Register;
