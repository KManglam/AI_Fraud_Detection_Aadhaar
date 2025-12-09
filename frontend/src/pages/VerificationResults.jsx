import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { documentAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import {
    ChartIcon,
    CheckIcon,
    ErrorIcon,
    DownloadIcon,
    SearchIcon,
    EyeIcon,
    DocumentIcon
} from '../components/icons/index';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
// EmptyState removed - not currently used
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

// itemVariants removed - reserved for future list animations

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

function VerificationResults() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('results');
    const [stats, setStats] = useState({
        total: 0,
        accepted: 0,
        rejected: 0
    });
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        // Only check auth after loading is complete
        if (authLoading) return;

        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            setShowAuthModal(false);
            fetchVerificationResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, authLoading]);

    const fetchVerificationResults = async () => {
        try {
            setLoading(true);
            const data = await documentAPI.getVerificationResults();
            setStats(data.stats || { total: 0, accepted: 0, rejected: 0 });
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Error fetching verification results:', error);
            showError('Failed to load verification results');
        } finally {
            setLoading(false);
        }
    };

    const getVerificationStatus = (doc) => {
        if (doc.metadata?.is_authentic === true) return 'completed';
        if (doc.metadata?.is_authentic === false) return 'failed';
        return 'processing';
    };

    const getDocumentType = (doc) => {
        return doc.metadata?.aadhaar_number ? 'Aadhaar Card' : 'Document';
    };

    // getFinalRemarks helper - for future use in expanded row details
    // eslint-disable-next-line no-unused-vars
    const getFinalRemarks = (doc) => {
        if (!doc.metadata) return 'Not analyzed';
        const { fraud_indicators, quality_issues, is_authentic } = doc.metadata;
        if (is_authentic === true) return 'Verification Successful';
        if (is_authentic === false) {
            if (fraud_indicators?.length > 0) return fraud_indicators[0];
            if (quality_issues?.length > 0) return quality_issues[0];
            return 'Verification Failed';
        }
        return 'Pending Analysis';
    };

    const handleDownloadExcel = async () => {
        try {
            setExporting(true);
            const blob = await documentAPI.exportExcel();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `verification_results_${timestamp}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showSuccess('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            showError('Failed to download report');
        } finally {
            setExporting(false);
        }
    };

    const getFilteredDocuments = () => {
        if (!searchTerm) return documents;
        return documents.filter(doc =>
            (doc.file_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            getDocumentType(doc).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getVerificationStatus(doc).toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const toggleRowExpansion = (docId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(docId)) {
            newExpanded.delete(docId);
        } else {
            newExpanded.add(docId);
        }
        setExpandedRows(newExpanded);
    };

    // Chart Data Helpers
    const getPieChartData = () => {
        if (stats.total === 0) return [];
        return [
            { name: 'Accepted', value: stats.accepted, color: '#10b981' },
            { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
        ];
    };

    const getTimelineData = () => {
        const dateGroups = {};
        documents.forEach(doc => {
            const date = new Date(doc.uploaded_at).toLocaleDateString();
            if (!dateGroups[date]) {
                dateGroups[date] = { date, accepted: 0, rejected: 0, total: 0 };
            }
            dateGroups[date].total++;
            if (doc.metadata?.is_authentic === true) {
                dateGroups[date].accepted++;
            } else if (doc.metadata?.is_authentic === false) {
                dateGroups[date].rejected++;
            }
        });
        return Object.values(dateGroups).slice(-7);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton.Stat key={i} />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Verification Results</h1>
                    <p className="text-secondary-500 mt-1">
                        Detailed analysis and verification reports
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        icon={DownloadIcon}
                        onClick={handleDownloadExcel}
                        loading={exporting}
                        disabled={documents.length === 0}
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                            <ChartIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Total Documents</p>
                            <h3 className="text-2xl font-bold text-secondary-900">{stats.total}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success-100 text-success-600 rounded-lg">
                            <CheckIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Verified Authentic</p>
                            <h3 className="text-2xl font-bold text-secondary-900">{stats.accepted}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-error-100 text-error-600 rounded-lg">
                            <ErrorIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Failed Verification</p>
                            <h3 className="text-2xl font-bold text-secondary-900">{stats.rejected}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="space-y-6">
                <div className="border-b border-secondary-200">
                    <div className="flex items-center gap-8">
                        {['results', 'charts'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    pb-4 text-sm font-medium capitalize transition-colors relative
                                    ${activeTab === tab ? 'text-primary-600' : 'text-secondary-500 hover:text-secondary-900'}
                                `}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'results' ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Search */}
                            <div className="max-w-md">
                                <div className="relative">
                                    <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        placeholder="Search results..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <Card className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-secondary-50 border-b border-secondary-200">
                                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Document</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Confidence</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary-200">
                                            {getFilteredDocuments().map((doc) => (
                                                <React.Fragment key={doc.id}>
                                                    <tr className="hover:bg-secondary-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-secondary-100 rounded-lg text-secondary-500">
                                                                    <DocumentIcon size={20} />
                                                                </div>
                                                                <span className="font-medium text-secondary-900">{doc.file_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-secondary-600">
                                                            {getDocumentType(doc)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge.Status status={getVerificationStatus(doc)} />
                                                        </td>
                                                        <td className="px-6 py-4 text-secondary-600">
                                                            {doc.metadata?.confidence_score
                                                                ? `${(doc.metadata.confidence_score * 100).toFixed(0)}%`
                                                                : '-'
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-secondary-600">
                                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Link to={`/documents/${doc.id}`}>
                                                                    <Button size="sm" variant="ghost" icon={EyeIcon}>
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => toggleRowExpansion(doc.id)}
                                                                >
                                                                    {expandedRows.has(doc.id) ? 'Hide Details' : 'Show Details'}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Expanded Row */}
                                                    {expandedRows.has(doc.id) && (
                                                        <tr className="bg-secondary-50/50">
                                                            <td colSpan="6" className="px-6 py-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                                                                            Extracted Info
                                                                        </h4>
                                                                        <dl className="space-y-2 text-sm">
                                                                            <div className="flex justify-between">
                                                                                <dt className="text-secondary-500">Name:</dt>
                                                                                <dd className="font-medium text-secondary-900">{normalizeValue(doc.metadata?.name) || '-'}</dd>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <dt className="text-secondary-500">Aadhaar No:</dt>
                                                                                <dd className="font-medium text-secondary-900">{normalizeValue(doc.metadata?.aadhaar_number) || '-'}</dd>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <dt className="text-secondary-500">DOB:</dt>
                                                                                <dd className="font-medium text-secondary-900">{normalizeValue(doc.metadata?.date_of_birth) || '-'}</dd>
                                                                            </div>
                                                                        </dl>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                                                                            Fraud Indicators
                                                                        </h4>
                                                                        {doc.metadata?.fraud_indicators?.length > 0 ? (
                                                                            <ul className="space-y-1">
                                                                                {doc.metadata.fraud_indicators.map((indicator, idx) => (
                                                                                    <li key={idx} className="text-sm text-error-600 flex items-center gap-2">
                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-error-500" />
                                                                                        {normalizeValue(indicator)}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : (
                                                                            <p className="text-sm text-success-600 flex items-center gap-2">
                                                                                <CheckIcon size={14} /> No fraud detected
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                                                                            Quality Issues
                                                                        </h4>
                                                                        {doc.metadata?.quality_issues?.length > 0 ? (
                                                                            <ul className="space-y-1">
                                                                                {doc.metadata.quality_issues.map((issue, idx) => (
                                                                                    <li key={idx} className="text-sm text-warning-600 flex items-center gap-2">
                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                                                                                        {normalizeValue(issue)}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : (
                                                                            <p className="text-sm text-secondary-500">No quality issues</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                    {getFilteredDocuments().length === 0 && (
                                        <div className="p-8 text-center">
                                            <p className="text-secondary-500">No documents found matching your search</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="charts"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Pie Chart */}
                            <Card>
                                <Card.Header>
                                    <Card.Title>Verification Status Distribution</Card.Title>
                                    <Card.Description>Overview of accepted vs rejected documents</Card.Description>
                                </Card.Header>
                                <Card.Content>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getPieChartData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {getPieChartData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Content>
                            </Card>

                            {/* Bar Chart */}
                            <Card>
                                <Card.Header>
                                    <Card.Title>Verification Timeline</Card.Title>
                                    <Card.Description>Activity over the last 7 days</Card.Description>
                                </Card.Header>
                                <Card.Content>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={getTimelineData()}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                                <YAxis stroke="#64748b" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                />
                                                <Legend />
                                                <Bar dataKey="accepted" fill="#10b981" name="Accepted" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Content>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Auth Modal for non-authenticated users */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message="Please login to view verification results"
            />
        </motion.div>
    );
}

export default VerificationResults;
