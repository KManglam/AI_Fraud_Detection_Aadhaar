import React from 'react';

function Skeleton({ className = '', variant = 'default', ...props }) {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 bg-[length:200%_100%]';
    
    const variants = {
        default: 'rounded',
        text: 'rounded h-4',
        title: 'rounded h-6 w-3/4',
        avatar: 'rounded-full',
        card: 'rounded-xl',
        button: 'rounded-lg h-10',
    };

    return (
        <div 
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{ animation: 'shimmer 2s linear infinite' }}
            {...props}
        />
    );
}

// Skeleton presets
Skeleton.Card = function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white rounded-xl border border-secondary-200 p-6 ${className}`}>
            <Skeleton className="h-40 w-full rounded-lg mb-4" />
            <Skeleton variant="title" className="mb-2" />
            <Skeleton variant="text" className="w-full mb-1" />
            <Skeleton variant="text" className="w-2/3" />
        </div>
    );
};

Skeleton.Stat = function SkeletonStat({ className = '' }) {
    return (
        <div className={`bg-white rounded-xl border border-secondary-200 p-6 ${className}`}>
            <Skeleton variant="text" className="w-24 mb-3" />
            <Skeleton className="h-10 w-20 rounded" />
        </div>
    );
};

Skeleton.Table = function SkeletonTable({ rows = 5, className = '' }) {
    return (
        <div className={`bg-white rounded-xl border border-secondary-200 overflow-hidden ${className}`}>
            <div className="p-4 border-b border-secondary-200">
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="p-4 border-b border-secondary-100 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                        <Skeleton variant="text" className="w-1/3 mb-1" />
                        <Skeleton variant="text" className="w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            ))}
        </div>
    );
};

Skeleton.List = function SkeletonList({ items = 5, className = '' }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {[...Array(items)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary-100">
                    <Skeleton className="h-3 w-3 rounded-full flex-shrink-0" />
                    <Skeleton variant="text" className="flex-1" />
                    <Skeleton variant="text" className="w-20" />
                </div>
            ))}
        </div>
    );
};

export default Skeleton;
