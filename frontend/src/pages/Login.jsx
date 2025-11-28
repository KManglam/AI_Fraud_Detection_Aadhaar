import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

function Login() {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.usernameOrEmail || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        
        const result = await login(formData.usernameOrEmail, formData.password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
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
                    
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-center gap-3"
                        >
                            <ErrorIcon size={20} className="text-error-600 flex-shrink-0" />
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
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default Login;
