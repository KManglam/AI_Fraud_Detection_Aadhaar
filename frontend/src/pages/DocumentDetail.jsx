import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { documentAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import {
    ChevronLeftIcon,
    DeleteIcon,
    DownloadIcon,
    RefreshIcon,
    CheckIcon,
    ErrorIcon,
    WarningIcon,
    ClockIcon,
    DocumentIcon,
    ShieldIcon,
    SearchIcon,
    ScanIcon,
    BrainIcon,
    EyeIcon
} from '../components/icons/index';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ProgressBar from '../components/ui/ProgressBar';

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

// Helper to normalize bilingual values from Gemini (may be {hindi, english} objects)
function normalizeValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle bilingual objects
        if (value.english) return value.english;
        if (value.English) return value.English;
        if (value.hindi) return value.hindi;
        if (value.Hindi) return value.Hindi;
        // For other objects, convert to JSON string
        return JSON.stringify(value);
    }
    return value;
}

// Info Row Component
function InfoRow({ label, value, icon: Icon }) {
    const displayValue = normalizeValue(value);

    return (
        <div className="flex items-start gap-3 py-3 border-b border-secondary-100 last:border-0">
            {Icon && (
                <div className="p-2 bg-secondary-100 rounded-lg">
                    <Icon size={16} className="text-secondary-500" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-medium text-secondary-900 break-words">{displayValue || 'N/A'}</p>
            </div>
        </div>
    );
}

// Fraud Indicator Component
function FraudIndicator({ indicator, severity }) {
    const severityColors = {
        high: 'bg-error-50 border-error-200 text-error-700',
        medium: 'bg-warning-50 border-warning-200 text-warning-700',
        low: 'bg-success-50 border-success-200 text-success-700',
    };

    return (
        <div className={`p-3 rounded-lg border ${severityColors[severity] || severityColors.medium}`}>
            <div className="flex items-center gap-2">
                <WarningIcon size={16} />
                <span className="text-sm font-medium">{normalizeValue(indicator)}</span>
            </div>
        </div>
    );
}

// YOLO Detection Item Component
function YoloDetectionItem({ detection }) {
    const confidencePercent = (detection.confidence * 100).toFixed(1);
    const isHighConfidence = detection.confidence >= 0.7;

    return (
        <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isHighConfidence ? 'bg-success-500' : 'bg-warning-500'}`} />
                <span className="text-sm font-medium text-secondary-700 capitalize">
                    {detection.class_name?.replace(/_/g, ' ') || `Class ${detection.class_id}`}
                </span>
            </div>
            <span className={`text-sm font-bold ${isHighConfidence ? 'text-success-600' : 'text-warning-600'}`}>
                {confidencePercent}%
            </span>
        </div>
    );
}

// CV Analysis Item Component
function CVAnalysisItem({ title, data }) {
    if (!data || typeof data !== 'object') return null;

    const isSuspicious = data.suspicious;

    return (
        <div className={`p-3 rounded-lg border ${isSuspicious ? 'bg-warning-50 border-warning-200' : 'bg-success-50 border-success-200'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary-900 capitalize">
                    {title.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isSuspicious ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'}`}>
                    {isSuspicious ? 'Suspicious' : 'Normal'}
                </span>
            </div>
            {data.score !== undefined && (
                <p className="text-xs text-secondary-600">Score: {data.score.toFixed(3)}</p>
            )}
            {data.variance !== undefined && (
                <p className="text-xs text-secondary-600">Variance: {data.variance.toFixed(3)}</p>
            )}
            {data.reason && (
                <p className="text-xs text-secondary-600 mt-1">{data.reason}</p>
            )}
        </div>
    );
}

function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { showSuccess, showError, showConfirm } = useToast();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        if (!isAuthenticated) {
            setShowAuthModal(true);
            setLoading(false);
        } else {
            setShowAuthModal(false);
            fetchDocument();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isAuthenticated, authLoading]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const data = await documentAPI.getDocument(id);
            setDocument(data);
        } catch (error) {
            console.error('Error fetching document:', error);
            showError('Failed to load document');
            navigate('/documents');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            await documentAPI.analyzeDocument(id);
            showSuccess('Document analyzed successfully');
            await fetchDocument();
        } catch (error) {
            console.error('Error analyzing document:', error);
            showError('Failed to analyze document');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'Delete Document',
            message: 'Are you sure you want to delete this document? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            setDeleting(true);
            await documentAPI.deleteDocument(id);
            showSuccess('Document deleted successfully');
            navigate('/documents');
        } catch (error) {
            console.error('Error deleting document:', error);
            showError('Failed to delete document');
        } finally {
            setDeleting(false);
        }
    };

    const handleDownload = () => {
        if (document?.original_file_url) {
            window.open(document.original_file_url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64 rounded-lg" />
                <div className="grid lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96 rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!document) {
        return null;
    }

    const metadata = document.metadata || {};
    const fraudDetection = metadata.fraud_detection || {};
    const confidenceScore = metadata.confidence_score || 0;

    // Map extracted data from direct metadata fields (backend stores them directly, not nested)
    const extractedData = {
        name: metadata.name,
        aadhaar_number: metadata.aadhaar_number,
        dob: metadata.date_of_birth,
        gender: metadata.gender,
        address: metadata.address,
        ...metadata.extracted_fields // Include any additional extracted fields
    };

    // Determine if document is fraudulent based on backend data
    // Priority: 1. Gemini's is_authentic verdict, 2. Risk level, 3. Critical (non-CV) fraud indicators
    // CV-based indicators (compression, noise, edge) should NOT mark document as fraud
    const cvKeywords = ['compression', 'noise', 'copy-paste', 'edge'];
    const criticalIndicators = (metadata.fraud_indicators || [])
        .map(ind => normalizeValue(ind) || '')
        .filter(ind => !cvKeywords.some(kw => ind.toLowerCase().includes(kw)));

    // Document is fraud ONLY if:
    // 1. Gemini explicitly said is_authentic = false, OR
    // 2. Risk level is high/medium AND there are critical (non-CV) indicators
    const isFraud = metadata.is_authentic === false ||
        (fraudDetection.risk_level === 'high' && criticalIndicators.length > 0) ||
        (fraudDetection.risk_level === 'medium' && criticalIndicators.length > 0);

    // Combine fraud indicators from Gemini and YOLO
    const allFraudIndicators = [
        ...(metadata.fraud_indicators || []),
        ...(fraudDetection.fraud_indicators || [])
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

    // YOLO detections from fraud_detection object
    const yoloDetections = fraudDetection.yolo_detections || [];

    // CV analysis details from fraud_detection object
    const cvAnalysis = fraudDetection.cv_analysis || {};

    // Check if we have any extracted data
    const hasExtractedData = Object.values(extractedData).some(v => v && v !== '');

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                icon={ChevronLeftIcon}
                                onClick={() => navigate('/documents')}
                                className="!p-2"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-secondary-900 truncate max-w-md">
                                    {document.file_name}
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge.Status status={document.status} />
                                    <span className="text-sm text-secondary-500">
                                        Uploaded {new Date(document.uploaded_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {document.status === 'uploaded' ? (
                                <Button
                                    variant="primary"
                                    icon={SearchIcon}
                                    onClick={handleAnalyze}
                                    loading={analyzing}
                                >
                                    Analyze
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    icon={RefreshIcon}
                                    onClick={handleAnalyze}
                                    loading={analyzing}
                                >
                                    Reanalyze
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                icon={DownloadIcon}
                                onClick={handleDownload}
                            >
                                Download
                            </Button>
                            <Button
                                variant="danger"
                                icon={DeleteIcon}
                                onClick={handleDelete}
                                loading={deleting}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Image */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <Card>
                        <Card.Header>
                            <Card.Title>Document Preview</Card.Title>
                        </Card.Header>
                        <div className="relative rounded-xl overflow-hidden bg-secondary-100">
                            <img
                                src={document.processed_file_url || document.original_file_url}
                                alt={document.file_name}
                                className="w-full h-auto"
                            />
                        </div>
                    </Card>

                    {/* OCR Text - Backend stores as full_text */}
                    {metadata.full_text && (
                        <Card>
                            <Card.Header>
                                <Card.Title>Extracted Text (OCR)</Card.Title>
                            </Card.Header>
                            <div className="bg-secondary-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                                <pre className="text-sm text-secondary-700 whitespace-pre-wrap font-mono">
                                    {normalizeValue(metadata.full_text)}
                                </pre>
                            </div>
                        </Card>
                    )}

                    {/* YOLO Detections */}
                    {yoloDetections.length > 0 && (
                        <Card>
                            <Card.Header>
                                <div className="flex items-center gap-2">
                                    <ScanIcon size={20} className="text-primary-600" />
                                    <Card.Title>YOLO Model Detections</Card.Title>
                                </div>
                                <p className="text-xs text-secondary-500 mt-1">
                                    AI-powered object detection results
                                </p>
                            </Card.Header>
                            <div className="space-y-2">
                                {yoloDetections.map((detection, index) => (
                                    <YoloDetectionItem key={index} detection={detection} />
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* CV Analysis Details */}
                    {Object.keys(cvAnalysis).length > 0 && (
                        <Card>
                            <Card.Header>
                                <div className="flex items-center gap-2">
                                    <EyeIcon size={20} className="text-primary-600" />
                                    <Card.Title>Computer Vision Analysis</Card.Title>
                                </div>
                                <p className="text-xs text-secondary-500 mt-1">
                                    Advanced image forensics analysis
                                </p>
                            </Card.Header>
                            <div className="space-y-2">
                                {Object.entries(cvAnalysis).map(([key, value]) => (
                                    <CVAnalysisItem key={key} title={key} data={value} />
                                ))}
                            </div>
                            {fraudDetection.risk_score !== undefined && (
                                <div className="mt-4 pt-4 border-t border-secondary-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-secondary-700">Fraud Risk Score</span>
                                        <span className={`text-lg font-bold ${fraudDetection.risk_score < 0.3 ? 'text-success-600' :
                                            fraudDetection.risk_score < 0.6 ? 'text-warning-600' :
                                                'text-error-600'
                                            }`}>
                                            {(fraudDetection.risk_score * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-secondary-500">Risk Level:</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${fraudDetection.risk_level === 'low' ? 'bg-success-100 text-success-700' :
                                            fraudDetection.risk_level === 'medium' ? 'bg-warning-100 text-warning-700' :
                                                'bg-error-100 text-error-700'
                                            }`}>
                                            {fraudDetection.risk_level?.toUpperCase() || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}
                </motion.div>

                {/* Right Column - Details */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Verification Status */}
                    <Card className={`
                        ${document.status === 'completed' && !isFraud ? 'bg-success-50 border-success-200' : ''}
                        ${document.status === 'completed' && isFraud ? 'bg-error-50 border-error-200' : ''}
                        ${document.status === 'processing' ? 'bg-warning-50 border-warning-200' : ''}
                        ${document.status === 'failed' ? 'bg-error-50 border-error-200' : ''}
                    `}>
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${document.status === 'completed' && !isFraud ? 'bg-success-100' :
                                document.status === 'completed' && isFraud ? 'bg-error-100' :
                                    document.status === 'processing' ? 'bg-warning-100' :
                                        'bg-secondary-100'
                                }`}>
                                {document.status === 'completed' && !isFraud && <CheckIcon size={32} className="text-success-600" />}
                                {document.status === 'completed' && isFraud && <ErrorIcon size={32} className="text-error-600" />}
                                {document.status === 'processing' && <ClockIcon size={32} className="text-warning-600" />}
                                {document.status === 'failed' && <ErrorIcon size={32} className="text-error-600" />}
                                {document.status === 'uploaded' && <DocumentIcon size={32} className="text-primary-600" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-secondary-900">
                                    {document.status === 'completed' && !isFraud && 'Document Verified'}
                                    {document.status === 'completed' && isFraud && 'Potential Fraud Detected'}
                                    {document.status === 'processing' && 'Processing...'}
                                    {document.status === 'failed' && 'Verification Failed'}
                                    {document.status === 'uploaded' && 'Awaiting Analysis'}
                                </h3>
                                <p className="text-sm text-secondary-600 mt-1">
                                    {document.status === 'completed' && !isFraud && 'This document appears to be authentic.'}
                                    {document.status === 'completed' && isFraud && 'This document shows signs of tampering or forgery.'}
                                    {document.status === 'processing' && 'Please wait while we analyze your document.'}
                                    {document.status === 'failed' && 'Unable to process this document. Please try again.'}
                                    {document.status === 'uploaded' && 'Click "Analyze" to start verification.'}
                                </p>
                            </div>
                        </div>

                        {/* Confidence Score */}
                        {document.status === 'completed' && (
                            <div className="mt-4 pt-4 border-t border-secondary-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-secondary-700">Confidence Score</span>
                                    <span className={`text-lg font-bold ${confidenceScore >= 0.9 ? 'text-success-600' :
                                        confidenceScore >= 0.7 ? 'text-warning-600' :
                                            'text-error-600'
                                        }`}>
                                        {(confidenceScore * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <ProgressBar
                                    value={confidenceScore * 100}
                                    variant={
                                        confidenceScore >= 0.9 ? 'success' :
                                            confidenceScore >= 0.7 ? 'warning' :
                                                'error'
                                    }
                                />
                            </div>
                        )}
                    </Card>

                    {/* Fraud Indicators - Combined from Gemini and YOLO */}
                    {allFraudIndicators.length > 0 && (
                        <Card>
                            <Card.Header>
                                <div className="flex items-center gap-2">
                                    <WarningIcon size={20} className="text-error-600" />
                                    <Card.Title>Fraud Indicators ({allFraudIndicators.length})</Card.Title>
                                </div>
                                <p className="text-xs text-secondary-500 mt-1">
                                    Combined analysis from Gemini AI and YOLO model
                                </p>
                            </Card.Header>
                            <div className="space-y-2">
                                {allFraudIndicators.map((indicator, index) => (
                                    <FraudIndicator
                                        key={index}
                                        indicator={indicator}
                                        severity={fraudDetection.risk_level || 'medium'}
                                    />
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Gemini Analysis Summary */}
                    {metadata.gemini_response && (
                        <Card>
                            <Card.Header>
                                <div className="flex items-center gap-2">
                                    <BrainIcon size={20} className="text-purple-600" />
                                    <Card.Title>Gemini AI Analysis</Card.Title>
                                </div>
                            </Card.Header>
                            <div className="space-y-3">
                                {metadata.is_authentic !== null && metadata.is_authentic !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-secondary-600">Authenticity:</span>
                                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${metadata.is_authentic ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
                                            }`}>
                                            {metadata.is_authentic ? 'Authentic' : 'Suspicious'}
                                        </span>
                                    </div>
                                )}
                                {metadata.quality_issues && metadata.quality_issues.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-secondary-500 mb-2">Quality Issues:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {metadata.quality_issues.map((issue, idx) => (
                                                <span key={idx} className="text-xs bg-warning-50 text-warning-700 px-2 py-1 rounded">
                                                    {normalizeValue(issue)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Extracted Data */}
                    {hasExtractedData && (
                        <Card>
                            <Card.Header>
                                <div className="flex items-center gap-2">
                                    <ShieldIcon size={20} className="text-primary-600" />
                                    <Card.Title>Extracted Information</Card.Title>
                                </div>
                                <p className="text-xs text-secondary-500 mt-1">
                                    Data extracted by Gemini AI from document
                                </p>
                            </Card.Header>
                            <div className="space-y-1">
                                {extractedData.name && <InfoRow label="Name" value={extractedData.name} />}
                                {extractedData.aadhaar_number && (
                                    <InfoRow
                                        label="Aadhaar Number"
                                        value={extractedData.aadhaar_number?.replace(/(\d{4})/g, '$1 ').trim()}
                                    />
                                )}
                                {extractedData.dob && <InfoRow label="Date of Birth" value={extractedData.dob} />}
                                {extractedData.gender && <InfoRow label="Gender" value={extractedData.gender} />}
                                {extractedData.address && <InfoRow label="Address" value={extractedData.address} />}
                            </div>
                        </Card>
                    )}

                    {/* Document Info */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Document Information</Card.Title>
                        </Card.Header>
                        <div className="space-y-1">
                            <InfoRow label="File Name" value={document.file_name} icon={DocumentIcon} />
                            <InfoRow label="File Type" value={document.file_type} />
                            <InfoRow label="File Size" value={document.file_size ? `${(document.file_size / 1024).toFixed(2)} KB` : 'N/A'} />
                            <InfoRow label="Uploaded At" value={new Date(document.uploaded_at).toLocaleString()} icon={ClockIcon} />
                            {metadata.analyzed_at && (
                                <InfoRow label="Analyzed At" value={new Date(metadata.analyzed_at).toLocaleString()} />
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Auth Modal for non-authenticated users */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    navigate('/documents');
                }}
                message="Please login to view document details"
            />
        </motion.div>
    );
}

export default DocumentDetail;
