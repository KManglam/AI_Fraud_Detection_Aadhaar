import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon, EyeIcon, EyeOffIcon, ErrorIcon } from '../components/icons/index';
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
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear specific field error
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
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
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
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
            navigate('/', { replace: true });
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
        const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none";
        return errors[fieldName] 
            ? `${baseClass} border-error-300 bg-error-50` 
            : `${baseClass} border-secondary-300`;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-[80vh] flex items-center justify-center px-4 py-8"
        >
            <motion.div variants={itemVariants} className="w-full max-w-md">
                <Card className="p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <LogoIcon size={48} />
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
                                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default Register;
