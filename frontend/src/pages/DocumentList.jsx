import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { documentAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { 
    DocumentIcon, 
    DeleteIcon, 
    SearchIcon, 
    FilterIcon,
    CheckIcon,
    ImageIcon,
    ArrowRightIcon,
    MoreIcon
} from '../components/icons/index';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Filter options
const filterOptions = [
    { value: 'all', label: 'All Documents' },
    { value: 'verified', label: 'Verified' },
    { value: 'suspicious', label: 'Suspicious' },
    { value: 'processing', label: 'Processing' },
    { value: 'failed', label: 'Failed' },
    { value: 'uploaded', label: 'Uploaded' },
];

// Document Card Component
function DocumentCard({ doc, selectMode, isSelected, onSelect, onDelete }) {
    const [showMenu, setShowMenu] = useState(false);
    const fileName = doc.file_name || doc.filename || doc.name || 'Unknown';
    const thumbnailUrl = doc.thumbnail_url || doc.original_file_url || null;

    // Determine the actual verification status based on metadata
    const getDisplayStatus = () => {
        if (doc.status === 'completed') {
            // Check actual verification result
            if (doc.metadata?.is_authentic === true) {
                return 'verified';
            } else if (doc.metadata?.is_authentic === false) {
                return 'suspicious';
            }
        }
        // For non-completed docs, return the processing status
        return doc.status;
    };

    const displayStatus = getDisplayStatus();

    return (
        <div
            className={`
                relative group bg-white rounded-xl border overflow-hidden
                transition-all duration-300
                ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-secondary-200 hover:border-primary-300'}
                ${selectMode ? 'cursor-pointer' : ''}
            `}
            onClick={selectMode ? () => onSelect(doc.id) : undefined}
        >
            {/* Selection Checkbox */}
            {selectMode && (
                <div className="absolute top-3 left-3 z-10">
                    <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        transition-all duration-200
                        ${isSelected 
                            ? 'bg-primary-600 border-primary-600' 
                            : 'bg-white/80 border-secondary-300 group-hover:border-primary-400'
                        }
                    `}>
                        {isSelected && <CheckIcon size={14} className="text-white" />}
                    </div>
                </div>
            )}

            {/* Image */}
            <div className="relative h-44 bg-secondary-100 overflow-hidden">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={fileName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-secondary-300" />
                    </div>
                )}
                
                {/* Status Badge - Show actual verification status */}
                <div className="absolute top-3 right-3">
                    <Badge.Status status={displayStatus} />
                </div>

                {/* Risk Indicator */}
                {doc.metadata?.fraud_detection?.risk_level && (
                    <div className="absolute bottom-3 right-3">
                        <Badge.Risk level={doc.metadata.fraud_detection.risk_level} />
                    </div>
                )}

                {/* Overlay on hover */}
                {!selectMode && (
                    <Link 
                        to={`/documents/${doc.id}`}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                    >
                        <span className="text-white text-sm font-medium flex items-center gap-1">
                            View Details <ArrowRightIcon size={14} />
                        </span>
                    </Link>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                            {fileName}
                        </h3>
                        <p className="text-sm text-secondary-500 mt-1">
                            {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Actions Menu */}
                    {!selectMode && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                            >
                                <MoreIcon size={18} className="text-secondary-500" />
                            </button>
                            
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-secondary-200 py-1 z-20"
                                    >
                                        <Link
                                            to={`/documents/${doc.id}`}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                        >
                                            <DocumentIcon size={16} />
                                            View Details
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onDelete(doc.id);
                                                setShowMenu(false);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 w-full"
                                        >
                                            <DeleteIcon size={16} />
                                            Delete
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Confidence Score */}
                {doc.metadata?.confidence_score && (
                    <div className="mt-3 pt-3 border-t border-secondary-100">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary-500">Confidence</span>
                            <span className={`font-medium ${
                                doc.metadata.confidence_score >= 0.9 ? 'text-success-600' :
                                doc.metadata.confidence_score >= 0.7 ? 'text-warning-600' :
                                'text-error-600'
                            }`}>
                                {(doc.metadata.confidence_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DocumentList() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocs, setSelectedDocs] = useState(new Set());
    const [selectMode, setSelectMode] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { showSuccess, showError, showConfirm } = useToast();

    useEffect(() => {
        // Only check auth after loading is complete
        if (authLoading) return;
        
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            setShowAuthModal(false);
            fetchDocuments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, authLoading]);

    // Update filter when URL params change
    useEffect(() => {
        const urlFilter = searchParams.get('filter');
        if (urlFilter && urlFilter !== filterStatus) {
            setFilterStatus(urlFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentAPI.getAllDocuments();
            console.log('Fetched documents:', data);
            // Handle both array and object with results property
            const docs = Array.isArray(data) ? data : (data.results || data.documents || []);
            console.log('Processed docs:', docs);
            setDocuments(docs);
        } catch (error) {
            console.error('Error fetching documents:', error);
            showError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (documentId) => {
        const confirmed = await showConfirm({
            title: 'Delete Document',
            message: 'Are you sure you want to delete this document? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await documentAPI.deleteDocument(documentId);
            showSuccess('Document deleted successfully');
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            showError('Failed to delete document');
        }
    };

    const toggleSelectDoc = (docId) => {
        const newSelected = new Set(selectedDocs);
        if (newSelected.has(docId)) {
            newSelected.delete(docId);
        } else {
            newSelected.add(docId);
        }
        setSelectedDocs(newSelected);
    };

    const selectAll = () => {
        const allIds = new Set(filteredDocuments.map(doc => doc.id));
        setSelectedDocs(allIds);
    };

    const deselectAll = () => {
        setSelectedDocs(new Set());
    };

    const handleBatchDelete = async () => {
        if (selectedDocs.size === 0) return;

        const confirmed = await showConfirm({
            title: 'Delete Multiple Documents',
            message: `Are you sure you want to delete ${selectedDocs.size} document${selectedDocs.size > 1 ? 's' : ''}? This action cannot be undone.`,
            confirmText: `Delete ${selectedDocs.size} Document${selectedDocs.size > 1 ? 's' : ''}`,
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            setDeleting(true);
            const result = await documentAPI.batchDelete(Array.from(selectedDocs));
            showSuccess(`Successfully deleted ${result.deleted} document${result.deleted > 1 ? 's' : ''}`);
            setSelectedDocs(new Set());
            setSelectMode(false);
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting documents:', error);
            showError('Failed to delete documents');
        } finally {
            setDeleting(false);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        if (!doc) return false;
        
        let matchesFilter = false;
        
        if (filterStatus === 'all') {
            matchesFilter = true;
        } else if (filterStatus === 'verified') {
            // Show documents that are authentic (verified)
            matchesFilter = doc.status === 'completed' && doc.metadata?.is_authentic === true;
        } else if (filterStatus === 'suspicious') {
            // Show documents that are not authentic (suspicious/fraud)
            matchesFilter = doc.status === 'completed' && doc.metadata?.is_authentic === false;
        } else {
            // Original status-based filtering for processing, failed, uploaded
            matchesFilter = doc.status === filterStatus;
        }
        
        const fileName = doc.file_name || doc.filename || doc.name || '';
        const matchesSearch = fileName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    console.log('Documents state:', documents.length, 'Filtered:', filteredDocuments.length);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Documents</h1>
                    <p className="text-secondary-500 mt-1">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant={selectMode ? 'secondary' : 'outline'}
                        onClick={() => {
                            setSelectMode(!selectMode);
                            setSelectedDocs(new Set());
                        }}
                    >
                        {selectMode ? 'Cancel' : 'Select'}
                    </Button>
                    <Link to="/">
                        <Button variant="primary" icon={DocumentIcon}>
                            Upload New
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Filters & Search */}
            <motion.div variants={itemVariants}>
                <Card size="sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                            <FilterIcon size={18} className="text-secondary-400 flex-shrink-0" />
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilterStatus(option.value)}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                                        transition-all duration-200
                                        ${filterStatus === option.value
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                                        }
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Batch Actions Bar */}
            <AnimatePresence>
                {selectMode && selectedDocs.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="bg-primary-50 border-primary-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-primary-700">
                                        {selectedDocs.size} selected
                                    </span>
                                    <button
                                        onClick={selectAll}
                                        className="text-sm text-primary-600 hover:underline"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={deselectAll}
                                        className="text-sm text-primary-600 hover:underline"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                                <Button
                                    variant="danger"
                                    icon={DeleteIcon}
                                    onClick={handleBatchDelete}
                                    loading={deleting}
                                >
                                    Delete Selected
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Documents Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton.Card key={i} />
                    ))}
                </div>
            ) : filteredDocuments.length === 0 ? (
                <EmptyState
                    icon={DocumentIcon}
                    title={searchQuery || filterStatus !== 'all' ? 'No matching documents' : 'No documents yet'}
                    description={
                        searchQuery || filterStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Upload your first document from the dashboard to get started'
                    }
                    actionLabel="Go to Dashboard"
                    actionLink="/"
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDocuments.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            doc={doc}
                            selectMode={selectMode}
                            isSelected={selectedDocs.has(doc.id)}
                            onSelect={toggleSelectDoc}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
            
            {/* Auth Modal for non-authenticated users */}
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)}
                message="Please login to view and manage your documents"
            />
        </motion.div>
    );
}

export default DocumentList;
