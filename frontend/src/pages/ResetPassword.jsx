import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { LogoIcon, EyeIcon, EyeOffIcon, ErrorIcon, CheckIcon, LockIcon } from '../components/icons/index';
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

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validSession, setValidSession] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if we have a session from the URL hash (Supabase auth redirect)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setValidSession(true);
            } else {
                // If no session, check if we have hash parameters
                const hash = location.hash;
                if (hash && hash.includes('access_token')) {
                    setValidSession(true);
                } else {
                    setError('Invalid or expired password reset link.');
                }
            }
        });
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (error) {
            setError(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!validSession && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-secondary-600">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-[80vh] flex items-center justify-center px-4 py-12"
        >
            <motion.div variants={itemVariants} className="w-full max-w-md">
                <Card className="p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <LogoIcon size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900">Reset Password</h1>
                        <p className="text-secondary-500 mt-1">Create a new secure password</p>
                    </div>
                    
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-6">
                                <CheckIcon size={32} className="text-success-600" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-2">Password Reset Successful!</h3>
                            <p className="text-secondary-600 mb-6">
                                Your password has been updated successfully. Redirecting to login...
                            </p>
                            <Button 
                                variant="primary" 
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                Go to Login
                            </Button>
                        </motion.div>
                    ) : (
                        <>
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

                            {validSession && (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                                placeholder="Enter new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                            </button>
                                        </div>
                                        <p className="mt-1.5 text-xs text-secondary-500">
                                            Must be at least 8 characters long
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                            Confirm Password
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full py-3"
                                        loading={loading}
                                    >
                                        Update Password
                                    </Button>
                                </form>
                            )}
                            
                            {!validSession && error && (
                                <div className="text-center mt-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => navigate('/login')}
                                    >
                                        Back to Login
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default ResetPassword;
