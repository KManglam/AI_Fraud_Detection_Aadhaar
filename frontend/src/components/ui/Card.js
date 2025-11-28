import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    default: 'bg-white border border-secondary-200 shadow-card',
    elevated: 'bg-white border border-secondary-100 shadow-lg',
    outline: 'bg-transparent border-2 border-secondary-200',
    ghost: 'bg-secondary-50 border border-transparent',
    gradient: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0',
};

const sizes = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl',
};

function Card({ 
    children, 
    variant = 'default', 
    size = 'md', 
    hover = false,
    onClick,
    className = '',
    animate = true,
    ...props 
}) {
    const Component = animate ? motion.div : 'div';
    const animationProps = animate ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        whileHover: hover ? { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {},
    } : {};

    return (
        <Component
            className={`
                ${variants[variant]}
                ${sizes[size]}
                ${hover ? 'cursor-pointer transition-all duration-300' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={onClick}
            {...animationProps}
            {...props}
        >
            {children}
        </Component>
    );
}

// Card subcomponents
Card.Header = function CardHeader({ children, className = '' }) {
    return (
        <div className={`flex items-center justify-between mb-4 pb-4 border-b border-secondary-100 ${className}`}>
            {children}
        </div>
    );
};

Card.Title = function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-lg font-semibold text-secondary-900 ${className}`}>
            {children}
        </h3>
    );
};

Card.Description = function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-secondary-500 ${className}`}>
            {children}
        </p>
    );
};

Card.Content = function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
};

Card.Footer = function CardFooter({ children, className = '' }) {
    return (
        <div className={`mt-4 pt-4 border-t border-secondary-100 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
