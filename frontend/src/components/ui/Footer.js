import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon, EmailIcon, ExternalLinkIcon, AadhaarLogo, TricolorStripe } from '../icons/index';

const quickLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Documents', path: '/documents' },
    { label: 'Verification', path: '/verification-results' },
    { label: 'Documentation', path: '/documentation' },
    { label: 'About', path: '/about' },
];

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-secondary-300 relative overflow-hidden">
            {/* Tricolor accent at top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <AadhaarLogo size={36} />
                            <div>
                                <h3 className="text-lg font-bold text-white">AadhaarAuth System</h3>
                                <p className="text-xs text-secondary-400">Secure Document Verification</p>
                            </div>
                        </div>
                        <p className="text-sm text-secondary-400 leading-relaxed mb-6 max-w-md">
                            A cutting-edge AI-powered Aadhaar card verification system designed to detect 
                            fraudulent documents with high accuracy. Built with advanced machine learning 
                            algorithms for secure and reliable identity verification.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <EmailIcon size={18} className="text-orange-400" />
                            <a 
                                href="mailto:kmglm04718@gmail.com" 
                                className="text-secondary-300 hover:text-white transition-colors"
                            >
                                kmglm04718@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link 
                                        to={link.path}
                                        className="text-sm text-secondary-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-600 group-hover:bg-orange-500 transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vision & Mission */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Our Vision
                        </h4>
                        <p className="text-sm text-secondary-400 leading-relaxed mb-4">
                            To create a secure, fraud-free digital identity ecosystem in India through 
                            innovative technology and AI-driven verification.
                        </p>
                        <Link 
                            to="/about"
                            className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors group"
                        >
                            Learn more about our mission
                            <ExternalLinkIcon size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-secondary-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-secondary-500">
                            © {currentYear} AadhaarAuth System. All rights reserved.
                        </p>
                        <p className="text-sm text-secondary-500">
                            Developed with passion by{' '}
                            <span className="text-orange-400 font-medium">Kumar Manglam</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
