import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal';
import { 
    LogoIcon,
    AadhaarLogo,
    DashboardIcon, 
    DocumentsIcon, 
    VerificationIcon, 
    DocsIcon, 
    AboutIcon,
    MenuIcon,
    CloseIcon,
    LogoutIcon,
    LoginIcon,
    HomeIcon
} from '../icons/index';

const navItems = [
    { path: '/welcome', label: 'Home', icon: HomeIcon },
    { path: '/', label: 'Dashboard', icon: DashboardIcon, exact: true, protected: true },
    { path: '/documents', label: 'Documents', icon: DocumentsIcon, protected: true },
    { path: '/verification-results', label: 'Verification', icon: VerificationIcon, protected: true },
    { path: '/documentation', label: 'Docs', icon: DocsIcon },
    { path: '/about', label: 'About', icon: AboutIcon },
];

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleNavClick = (e, item) => {
        if (item.protected && !isAuthenticated) {
            e.preventDefault();
            setShowAuthModal(true);
        }
    };

    const handleLogout = async () => {
        await logout();
        setUserMenuOpen(false);
        navigate('/welcome');
    };

    const isActive = (path, exact = false) => {
        if (exact || path === '/') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AadhaarLogo size={40} />
                        </motion.div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                                AadhaarAuth
                            </h1>
                            <p className="text-xs text-secondary-500 -mt-0.5">Verification System</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-orange-50/50 rounded-full px-2 py-1.5 border border-orange-100">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                        transition-all duration-200
                                        ${active 
                                            ? 'text-orange-600 bg-white shadow-sm' 
                                            : 'text-secondary-600 hover:text-secondary-900 hover:bg-orange-50'
                                        }
                                    `}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-full shadow-sm -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary-100 hover:bg-secondary-200 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-medium">
                                        {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-secondary-700 max-w-[100px] truncate">
                                        {user?.name || user?.username}
                                    </span>
                                </button>
                                
                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 z-50"
                                        >
                                            <div className="px-4 py-2 border-b border-secondary-100">
                                                <p className="text-sm font-medium text-secondary-900 truncate">{user?.name}</p>
                                                <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                                            >
                                                <LogoutIcon size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                                >
                                    <LoginIcon size={18} />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full transition-colors shadow-sm"
                                >
                                    <span>Sign Up</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-secondary-200 bg-white"
                    >
                        <nav className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path, item.exact);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={(e) => {
                                            if (item.protected && !isAuthenticated) {
                                                e.preventDefault();
                                                setShowAuthModal(true);
                                            } else {
                                                setMobileMenuOpen(false);
                                            }
                                        }}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                            transition-all duration-200
                                            ${active 
                                                ? 'text-orange-600 bg-orange-50' 
                                                : 'text-secondary-600 hover:bg-orange-50'
                                            }
                                        `}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                            
                            {/* Mobile Auth Section */}
                            <div className="pt-3 mt-3 border-t border-secondary-200">
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-medium">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                                                <p className="text-xs text-secondary-500">{user?.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
                                        >
                                            <LogoutIcon size={20} />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors"
                                        >
                                            <LoginIcon size={20} />
                                            <span>Login</span>
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-2 mx-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-colors"
                                        >
                                            <span>Create Account</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Auth Modal for protected routes */}
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)}
                message="Please login to access this feature"
            />
        </header>
    );
}

export default Header;
