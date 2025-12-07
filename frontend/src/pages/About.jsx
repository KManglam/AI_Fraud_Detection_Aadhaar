import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    ShieldIcon, 
    TargetIcon, 
    RocketIcon, 
    LightbulbIcon,
    UsersIcon,
    CheckIcon,
    ArrowRightIcon,
    LogoIcon,
    AadhaarLogo
} from '../components/icons/index';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color }) {
    const colorClasses = {
        primary: 'bg-orange-100 text-orange-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-amber-100 text-amber-600',
        error: 'bg-red-100 text-red-600',
    };

    return (
        <motion.div variants={itemVariants}>
            <Card hover className="h-full">
                <div className={`w-14 h-14 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
                    <Icon size={28} />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{title}</h3>
                <p className="text-secondary-600 text-sm leading-relaxed">{description}</p>
            </Card>
        </motion.div>
    );
}

// Stat Item Component
function StatItem({ value, label }) {
    return (
        <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-primary-100">{label}</p>
        </div>
    );
}

function About() {
    const features = [
        {
            icon: ShieldIcon,
            title: 'Advanced Fraud Detection',
            description: 'Our AI-powered system uses deep learning algorithms trained on thousands of documents to detect even the most sophisticated forgeries.',
            color: 'primary'
        },
        {
            icon: RocketIcon,
            title: 'Lightning Fast Processing',
            description: 'Get verification results in seconds, not hours. Our optimized pipeline ensures rapid document analysis without compromising accuracy.',
            color: 'success'
        },
        {
            icon: TargetIcon,
            title: 'High Accuracy Rate',
            description: 'Achieve 99%+ accuracy in fraud detection with our continuously improving machine learning models and comprehensive validation checks.',
            color: 'warning'
        },
        {
            icon: LightbulbIcon,
            title: 'Smart OCR Extraction',
            description: 'Automatically extract and validate key information from Aadhaar cards including name, number, address, and date of birth.',
            color: 'error'
        }
    ];

    const benefits = [
        'Reduce manual verification time by 90%',
        'Eliminate human error in document checking',
        'Detect tampered and forged documents instantly',
        'Secure and compliant data handling',
        'Detailed audit trails for all verifications',
        'Batch processing for high-volume needs'
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-16"
        >
            {/* Hero Section */}
            <motion.section variants={itemVariants} className="text-center max-w-4xl mx-auto">
                <div className="flex justify-center mb-6">
                    <AadhaarLogo size={80} />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                    Securing India's Digital Identity
                </h1>
                <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
                    AadhaarAuth System is an AI-powered document verification platform designed to 
                    detect fraudulent Aadhaar cards and ensure authentic identity verification.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/">
                        <Button variant="primary" size="lg" icon={ArrowRightIcon} iconPosition="right">
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/documentation">
                        <Button variant="outline" size="lg">
                            Read Documentation
                        </Button>
                    </Link>
                </div>
            </motion.section>

            {/* Stats Section */}
            <motion.section variants={itemVariants}>
                <Card className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
                        <StatItem value="99.2%" label="Accuracy Rate" />
                        <StatItem value="<2s" label="Processing Time" />
                        <StatItem value="10K+" label="Documents Verified" />
                        <StatItem value="24/7" label="Availability" />
                    </div>
                </Card>
            </motion.section>

            {/* Vision & Mission Section */}
            <motion.section variants={containerVariants} className="grid md:grid-cols-2 gap-8">
                <motion.div variants={itemVariants}>
                    <Card className="h-full bg-orange-50 border-orange-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <TargetIcon size={24} className="text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-secondary-900">Our Vision</h2>
                        </div>
                        <p className="text-secondary-700 leading-relaxed">
                            To create a secure, fraud-free digital identity ecosystem in India where every 
                            citizen's identity is protected and every organization can trust the documents 
                            they receive. We envision a future where identity fraud is eliminated through 
                            the power of artificial intelligence and advanced document analysis.
                        </p>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="h-full bg-success-50 border-success-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-success-100 rounded-xl">
                                <RocketIcon size={24} className="text-success-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-secondary-900">Our Mission</h2>
                        </div>
                        <p className="text-secondary-700 leading-relaxed">
                            To provide accessible, accurate, and instant Aadhaar verification services 
                            that empower businesses and government agencies to make informed decisions. 
                            We are committed to continuously improving our AI models and staying ahead 
                            of fraudsters to protect the integrity of India's identity infrastructure.
                        </p>
                    </Card>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <motion.section variants={containerVariants}>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-secondary-900 mb-3">Why Choose AadhaarAuth?</h2>
                    <p className="text-secondary-600 max-w-2xl mx-auto">
                        Our platform combines cutting-edge AI technology with user-friendly design 
                        to deliver the most reliable document verification solution.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </motion.section>

            {/* Benefits Section */}
            <motion.section variants={itemVariants}>
                <Card>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                                Transform Your Verification Process
                            </h2>
                            <p className="text-secondary-600 mb-6">
                                Join thousands of organizations that have already upgraded their 
                                document verification workflow with AadhaarAuth System.
                            </p>
                            <ul className="space-y-3">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="p-1 bg-success-100 rounded-full mt-0.5">
                                            <CheckIcon size={14} className="text-success-600" />
                                        </div>
                                        <span className="text-secondary-700">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-8 text-center">
                            <UsersIcon size={64} className="text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                                Ready to Get Started?
                            </h3>
                            <p className="text-secondary-600 mb-6">
                                Upload your first document and experience the power of AI verification.
                            </p>
                            <Link to="/">
                                <Button variant="primary" icon={ArrowRightIcon} iconPosition="right">
                                    Start Verifying
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* Developer Section */}
            <motion.section variants={itemVariants} className="text-center">
                <div className="bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-2xl p-8 shadow-lg">
                    <div className="max-w-2xl mx-auto py-4">
                        <p className="text-primary-400 text-sm uppercase tracking-wider mb-2 font-semibold">
                            Developed By
                        </p>
                        <h2 className="text-3xl font-bold text-white mb-4">Kumar Manglam</h2>
                        <p className="text-gray-300 mb-6">
                            A passionate developer dedicated to building innovative solutions 
                            that make a real difference in people's lives. This project represents 
                            the intersection of AI, security, and user experience.
                        </p>
                        <div className="flex justify-center">
                            <a href="https://www.linkedin.com/in/kumar-manglam18/" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-secondary-900">
                                    Connect on LinkedIn
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}

export default About;
