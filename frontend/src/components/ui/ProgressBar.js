import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    default: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
};

const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
};

function ProgressBar({ 
    value = 0, 
    max = 100, 
    variant = 'default',
    size = 'md',
    showLabel = false,
    animated = true,
    className = '' 
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-secondary-700">Progress</span>
                    <span className="text-sm font-medium text-secondary-500">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`w-full bg-secondary-200 rounded-full overflow-hidden ${sizes[size]}`}>
                <motion.div
                    className={`${sizes[size]} rounded-full ${variants[variant]}`}
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

// Circular progress variant
ProgressBar.Circle = function CircleProgress({ 
    value = 0, 
    max = 100, 
    size = 80,
    strokeWidth = 8,
    variant = 'default',
    showLabel = true,
    className = '' 
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colorMap = {
        default: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colorMap[variant]}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            {showLabel && (
                <span className="absolute text-lg font-bold text-secondary-900">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
};

export default ProgressBar;
