import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    DocsIcon, 
    UploadIcon, 
    SearchIcon, 
    ChartIcon,
    CheckIcon,
    WarningIcon,
    InfoIcon,
    ArrowRightIcon,
    ChevronRightIcon,
    DocumentIcon,
    ShieldIcon,
    ClockIcon,
    ErrorIcon
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

// Table of Contents
const sections = [
    { id: 'introduction', title: 'Introduction', icon: InfoIcon },
    { id: 'upload', title: 'How to Upload Documents', icon: UploadIcon },
    { id: 'processing', title: 'How Processing Works', icon: SearchIcon },
    { id: 'dashboard', title: 'Understanding the Dashboard', icon: ChartIcon },
    { id: 'errors', title: 'Common Errors & Fixes', icon: WarningIcon },
    { id: 'faq', title: 'Frequently Asked Questions', icon: DocsIcon },
];

// FAQ Data
const faqs = [
    {
        question: 'What file formats are supported?',
        answer: 'AadhaarAuth supports PNG, JPG, JPEG, and WEBP image formats. For best results, use high-resolution images with clear text visibility.'
    },
    {
        question: 'How long does verification take?',
        answer: 'Most documents are processed within 2-5 seconds. Batch processing of multiple documents may take longer depending on the queue size.'
    },
    {
        question: 'Is my data secure?',
        answer: 'Yes, all uploaded documents are encrypted and processed securely. We follow industry-standard security practices and do not store sensitive information longer than necessary.'
    },
    {
        question: 'What does the confidence score mean?',
        answer: 'The confidence score indicates how certain our AI is about the verification result. Scores above 90% indicate high confidence, while lower scores may require manual review.'
    },
    {
        question: 'Can I verify multiple documents at once?',
        answer: 'Yes, you can upload multiple documents simultaneously. Use the batch upload feature on the dashboard or drag and drop multiple files at once.'
    },
    {
        question: 'What should I do if a legitimate document is marked as fraudulent?',
        answer: 'If you believe a document has been incorrectly flagged, you can request a manual review. Check the image quality and try re-uploading a clearer scan.'
    }
];

// Step Component
function Step({ number, title, description, icon: Icon }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                    {number}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon size={18} className="text-primary-600" />}
                    <h4 className="font-semibold text-secondary-900">{title}</h4>
                </div>
                <p className="text-secondary-600 text-sm">{description}</p>
            </div>
        </div>
    );
}

// Status Explanation Component
function StatusExplanation({ status, icon: Icon, color, title, description }) {
    const colorClasses = {
        success: 'bg-success-50 border-success-200 text-success-700',
        warning: 'bg-warning-50 border-warning-200 text-warning-700',
        error: 'bg-error-50 border-error-200 text-error-700',
        primary: 'bg-primary-50 border-primary-200 text-primary-700',
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon size={20} />
                <span className="font-semibold">{title}</span>
            </div>
            <p className="text-sm opacity-90">{description}</p>
        </div>
    );
}

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }) {
    return (
        <div className="border-b border-secondary-200 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-4 flex items-center justify-between text-left hover:text-primary-600 transition-colors"
            >
                <span className="font-medium text-secondary-900">{question}</span>
                <ChevronRightIcon 
                    size={20} 
                    className={`text-secondary-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
                />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                <p className="pb-4 text-secondary-600 text-sm">{answer}</p>
            </motion.div>
        </div>
    );
}

function Documentation() {
    const [activeSection, setActiveSection] = useState('introduction');
    const [openFAQ, setOpenFAQ] = useState(null);

    const scrollToSection = (id) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-4">
                    <DocsIcon size={16} />
                    Documentation
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                    How to Use AadhaarAuth System
                </h1>
                <p className="text-secondary-600 max-w-2xl mx-auto">
                    Complete guide to uploading, verifying, and managing your Aadhaar documents 
                    with our AI-powered verification system.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar - Table of Contents */}
                <motion.aside variants={itemVariants} className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card>
                            <h3 className="font-semibold text-secondary-900 mb-4">Contents</h3>
                            <nav className="space-y-1">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                                                activeSection === section.id
                                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                                    : 'text-secondary-600 hover:bg-secondary-50'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {section.title}
                                        </button>
                                    );
                                })}
                            </nav>
                        </Card>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <motion.div variants={containerVariants} className="lg:col-span-3 space-y-12">
                    {/* Introduction */}
                    <motion.section variants={itemVariants} id="introduction">
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary-100 rounded-xl">
                                    <InfoIcon size={24} className="text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">Introduction</h2>
                                    <p className="text-secondary-500">What this tool does and why it's useful</p>
                                </div>
                            </div>
                            
                            <div className="prose prose-secondary max-w-none">
                                <p className="text-secondary-700 leading-relaxed mb-4">
                                    AadhaarAuth System is an advanced AI-powered document verification platform 
                                    specifically designed to authenticate Aadhaar cards. Using state-of-the-art 
                                    machine learning algorithms, our system can detect fraudulent, tampered, or 
                                    forged documents with high accuracy.
                                </p>
                                
                                <div className="grid sm:grid-cols-3 gap-4 my-6">
                                    <div className="p-4 bg-secondary-50 rounded-xl text-center">
                                        <ShieldIcon size={32} className="text-primary-600 mx-auto mb-2" />
                                        <p className="font-medium text-secondary-900">Fraud Detection</p>
                                        <p className="text-xs text-secondary-500">AI-powered analysis</p>
                                    </div>
                                    <div className="p-4 bg-secondary-50 rounded-xl text-center">
                                        <ClockIcon size={32} className="text-primary-600 mx-auto mb-2" />
                                        <p className="font-medium text-secondary-900">Fast Processing</p>
                                        <p className="text-xs text-secondary-500">Results in seconds</p>
                                    </div>
                                    <div className="p-4 bg-secondary-50 rounded-xl text-center">
                                        <DocumentIcon size={32} className="text-primary-600 mx-auto mb-2" />
                                        <p className="font-medium text-secondary-900">OCR Extraction</p>
                                        <p className="text-xs text-secondary-500">Auto data capture</p>
                                    </div>
                                </div>

                                <p className="text-secondary-700 leading-relaxed">
                                    Whether you're a financial institution, government agency, or business 
                                    that needs to verify customer identities, AadhaarAuth provides a reliable, 
                                    fast, and secure solution for your document verification needs.
                                </p>
                            </div>
                        </Card>
                    </motion.section>

                    {/* How to Upload */}
                    <motion.section variants={itemVariants} id="upload">
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-success-100 rounded-xl">
                                    <UploadIcon size={24} className="text-success-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">How to Upload Documents</h2>
                                    <p className="text-secondary-500">Step-by-step upload instructions</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Step 
                                    number={1}
                                    title="Navigate to Dashboard"
                                    description="Go to the Dashboard page from the navigation menu. This is your main control center for document uploads."
                                    icon={ChartIcon}
                                />
                                <Step 
                                    number={2}
                                    title="Drag & Drop or Click to Upload"
                                    description="Use the upload zone to drag and drop your Aadhaar card images, or click to browse files from your computer."
                                    icon={UploadIcon}
                                />
                                <Step 
                                    number={3}
                                    title="Wait for Processing"
                                    description="Once uploaded, documents are automatically queued for AI analysis. You'll see a processing indicator."
                                    icon={ClockIcon}
                                />
                                <Step 
                                    number={4}
                                    title="Review Results"
                                    description="After processing, view detailed verification results including authenticity score, extracted data, and any fraud indicators."
                                    icon={CheckIcon}
                                />
                            </div>

                            <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <WarningIcon size={20} className="text-warning-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-warning-800">Tips for Best Results</p>
                                        <ul className="text-sm text-warning-700 mt-2 space-y-1">
                                            <li>• Use high-resolution images (at least 300 DPI)</li>
                                            <li>• Ensure the entire document is visible</li>
                                            <li>• Avoid blurry or poorly lit photos</li>
                                            <li>• Supported formats: PNG, JPG, JPEG, WEBP</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.section>

                    {/* How Processing Works */}
                    <motion.section variants={itemVariants} id="processing">
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-warning-100 rounded-xl">
                                    <SearchIcon size={24} className="text-warning-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">How Processing Works</h2>
                                    <p className="text-secondary-500">Understanding the verification flow</p>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Processing Pipeline */}
                                <div className="space-y-4">
                                    {[
                                        { title: 'Image Upload', desc: 'Document is securely uploaded and stored' },
                                        { title: 'Pre-processing', desc: 'Image is enhanced and normalized for analysis' },
                                        { title: 'OCR Extraction', desc: 'Text and data are extracted from the document' },
                                        { title: 'AI Analysis', desc: 'Deep learning model analyzes for fraud indicators' },
                                        { title: 'Verification', desc: 'Results are compiled with confidence scores' },
                                    ].map((step, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 p-4 bg-secondary-50 rounded-xl">
                                                <p className="font-medium text-secondary-900">{step.title}</p>
                                                <p className="text-sm text-secondary-600">{step.desc}</p>
                                            </div>
                                            {index < 4 && (
                                                <ArrowRightIcon size={20} className="text-secondary-300 hidden sm:block" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.section>

                    {/* Understanding Dashboard */}
                    <motion.section variants={itemVariants} id="dashboard">
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary-100 rounded-xl">
                                    <ChartIcon size={24} className="text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">Understanding the Dashboard</h2>
                                    <p className="text-secondary-500">Document statuses and metrics explained</p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-secondary-900 mb-4">Document Statuses</h3>
                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                <StatusExplanation 
                                    icon={CheckIcon}
                                    color="success"
                                    title="Completed"
                                    description="Document has been successfully verified. View detailed results including authenticity score and extracted data."
                                />
                                <StatusExplanation 
                                    icon={ClockIcon}
                                    color="warning"
                                    title="Processing"
                                    description="Document is currently being analyzed by our AI system. This typically takes 2-5 seconds."
                                />
                                <StatusExplanation 
                                    icon={ErrorIcon}
                                    color="error"
                                    title="Failed"
                                    description="Verification failed due to image quality issues or processing errors. Try re-uploading with a clearer image."
                                />
                                <StatusExplanation 
                                    icon={UploadIcon}
                                    color="primary"
                                    title="Uploaded"
                                    description="Document has been uploaded and is waiting in queue for analysis. Click 'Analyze All' to process."
                                />
                            </div>

                            <h3 className="font-semibold text-secondary-900 mb-4">Dashboard Metrics</h3>
                            <ul className="space-y-3 text-secondary-700">
                                <li className="flex items-start gap-2">
                                    <CheckIcon size={18} className="text-success-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>Total Documents:</strong> Total number of documents uploaded to the system</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckIcon size={18} className="text-success-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>Success Rate:</strong> Percentage of documents that passed verification</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckIcon size={18} className="text-success-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>Charts:</strong> Visual representation of verification statistics over time</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckIcon size={18} className="text-success-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>Recent Documents:</strong> Quick access to your latest uploaded documents</span>
                                </li>
                            </ul>
                        </Card>
                    </motion.section>

                    {/* Common Errors */}
                    <motion.section variants={itemVariants} id="errors">
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-error-100 rounded-xl">
                                    <WarningIcon size={24} className="text-error-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">Common Errors & Fixes</h2>
                                    <p className="text-secondary-500">Troubleshooting guide</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        error: 'Image quality too low',
                                        solution: 'Use a higher resolution image (minimum 300 DPI). Ensure good lighting and focus when capturing the document.'
                                    },
                                    {
                                        error: 'Document not detected',
                                        solution: 'Make sure the entire Aadhaar card is visible in the image. Avoid cropping or cutting off any edges.'
                                    },
                                    {
                                        error: 'Processing timeout',
                                        solution: 'The server may be experiencing high load. Wait a few minutes and try again, or contact support if the issue persists.'
                                    },
                                    {
                                        error: 'Unsupported file format',
                                        solution: 'Convert your file to PNG, JPG, JPEG, or WEBP format before uploading.'
                                    },
                                    {
                                        error: 'File size too large',
                                        solution: 'Compress your image or reduce its resolution. Maximum file size is 10MB.'
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="p-4 border border-secondary-200 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <ErrorIcon size={20} className="text-error-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-secondary-900">{item.error}</p>
                                                <p className="text-sm text-secondary-600 mt-1">
                                                    <strong className="text-success-600">Fix:</strong> {item.solution}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.section>

                    {/* FAQ */}
                    <motion.section variants={itemVariants} id="faq">
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-secondary-100 rounded-xl">
                                    <DocsIcon size={24} className="text-secondary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-secondary-900">Frequently Asked Questions</h2>
                                    <p className="text-secondary-500">Quick answers to common questions</p>
                                </div>
                            </div>

                            <div className="divide-y divide-secondary-200">
                                {faqs.map((faq, index) => (
                                    <FAQItem
                                        key={index}
                                        question={faq.question}
                                        answer={faq.answer}
                                        isOpen={openFAQ === index}
                                        onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                    />
                                ))}
                            </div>
                        </Card>
                    </motion.section>

                    {/* CTA */}
                    <motion.section variants={itemVariants}>
                        <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
                            <h3 className="text-2xl font-bold mb-3">Ready to Start Verifying?</h3>
                            <p className="text-primary-100 mb-6 max-w-md mx-auto">
                                Upload your first document and experience the power of AI-driven verification.
                            </p>
                            <Link to="/">
                                <Button 
                                    variant="secondary" 
                                    size="lg"
                                    icon={ArrowRightIcon}
                                    iconPosition="right"
                                    className="bg-white text-primary-600 hover:bg-primary-50"
                                >
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </Card>
                    </motion.section>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Documentation;
