import React from 'react';

const variants = {
    default: 'bg-secondary-100 text-secondary-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-blue-100 text-blue-700',
};

const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

function Badge({ 
    children, 
    variant = 'default', 
    size = 'md',
    dot = false,
    icon: Icon,
    className = '' 
}) {
    return (
        <span 
            className={`
                inline-flex items-center gap-1.5 font-semibold rounded-full uppercase tracking-wide
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${
                    variant === 'success' ? 'bg-success-500' :
                    variant === 'warning' ? 'bg-warning-500' :
                    variant === 'error' ? 'bg-error-500' :
                    variant === 'primary' ? 'bg-primary-500' :
                    'bg-secondary-500'
                }`} />
            )}
            {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
            {children}
        </span>
    );
}

// Status-based badges
Badge.Status = function StatusBadge({ status, className = '' }) {
    const statusConfig = {
        completed: { variant: 'success', label: 'Verified', dot: true },
        verified: { variant: 'success', label: 'Verified', dot: true },
        suspicious: { variant: 'error', label: 'Suspicious', dot: true },
        fraud: { variant: 'error', label: 'Fraud', dot: true },
        processing: { variant: 'warning', label: 'Processing', dot: true },
        failed: { variant: 'error', label: 'Failed', dot: true },
        uploaded: { variant: 'primary', label: 'Uploaded', dot: true },
        pending: { variant: 'default', label: 'Pending', dot: true },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <Badge variant={config.variant} dot={config.dot} className={className}>
            {config.label}
        </Badge>
    );
};

// Risk level badges
Badge.Risk = function RiskBadge({ level, className = '' }) {
    const riskConfig = {
        low: { variant: 'success', label: 'Low Risk' },
        medium: { variant: 'warning', label: 'Medium Risk' },
        high: { variant: 'error', label: 'High Risk' },
    };

    const config = riskConfig[level] || riskConfig.low;

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
};

export default Badge;
