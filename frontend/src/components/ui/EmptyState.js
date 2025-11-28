import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DocumentIcon } from '../icons/index';

function EmptyState({ 
    icon: Icon = DocumentIcon,
    title = 'No data found',
    description = 'There is nothing to display here yet.',
    action,
    actionLabel = 'Get Started',
    actionLink,
    className = '' 
}) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
        >
            <div className="w-20 h-20 rounded-2xl bg-secondary-100 flex items-center justify-center mb-6">
                <Icon size={40} className="text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                {title}
            </h3>
            <p className="text-secondary-500 max-w-sm mb-6">
                {description}
            </p>
            {(action || actionLink) && (
                actionLink ? (
                    <Link 
                        to={actionLink}
                        className="btn btn-primary"
                    >
                        {actionLabel}
                    </Link>
                ) : (
                    <button 
                        onClick={action}
                        className="btn btn-primary"
                    >
                        {actionLabel}
                    </button>
                )
            )}
        </motion.div>
    );
}

export default EmptyState;
