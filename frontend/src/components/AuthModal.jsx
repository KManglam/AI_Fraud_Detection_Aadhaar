import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
    CloseIcon, 
    EyeIcon, 
    EyeOffIcon, 
    ErrorIcon,
    LockIcon
} from './icons/index';
import Button from './ui/Button';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
};

function AuthModal({ isOpen, onClose, message = "Please login to continue" }) {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
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
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [isOpen, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.usernameOrEmail || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        
        const result = await login(formData.usernameOrEmail, formData.password);
        
        if (result.success) {
            onClose();
        } else {
            setError(result.message);
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
        
        const result = await register(formData);
        
        if (result.success) {
            onClose();
        } else {
            if (typeof result.errors === 'object') {
                setErrors(result.errors);
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
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
                                <LockIcon size={28} className="text-primary-600" />
                            </div>
                            <h2 className="text-xl font-bold text-secondary-900">
                                {mode === 'login' ? 'Sign In Required' : 'Create Account'}
                            </h2>
                            <p className="text-secondary-500 mt-1 text-sm">{message}</p>
                        </div>

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
                                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                        Password
                                    </label>
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
        </AnimatePresence>
    );
}

export default AuthModal;
