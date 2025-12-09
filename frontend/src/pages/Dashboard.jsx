import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { documentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import {
    UploadIcon,
    CheckIcon,
    ErrorIcon,
    WarningIcon,
    DocumentIcon,
    ChartIcon,
    TrendUpIcon,
    ClockIcon,
    ArrowRightIcon,
    SearchIcon
} from '../components/icons/index';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ProgressBar from '../components/ui/ProgressBar';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';

// Animation variants
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
        if (value.english) return value.english;
        if (value.English) return value.English;
        if (value.hindi) return value.hindi;
        if (value.Hindi) return value.Hindi;
        return JSON.stringify(value);
    }
    return value;
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, trend, trendValue, color, loading, onClick }) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600 border-primary-100',
        success: 'bg-success-50 text-success-600 border-success-100',
        warning: 'bg-warning-50 text-warning-600 border-warning-100',
        error: 'bg-error-50 text-error-600 border-error-100',
    };

    const iconBgClasses = {
        primary: 'bg-primary-100',
        success: 'bg-success-100',
        warning: 'bg-warning-100',
        error: 'bg-error-100',
    };

    if (loading) {
        return <Skeleton.Stat />;
    }

    return (
        <Card
            className={`${colorClasses[color]} border-2 cursor-pointer transition-transform hover:scale-105`}
            hover
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-success-600' : 'text-error-600'}`}>
                            <TrendUpIcon size={16} className={trend === 'down' ? 'rotate-180' : ''} />
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </Card>
    );
}

// Upload Zone Component
function UploadZone({ onUpload, uploading }) {
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onUpload(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    return (
        <motion.div
            variants={itemVariants}
            className={`
                relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                transition-all duration-300 ease-out
                ${dragOver
                    ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                    : 'border-secondary-300 bg-white hover:border-primary-400 hover:bg-primary-50/50'
                }
                ${uploading ? 'pointer-events-none opacity-70' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && document.getElementById('fileInput').click()}
            whileHover={{ scale: uploading ? 1 : 1.01 }}
            whileTap={{ scale: uploading ? 1 : 0.99 }}
        >
            <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onUpload(Array.from(e.target.files))}
                className="hidden"
            />

            <div className="flex flex-col items-center">
                <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${dragOver ? 'bg-primary-100' : 'bg-secondary-100'}`}
                    animate={uploading ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: uploading ? Infinity : 0, ease: 'linear' }}
                >
                    <UploadIcon size={24} className={dragOver ? 'text-primary-600' : 'text-secondary-500'} />
                </motion.div>

                <h3 className="text-base font-semibold text-secondary-900 mb-0.5">
                    {uploading ? 'Uploading...' : 'Drop Aadhaar Cards Here'}
                </h3>
                <p className="text-xs text-secondary-500 mb-2">
                    or click to browse from your computer
                </p>

                <div className="flex items-center gap-2 text-xs text-secondary-400">
                    <span className="px-2 py-0.5 bg-secondary-100 rounded">PNG</span>
                    <span className="px-2 py-0.5 bg-secondary-100 rounded">JPG</span>
                    <span className="px-2 py-0.5 bg-secondary-100 rounded">JPEG</span>
                    <span className="px-2 py-0.5 bg-secondary-100 rounded">WEBP</span>
                </div>
            </div>
        </motion.div>
    );
}

// Recent Document Item
function RecentDocItem({ doc }) {
    // Determine the actual verification status based on metadata
    const metadata = doc.metadata || {};
    const fraudDetection = metadata.fraud_detection || {};

    // CV-based indicators should not affect the status
    const cvKeywords = ['compression', 'noise', 'copy-paste', 'edge'];
    const criticalIndicators = (metadata.fraud_indicators || [])
        .map(ind => normalizeValue(ind) || '')
        .filter(ind => !cvKeywords.some(kw => ind.toLowerCase().includes(kw)));

    // Determine verification status
    let verificationStatus = doc.status; // Default to processing status

    if (doc.status === 'completed') {
        // Check actual verification result
        const isFraud = metadata.is_authentic === false ||
            (fraudDetection.risk_level === 'high' && criticalIndicators.length > 0) ||
            (fraudDetection.risk_level === 'medium' && criticalIndicators.length > 0);

        verificationStatus = isFraud ? 'suspicious' : 'verified';
    }

    return (
        <Link
            to={`/documents/${doc.id}`}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-50 transition-colors group"
        >
            <div className={`w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0`}>
                {doc.thumbnail_url ? (
                    <img src={doc.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <DocumentIcon size={20} className="text-secondary-400" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                    {doc.file_name}
                </p>
                <p className="text-xs text-secondary-500">
                    {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
            <Badge.Status status={verificationStatus} />
            <ArrowRightIcon size={16} className="text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}

function Dashboard() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0, uploaded: 0 });
    const [recentDocs, setRecentDocs] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [analyzingDocIds, setAnalyzingDocIds] = useState([]);
    const pollingIntervalRef = useRef(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Wait for auth to finish loading before fetching data
        if (authLoading) return;

        // For authenticated users, fetch their documents
        // For non-authenticated users, show empty dashboard
        if (isAuthenticated) {
            fetchDashboardData();
        } else {
            setLoading(false);
            setStats({ total: 0, completed: 0, processing: 0, failed: 0, uploaded: 0 });
            setRecentDocs([]);
            setChartData([]);
            setPieData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, authLoading]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const docs = await documentAPI.getAllDocuments();

            // CV-based indicators should not affect the status
            const cvKeywords = ['compression', 'noise', 'copy-paste', 'edge'];

            // Helper function to determine if document is suspicious
            const isDocSuspicious = (doc) => {
                const metadata = doc.metadata || {};
                const fraudDetection = metadata.fraud_detection || {};
                const criticalIndicators = (metadata.fraud_indicators || [])
                    .map(ind => normalizeValue(ind) || '')
                    .filter(ind => !cvKeywords.some(kw => ind.toLowerCase().includes(kw)));
                return metadata.is_authentic === false ||
                    (fraudDetection.risk_level === 'high' && criticalIndicators.length > 0) ||
                    (fraudDetection.risk_level === 'medium' && criticalIndicators.length > 0);
            };

            const newStats = docs.reduce((acc, doc) => {
                acc.total++;
                acc[doc.status] = (acc[doc.status] || 0) + 1;
                if (doc.status === 'uploaded' && (!doc.metadata || !doc.metadata.analyzed_at)) {
                    acc.uploaded = (acc.uploaded || 0) + 1;
                }
                // Count verified vs suspicious for completed documents
                if (doc.status === 'completed') {
                    if (isDocSuspicious(doc)) {
                        acc.suspicious = (acc.suspicious || 0) + 1;
                    } else {
                        acc.verified = (acc.verified || 0) + 1;
                    }
                }
                return acc;
            }, { total: 0, completed: 0, processing: 0, failed: 0, uploaded: 0, verified: 0, suspicious: 0 });

            setStats(newStats);
            setRecentDocs(docs.slice(0, 5));

            // Bar chart data - show Verified, Suspicious, Processing
            setChartData([
                { name: 'Verified', count: newStats.verified, color: '#10b981' },
                { name: 'Suspicious', count: newStats.suspicious, color: '#ef4444' },
                { name: 'Processing', count: newStats.processing, color: '#f59e0b' }
            ]);

            // Pie chart data - show actual verification breakdown
            setPieData([
                { name: 'Verified', value: newStats.verified, color: '#10b981' },
                { name: 'Suspicious', value: newStats.suspicious, color: '#ef4444' },
                { name: 'Pending', value: newStats.processing + newStats.uploaded, color: '#f59e0b' },
                { name: 'Failed', value: newStats.failed, color: '#6b7280' }
            ].filter(d => d.value > 0));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleUpload = async (files) => {
        if (files.length === 0) return;

        // Check if user is authenticated before uploading
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            setUploading(true);
            showNotification(`Uploading ${files.length} file(s)...`, 'info');

            const result = await documentAPI.uploadDocuments(files, false);
            showNotification(`Successfully uploaded ${result.count || files.length} file(s)!`, 'success');

            // Optimistically update UI with new documents
            if (result.documents && result.documents.length > 0) {
                // Update recent docs list
                setRecentDocs(prev => [...result.documents, ...prev].slice(0, 5));

                // Update stats
                setStats(prev => ({
                    ...prev,
                    total: prev.total + result.documents.length,
                    uploaded: prev.uploaded + result.documents.length,
                    processing: prev.processing // Processing count stays same until analysis starts
                }));
            }

            await fetchDashboardData();

            // Auto-analyze
            const uploadedDocIds = result.documents?.map(doc => doc.id) || [];
            if (uploadedDocIds.length > 0) {
                autoAnalyzeDocuments(uploadedDocIds);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Start polling for document status updates
    const startPolling = useCallback((docIds) => {
        // Clear any existing polling
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        setAnalyzingDocIds(docIds);

        // Poll every 2 seconds for status updates
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const docs = await documentAPI.getAllDocuments();

                // Update recent docs and stats with latest data
                setRecentDocs(docs.slice(0, 5));

                // CV-based indicators should not affect the status
                const cvKeywords = ['compression', 'noise', 'copy-paste', 'edge'];

                const isDocSuspicious = (doc) => {
                    const metadata = doc.metadata || {};
                    const fraudDetection = metadata.fraud_detection || {};
                    const criticalIndicators = (metadata.fraud_indicators || [])
                        .map(ind => normalizeValue(ind) || '')
                        .filter(ind => !cvKeywords.some(kw => ind.toLowerCase().includes(kw)));
                    return metadata.is_authentic === false ||
                        (fraudDetection.risk_level === 'high' && criticalIndicators.length > 0) ||
                        (fraudDetection.risk_level === 'medium' && criticalIndicators.length > 0);
                };

                const newStats = docs.reduce((acc, doc) => {
                    acc.total++;
                    acc[doc.status] = (acc[doc.status] || 0) + 1;
                    if (doc.status === 'uploaded' && (!doc.metadata || !doc.metadata.analyzed_at)) {
                        acc.uploaded = (acc.uploaded || 0) + 1;
                    }
                    if (doc.status === 'completed') {
                        if (isDocSuspicious(doc)) {
                            acc.suspicious = (acc.suspicious || 0) + 1;
                        } else {
                            acc.verified = (acc.verified || 0) + 1;
                        }
                    }
                    return acc;
                }, { total: 0, completed: 0, processing: 0, failed: 0, uploaded: 0, verified: 0, suspicious: 0 });

                setStats(newStats);

                // Update chart data
                setChartData([
                    { name: 'Verified', count: newStats.verified, color: '#10b981' },
                    { name: 'Suspicious', count: newStats.suspicious, color: '#ef4444' },
                    { name: 'Processing', count: newStats.processing, color: '#f59e0b' }
                ]);

                setPieData([
                    { name: 'Verified', value: newStats.verified, color: '#10b981' },
                    { name: 'Suspicious', value: newStats.suspicious, color: '#ef4444' },
                    { name: 'Pending', value: newStats.processing + newStats.uploaded, color: '#f59e0b' },
                    { name: 'Failed', value: newStats.failed, color: '#6b7280' }
                ].filter(d => d.value > 0));

            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000);
    }, []);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setAnalyzingDocIds([]);
    }, []);

    const autoAnalyzeDocuments = async (documentIds) => {
        try {
            setAnalyzing(true);
            showNotification('Auto-analyzing documents...', 'info');

            // Start polling for real-time status updates
            startPolling(documentIds);

            const result = await documentAPI.batchAnalyze(documentIds);

            // Stop polling after analysis completes
            stopPolling();

            showNotification(`Analysis complete! ${result.successful} document(s) processed.`, 'success');

            await fetchDashboardData();
        } catch (error) {
            console.error('Auto-analysis failed:', error);
            showNotification('Auto-analysis failed. You can retry manually.', 'warning');
            stopPolling();
        } finally {
            setAnalyzing(false);
        }
    };

    const handleBatchAnalyze = async () => {
        try {
            setAnalyzing(true);
            const docs = await documentAPI.getAllDocuments();
            const unanalyzedDocs = docs.filter(doc =>
                doc.status === 'uploaded' && (!doc.metadata || !doc.metadata.analyzed_at)
            );

            if (unanalyzedDocs.length === 0) {
                showNotification('All documents are already analyzed!', 'success');
                setAnalyzing(false);
                return;
            }

            const documentIds = unanalyzedDocs.map(doc => doc.id);

            // Start polling for real-time status updates
            startPolling(documentIds);

            const result = await documentAPI.batchAnalyze(documentIds);

            // Stop polling after analysis completes
            stopPolling();

            showNotification(`Successfully analyzed ${result.successful} document(s)!`, 'success');

            await fetchDashboardData();
        } catch (error) {
            console.error('Batch analysis failed:', error);
            showNotification('Analysis failed. Please try again.', 'error');
            stopPolling();
        } finally {
            setAnalyzing(false);
        }
    };

    // Success rate = verified documents / all completed (analyzed) documents
    const successRate = stats.completed > 0 ? Math.round((stats.verified / stats.completed) * 100) : 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            {/* Notification */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${notification.type === 'success' ? 'bg-success-50 border-success-200 text-success-800' :
                            notification.type === 'error' ? 'bg-error-50 border-error-200 text-error-800' :
                                notification.type === 'warning' ? 'bg-warning-50 border-warning-200 text-warning-800' :
                                    'bg-primary-50 border-primary-200 text-primary-800'
                        }`}
                >
                    {notification.type === 'success' && <CheckIcon size={20} />}
                    {notification.type === 'error' && <ErrorIcon size={20} />}
                    {notification.type === 'warning' && <WarningIcon size={20} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </motion.div>
            )}

            {/* Page Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Dashboard</h1>
                    <p className="text-secondary-500 mt-1">Welcome back! Here's your verification overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        icon={SearchIcon}
                        onClick={() => window.location.href = '/documents'}
                    >
                        View All
                    </Button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Total Documents"
                    value={stats.total}
                    icon={DocumentIcon}
                    color="primary"
                    loading={loading}
                    onClick={() => window.location.href = '/documents'}
                />
                <StatCard
                    title="Verified"
                    value={stats.verified}
                    icon={CheckIcon}
                    color="success"
                    trend="up"
                    trendValue={`${successRate}% success rate`}
                    loading={loading}
                    onClick={() => window.location.href = '/documents?filter=verified'}
                />
                <StatCard
                    title="Suspicious"
                    value={stats.suspicious}
                    icon={ErrorIcon}
                    color="error"
                    loading={loading}
                    onClick={() => window.location.href = '/documents?filter=suspicious'}
                />
                <StatCard
                    title="Processing"
                    value={stats.processing + stats.uploaded}
                    icon={ClockIcon}
                    color="warning"
                    loading={loading}
                    onClick={() => window.location.href = '/documents?filter=processing'}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Upload & Charts */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Upload Section */}
                    <Card>
                        <Card.Header>
                            <div>
                                <Card.Title>Upload Documents</Card.Title>
                                <Card.Description>Drag and drop Aadhaar cards for verification</Card.Description>
                            </div>
                        </Card.Header>
                        <UploadZone onUpload={handleUpload} uploading={uploading} />
                    </Card>

                    {/* Batch Analyze Section */}
                    {stats.uploaded > 0 && (
                        <motion.div variants={itemVariants}>
                            <Card className="bg-warning-50 border-warning-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-warning-100 rounded-lg">
                                            <ClockIcon size={24} className="text-warning-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-warning-800">
                                                {stats.uploaded} document{stats.uploaded > 1 ? 's' : ''} pending analysis
                                            </p>
                                            <p className="text-sm text-warning-600">
                                                Click to analyze all uploaded documents
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="warning"
                                        icon={SearchIcon}
                                        onClick={handleBatchAnalyze}
                                        loading={analyzing}
                                    >
                                        Analyze All
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bar Chart */}
                        <motion.div variants={itemVariants}>
                            <Card>
                                <Card.Header>
                                    <div className="flex items-center gap-2">
                                        <ChartIcon size={20} className="text-primary-600" />
                                        <Card.Title>Status Overview</Card.Title>
                                    </div>
                                </Card.Header>
                                <div className="h-48">
                                    {loading ? (
                                        <Skeleton className="w-full h-full rounded-lg" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Pie Chart */}
                        <motion.div variants={itemVariants}>
                            <Card>
                                <Card.Header>
                                    <div className="flex items-center gap-2">
                                        <ChartIcon size={20} className="text-primary-600" />
                                        <Card.Title>Verification Rate</Card.Title>
                                    </div>
                                </Card.Header>
                                <div className="h-48 flex items-center justify-center">
                                    {loading ? (
                                        <Skeleton className="w-36 h-36 rounded-full" />
                                    ) : pieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={35}
                                                    outerRadius={60}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-secondary-500">
                                            <DocumentIcon size={48} className="mx-auto mb-2 opacity-50" />
                                            <p>No data yet</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Right Column - Recent Documents & Progress */}
                <div className="space-y-4">
                    {/* Success Rate Card */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-primary-100 text-sm">Success Rate</p>
                                    <p className="text-3xl font-bold">{successRate}%</p>
                                </div>
                                <ProgressBar.Circle
                                    value={successRate}
                                    size={70}
                                    strokeWidth={6}
                                    variant="success"
                                    showLabel={false}
                                />
                            </div>
                            <ProgressBar
                                value={successRate}
                                variant="success"
                                size="sm"
                                className="opacity-80"
                            />
                        </Card>
                    </motion.div>

                    {/* Recent Documents */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Recent Documents</Card.Title>
                                <Link
                                    to="/documents"
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                >
                                    View all
                                    <ArrowRightIcon size={14} />
                                </Link>
                            </Card.Header>
                            <div className="space-y-1">
                                {loading ? (
                                    <Skeleton.List items={5} />
                                ) : recentDocs.length > 0 ? (
                                    recentDocs.map(doc => (
                                        <RecentDocItem key={doc.id} doc={doc} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-secondary-500">
                                        <DocumentIcon size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No documents yet</p>
                                        <p className="text-xs">Upload your first document to get started</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message="Please login to upload and analyze Aadhaar documents"
            />
        </motion.div>
    );
}

export default Dashboard;
