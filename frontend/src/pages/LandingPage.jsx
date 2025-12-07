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
    DocumentIcon,
    // Aadhaar themed icons
    AadhaarLogo,
    AadhaarCard3D,
    TricolorStripe,
    FingerprintPattern,
    QRCodePattern
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
            {/* Aadhaar Themed Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-green-50">
                {/* Saffron blob */}
                <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
                {/* White/neutral blob */}
                <div className="absolute top-40 right-20 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
                {/* Green blob */}
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* Fingerprint pattern decorations */}
                <div className="absolute top-20 right-10 opacity-20">
                    <FingerprintPattern width={300} height={300} />
                </div>
                <div className="absolute bottom-10 left-10 opacity-10 rotate-45">
                    <FingerprintPattern width={250} height={250} />
                </div>
            </div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF671F08_1px,transparent_1px),linear-gradient(to_bottom,#046A3808_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="text-center lg:text-left">
                        {/* Tricolor Badge */}
                        <motion.div variants={itemVariants} className="mb-6 flex justify-center lg:justify-start">
                            <span className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm border border-orange-200 text-secondary-700 rounded-full text-sm font-medium shadow-sm">
                                <AadhaarLogo size={24} />
                                AI-Powered Aadhaar Verification
                            </span>
                        </motion.div>

                        {/* Tricolor Stripe */}
                        <motion.div variants={itemVariants} className="mb-6 flex justify-center lg:justify-start">
                            <TricolorStripe width={180} height={20} />
                        </motion.div>

                        <motion.h1 
                            variants={itemVariants}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight"
                        >
                            Verify Aadhaar
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-green-600">
                                Instantly & Securely
                            </span>
                        </motion.h1>

                        <motion.p 
                            variants={itemVariants}
                            className="text-lg md:text-xl text-secondary-600 mb-8 max-w-xl leading-relaxed"
                        >
                            India's most trusted AI-powered document verification system. 
                            Detect forged Aadhaar cards, extract data accurately, and secure your identity verification process.
                        </motion.p>

                        <motion.div 
                            variants={itemVariants}
                            className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
                        >
                            <Link to={isAuthenticated ? "/" : "/register"}>
                                <Button 
                                    variant="primary" 
                                    size="xl" 
                                    icon={ArrowRightIcon} 
                                    iconPosition="right"
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                                >
                                    {isAuthenticated ? "Go to Dashboard" : "Start Free Verification"}
                                </Button>
                            </Link>
                            <Link to="/documentation">
                                <Button variant="outline" size="xl" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                                    View Documentation
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div 
                            variants={itemVariants}
                            className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-secondary-600"
                        >
                            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full">
                                <CheckIcon size={18} className="text-green-600" />
                                <span className="text-sm font-medium">99.2% Accuracy</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full">
                                <LockIcon size={18} className="text-orange-500" />
                                <span className="text-sm font-medium">Bank-Level Security</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full">
                                <ClockIcon size={18} className="text-green-600" />
                                <span className="text-sm font-medium">Results in Seconds</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Aadhaar Card Illustration */}
                    <motion.div 
                        variants={itemVariants}
                        className="flex justify-center lg:justify-end"
                    >
                        <motion.div
                            animate={{ 
                                y: [0, -15, 0],
                                rotate: [0, 1, 0, -1, 0]
                            }}
                            transition={{ 
                                duration: 6, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative"
                        >
                            {/* Glow effect behind card */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 via-white/10 to-green-400/20 rounded-3xl blur-2xl" />
                            
                            {/* Aadhaar Card 3D */}
                            <AadhaarCard3D width={400} height={320} className="relative z-10" />
                            
                            {/* Floating QR Code accent */}
                            <motion.div
                                className="absolute -bottom-4 -left-8 bg-white p-2 rounded-xl shadow-xl"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                            >
                                <QRCodePattern size={48} />
                            </motion.div>
                            
                            {/* Floating verification badge */}
                            <motion.div
                                className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-full shadow-xl"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <CheckIcon size={24} />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-orange-300 rounded-full flex justify-center">
                    <motion.div 
                        className="w-1.5 h-3 bg-orange-400 rounded-full mt-2"
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
            className="py-16 bg-gradient-to-r from-orange-500 via-orange-600 to-green-600 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Decorative fingerprint pattern */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10">
                <FingerprintPattern width={200} height={200} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={index}
                            variants={itemVariants}
                            className="text-center group"
                        >
                            <div className="flex justify-center mb-3">
                                <div className="p-3 bg-white/15 rounded-xl group-hover:bg-white/25 transition-colors backdrop-blur-sm">
                                    <stat.icon size={28} className="text-white" />
                                </div>
                            </div>
                            <p className="text-4xl md:text-5xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-orange-100 text-sm">{stat.label}</p>
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
            title: 'Upload Aadhaar',
            description: 'Simply drag and drop or select your Aadhaar card image. We support all major image formats.',
            color: 'orange'
        },
        {
            icon: ScanIcon,
            title: 'AI Analysis',
            description: 'Our advanced YOLO-based AI model scans and analyzes every aspect of the document.',
            color: 'blue'
        },
        {
            icon: BrainIcon,
            title: 'Fraud Detection',
            description: 'Deep learning algorithms check for tampering, forgery, and data inconsistencies.',
            color: 'red'
        },
        {
            icon: VerificationIcon,
            title: 'Get Results',
            description: 'Receive detailed verification reports with confidence scores and extracted data.',
            color: 'green'
        }
    ];

    const colorClasses = {
        orange: 'bg-orange-100 text-orange-600 border-orange-200',
        blue: 'bg-blue-100 text-blue-600 border-blue-200',
        red: 'bg-red-100 text-red-600 border-red-200',
        green: 'bg-green-100 text-green-600 border-green-200',
    };

    return (
        <motion.section 
            className="py-24 bg-white relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-500" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium mb-4">
                        <AadhaarLogo size={20} />
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
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-300 via-blue-300 via-red-300 to-green-300 transform -translate-y-1/2 z-0" />

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="relative"
                            >
                                <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center">
                                    <div className={`w-16 h-16 rounded-2xl ${colorClasses[step.color]} border-2 flex items-center justify-center mx-auto mb-4`}>
                                        <step.icon size={32} />
                                    </div>
                                    <div className={`absolute -top-3 -right-3 w-8 h-8 ${index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-red-500' : 'bg-green-500'} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md`}>
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
            description: 'Our YOLO-based deep learning model is trained on thousands of Aadhaar documents to detect even the most sophisticated forgeries and tampering attempts.',
            highlights: ['Detects image manipulation', 'Identifies forged text', 'Validates security features'],
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-100'
        },
        {
            icon: LightbulbIcon,
            title: 'Smart OCR Extraction',
            description: 'Automatically extract and validate key information from Aadhaar cards with high precision using our custom-trained OCR engine.',
            highlights: ['Name extraction', 'Aadhaar number validation', 'Address parsing'],
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100'
        },
        {
            icon: RocketIcon,
            title: 'Lightning Fast Processing',
            description: 'Get verification results in under 2 seconds. Our optimized GPU-powered pipeline ensures rapid document analysis without compromising accuracy.',
            highlights: ['Real-time processing', 'Batch upload support', 'Instant results'],
            iconColor: 'text-green-600',
            iconBg: 'bg-green-100'
        },
        {
            icon: LockIcon,
            title: 'Enterprise Security',
            description: 'Bank-grade encryption and security protocols ensure your Aadhaar data is always protected. We never store your original documents.',
            highlights: ['End-to-end encryption', 'UIDAI compliant', 'Auto data deletion'],
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100'
        }
    ];

    return (
        <motion.section 
            className="py-24 bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 opacity-5">
                <FingerprintPattern width={400} height={400} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-4 border border-green-200">
                        <VerificationIcon size={18} />
                        Powerful Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                        Why Choose AadhaarAuth?
                    </h2>
                    <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                        Built with cutting-edge technology to provide the most reliable Aadhaar verification
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                        >
                            <Card hover className="h-full border-l-4 border-l-orange-400">
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 p-3 ${feature.iconBg} rounded-xl`}>
                                        <feature.icon size={28} className={feature.iconColor} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                                        <p className="text-secondary-600 mb-4 leading-relaxed">{feature.description}</p>
                                        <ul className="space-y-2">
                                            {feature.highlights.map((highlight, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-secondary-700">
                                                    <CheckIcon size={16} className="text-green-500" />
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
            description: 'Streamline KYC verification for loan applications and account openings.',
            gradient: 'from-orange-100 to-orange-200',
            iconColor: 'text-orange-600'
        },
        {
            icon: ChartIcon,
            title: 'Fintech Companies',
            description: 'Integrate seamless identity verification into your digital onboarding flow.',
            gradient: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            icon: ShieldIcon,
            title: 'Government Agencies',
            description: 'Verify citizen identities for welfare schemes and service delivery.',
            gradient: 'from-green-100 to-green-200',
            iconColor: 'text-green-600'
        },
        {
            icon: DocumentIcon,
            title: 'Insurance Companies',
            description: 'Authenticate customer documents during policy issuance and claims.',
            gradient: 'from-purple-100 to-purple-200',
            iconColor: 'text-purple-600'
        },
        {
            icon: LockIcon,
            title: 'HR & Recruitment',
            description: 'Verify candidate identities during background checks and onboarding.',
            gradient: 'from-red-100 to-red-200',
            iconColor: 'text-red-600'
        },
        {
            icon: RocketIcon,
            title: 'E-commerce Platforms',
            description: 'Authenticate sellers and high-value buyers on your marketplace.',
            gradient: 'from-teal-100 to-teal-200',
            iconColor: 'text-teal-600'
        }
    ];

    return (
        <motion.section 
            className="py-24 bg-white relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Top border gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium mb-4 border border-orange-200">
                        <UsersIcon size={18} />
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
                            <Card hover className="h-full text-center group">
                                <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <useCase.icon size={28} className={useCase.iconColor} />
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
            className="py-24 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 opacity-5">
                <FingerprintPattern width={200} height={200} />
            </div>
            <div className="absolute bottom-10 right-10 opacity-5">
                <FingerprintPattern width={200} height={200} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium mb-4 border border-orange-500/30">
                        <StarIcon size={16} />
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
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/30 transition-colors"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <StarIcon key={i} size={20} className="text-orange-400" />
                                ))}
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-green-400 flex items-center justify-center text-white font-bold">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{testimonial.author}</p>
                                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                                </div>
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
                    <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                        {/* Decorative fingerprint */}
                        <div className="absolute -right-20 -top-20 opacity-10">
                            <FingerprintPattern width={300} height={300} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-center mb-6">
                                <motion.div 
                                    className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
                                    animate={floatAnimation}
                                >
                                    <AadhaarLogo size={64} />
                                </motion.div>
                            </div>
                            
                            {/* Tricolor accent */}
                            <div className="flex justify-center mb-6">
                                <TricolorStripe width={120} height={16} />
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Secure Your Verification Process?
                            </h2>
                            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                                Start verifying Aadhaar cards in minutes. No credit card required for your first verification.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to={isAuthenticated ? "/" : "/register"}>
                                    <Button 
                                        variant="secondary" 
                                        size="xl" 
                                        icon={ArrowRightIcon} 
                                        iconPosition="right"
                                        className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg"
                                    >
                                        {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button 
                                        variant="ghost" 
                                        size="xl"
                                        className="text-white hover:bg-white/10 border border-white/30"
                                    >
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
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
            className="py-16 bg-gradient-to-br from-orange-50/50 via-white to-green-50/50 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Bottom tricolor line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div variants={itemVariants}>
                    <div className="flex justify-center mb-4">
                        <TricolorStripe width={100} height={12} />
                    </div>
                    <p className="text-orange-600 text-sm uppercase tracking-wider mb-2 font-semibold">
                        Developed By
                    </p>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">Kumar Manglam</h2>
                    <p className="text-secondary-600 mb-6 max-w-lg mx-auto">
                        A passionate developer building innovative AI solutions for Aadhaar verification and document security in India.
                    </p>
                    <a href="https://www.linkedin.com/in/kumar-manglam18/" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
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
