import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    ShieldIcon, 
    TargetIcon, 
    RocketIcon, 
    LightbulbIcon,
    CheckIcon,
    ArrowRightIcon,
    LogoIcon,
    UploadIcon,
    ScanIcon,
    BrainIcon,
    VerificationIcon,
    LockIcon,
    ClockIcon,
    UsersIcon,
    StarIcon,
    ChartIcon,
    DocumentIcon
} from '../components/icons/index';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

// Floating animation for decorative elements
const floatAnimation = {
    y: [0, -15, 0],
    transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

// Hero Section
function HeroSection({ isAuthenticated }) {
    return (
        <motion.section 
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div variants={itemVariants} className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        <ShieldIcon size={16} />
                        Powered by Advanced AI Technology
                    </span>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center mb-8">
                    <motion.div animate={floatAnimation}>
                        <LogoIcon size={100} />
                    </motion.div>
                </motion.div>

                <motion.h1 
                    variants={itemVariants}
                    className="text-5xl md:text-7xl font-bold text-secondary-900 mb-6 leading-tight"
                >
                    Verify Aadhaar Cards
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                        Instantly & Securely
                    </span>
                </motion.h1>

                <motion.p 
                    variants={itemVariants}
                    className="text-xl md:text-2xl text-secondary-600 mb-10 max-w-3xl mx-auto leading-relaxed"
                >
                    India's most trusted AI-powered document verification system. 
                    Detect forged documents, extract data accurately, and secure your identity verification process.
                </motion.p>

                <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap justify-center gap-4 mb-16"
                >
                    <Link to={isAuthenticated ? "/" : "/register"}>
                        <Button variant="primary" size="xl" icon={ArrowRightIcon} iconPosition="right">
                            {isAuthenticated ? "Go to Dashboard" : "Start Free Verification"}
                        </Button>
                    </Link>
                    <Link to="/documentation">
                        <Button variant="outline" size="xl">
                            View Documentation
                        </Button>
                    </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap justify-center items-center gap-8 text-secondary-500"
                >
                    <div className="flex items-center gap-2">
                        <CheckIcon size={20} className="text-success-500" />
                        <span>99.2% Accuracy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LockIcon size={20} className="text-primary-500" />
                        <span>Bank-Level Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon size={20} className="text-warning-500" />
                        <span>Results in Seconds</span>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-secondary-300 rounded-full flex justify-center">
                    <motion.div 
                        className="w-1.5 h-3 bg-secondary-400 rounded-full mt-2"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </motion.section>
    );
}

// Stats Section
function StatsSection() {
    const stats = [
        { value: '99.2%', label: 'Detection Accuracy', icon: TargetIcon },
        { value: '<2s', label: 'Processing Time', icon: ClockIcon },
        { value: '50K+', label: 'Documents Verified', icon: DocumentIcon },
        { value: '24/7', label: 'System Availability', icon: ShieldIcon },
    ];

    return (
        <motion.section 
            className="py-16 bg-gradient-to-r from-primary-600 to-primary-800"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={index}
                            variants={itemVariants}
                            className="text-center group"
                        >
                            <div className="flex justify-center mb-3">
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                    <stat.icon size={28} className="text-white" />
                                </div>
                            </div>
                            <p className="text-4xl md:text-5xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-primary-100 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

// How It Works Section
function HowItWorksSection() {
    const steps = [
        {
            icon: UploadIcon,
            title: 'Upload Document',
            description: 'Simply drag and drop or select your Aadhaar card image. We support all major image formats.',
            color: 'primary'
        },
        {
            icon: ScanIcon,
            title: 'AI Analysis',
            description: 'Our advanced YOLO-based AI model scans and analyzes every aspect of the document.',
            color: 'warning'
        },
        {
            icon: BrainIcon,
            title: 'Fraud Detection',
            description: 'Deep learning algorithms check for tampering, forgery, and data inconsistencies.',
            color: 'error'
        },
        {
            icon: VerificationIcon,
            title: 'Get Results',
            description: 'Receive detailed verification reports with confidence scores and extracted data.',
            color: 'success'
        }
    ];

    const colorClasses = {
        primary: 'bg-primary-100 text-primary-600 border-primary-200',
        success: 'bg-success-100 text-success-600 border-success-200',
        warning: 'bg-warning-100 text-warning-600 border-warning-200',
        error: 'bg-error-100 text-error-600 border-error-200',
    };

    return (
        <motion.section 
            className="py-24 bg-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-4">
                        Simple Process
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                        Verify any Aadhaar card in four simple steps with our state-of-the-art AI technology
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-warning-200 via-error-200 to-success-200 transform -translate-y-1/2 z-0" />

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="relative"
                            >
                                <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-lg hover:shadow-xl transition-shadow text-center">
                                    <div className={`w-16 h-16 rounded-2xl ${colorClasses[step.color]} border-2 flex items-center justify-center mx-auto mb-4`}>
                                        <step.icon size={32} />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">{step.title}</h3>
                                    <p className="text-secondary-600 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

// Features Section
function FeaturesSection() {
    const features = [
        {
            icon: ShieldIcon,
            title: 'Advanced Fraud Detection',
            description: 'Our YOLO-based deep learning model is trained on thousands of documents to detect even the most sophisticated forgeries and tampering attempts.',
            highlights: ['Detects image manipulation', 'Identifies forged text', 'Validates security features']
        },
        {
            icon: LightbulbIcon,
            title: 'Smart OCR Extraction',
            description: 'Automatically extract and validate key information from Aadhaar cards with high precision using our custom-trained OCR engine.',
            highlights: ['Name extraction', 'Aadhaar number validation', 'Address parsing']
        },
        {
            icon: RocketIcon,
            title: 'Lightning Fast Processing',
            description: 'Get verification results in under 2 seconds. Our optimized GPU-powered pipeline ensures rapid document analysis without compromising accuracy.',
            highlights: ['Real-time processing', 'Batch upload support', 'Instant results']
        },
        {
            icon: LockIcon,
            title: 'Enterprise Security',
            description: 'Bank-grade encryption and security protocols ensure your documents and data are always protected. We never store your original documents.',
            highlights: ['End-to-end encryption', 'GDPR compliant', 'Auto data deletion']
        }
    ];

    return (
        <motion.section 
            className="py-24 bg-secondary-50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-success-50 text-success-600 rounded-full text-sm font-medium mb-4">
                        Powerful Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                        Why Choose AadhaarAuth?
                    </h2>
                    <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                        Built with cutting-edge technology to provide the most reliable document verification
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                        >
                            <Card hover className="h-full">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-3 bg-primary-100 rounded-xl">
                                        <feature.icon size={28} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                                        <p className="text-secondary-600 mb-4 leading-relaxed">{feature.description}</p>
                                        <ul className="space-y-2">
                                            {feature.highlights.map((highlight, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-secondary-700">
                                                    <CheckIcon size={16} className="text-success-500" />
                                                    {highlight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

// Use Cases Section
function UseCasesSection() {
    const useCases = [
        {
            icon: UsersIcon,
            title: 'Banks & NBFCs',
            description: 'Streamline KYC verification for loan applications and account openings.'
        },
        {
            icon: ChartIcon,
            title: 'Fintech Companies',
            description: 'Integrate seamless identity verification into your digital onboarding flow.'
        },
        {
            icon: ShieldIcon,
            title: 'Government Agencies',
            description: 'Verify citizen identities for welfare schemes and service delivery.'
        },
        {
            icon: DocumentIcon,
            title: 'Insurance Companies',
            description: 'Authenticate customer documents during policy issuance and claims.'
        },
        {
            icon: LockIcon,
            title: 'HR & Recruitment',
            description: 'Verify candidate identities during background checks and onboarding.'
        },
        {
            icon: RocketIcon,
            title: 'E-commerce Platforms',
            description: 'Authenticate sellers and high-value buyers on your marketplace.'
        }
    ];

    return (
        <motion.section 
            className="py-24 bg-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-warning-50 text-warning-600 rounded-full text-sm font-medium mb-4">
                        Industry Solutions
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                        Trusted Across Industries
                    </h2>
                    <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                        From startups to enterprises, organizations trust AadhaarAuth for their verification needs
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                        >
                            <Card hover className="h-full text-center">
                                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                                    <useCase.icon size={28} className="text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{useCase.title}</h3>
                                <p className="text-secondary-600 text-sm">{useCase.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

// Testimonials Section
function TestimonialsSection() {
    const testimonials = [
        {
            quote: "AadhaarAuth has reduced our document verification time by 90%. The accuracy is remarkable and our fraud cases have dropped significantly.",
            author: "Rajesh Kumar",
            role: "Head of Operations, Leading NBFC",
            rating: 5
        },
        {
            quote: "The API integration was seamless and the support team was incredibly helpful. We've processed over 10,000 verifications without any issues.",
            author: "Priya Sharma",
            role: "CTO, Fintech Startup",
            rating: 5
        },
        {
            quote: "Finally, a verification system that actually works! The fraud detection capabilities have saved us from multiple potential fraudulent claims.",
            author: "Amit Patel",
            role: "Risk Manager, Insurance Company",
            rating: 5
        }
    ];

    return (
        <motion.section 
            className="py-24 bg-gradient-to-br from-secondary-800 to-secondary-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-white/10 text-primary-300 rounded-full text-sm font-medium mb-4">
                        Customer Reviews
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Join thousands of satisfied organizations using AadhaarAuth
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <StarIcon key={i} size={20} className="text-warning-400" />
                                ))}
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                            <div>
                                <p className="font-semibold text-white">{testimonial.author}</p>
                                <p className="text-sm text-gray-400">{testimonial.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

// CTA Section
function CTASection({ isAuthenticated }) {
    return (
        <motion.section 
            className="py-24 bg-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div variants={fadeInUp}>
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 shadow-2xl">
                        <div className="flex justify-center mb-6">
                            <motion.div 
                                className="p-4 bg-white/20 rounded-2xl"
                                animate={floatAnimation}
                            >
                                <LogoIcon size={64} />
                            </motion.div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Secure Your Verification Process?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                            Start verifying Aadhaar cards in minutes. No credit card required for your first verification.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to={isAuthenticated ? "/" : "/register"}>
                                <Button 
                                    variant="secondary" 
                                    size="xl" 
                                    icon={ArrowRightIcon} 
                                    iconPosition="right"
                                    className="bg-white text-primary-600 hover:bg-gray-100"
                                >
                                    {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                                </Button>
                            </Link>
                            <Link to="/about">
                                <Button 
                                    variant="ghost" 
                                    size="xl"
                                    className="text-white hover:bg-white/10"
                                >
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}

// Developer Section
function DeveloperSection() {
    return (
        <motion.section 
            className="py-16 bg-secondary-50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div variants={itemVariants}>
                    <p className="text-primary-600 text-sm uppercase tracking-wider mb-2 font-semibold">
                        Developed By
                    </p>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">Kumar Manglam</h2>
                    <p className="text-secondary-600 mb-6 max-w-lg mx-auto">
                        A passionate developer building innovative AI solutions for identity verification and document security.
                    </p>
                    <a href="https://www.linkedin.com/in/kumar-manglam18/" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            Connect on LinkedIn
                        </Button>
                    </a>
                </motion.div>
            </div>
        </motion.section>
    );
}

// Main Landing Page Component
function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="overflow-hidden">
            <HeroSection isAuthenticated={isAuthenticated} />
            <StatsSection />
            <HowItWorksSection />
            <FeaturesSection />
            <UseCasesSection />
            <TestimonialsSection />
            <CTASection isAuthenticated={isAuthenticated} />
            <DeveloperSection />
        </div>
    );
}

export default LandingPage;
