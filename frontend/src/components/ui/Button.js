import React from 'react';
import { motion } from 'framer-motion';
import { LoadingIcon } from '../icons/index';

const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-400',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-400 shadow-md hover:shadow-lg',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-400 shadow-md hover:shadow-lg',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-400 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-300',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-400',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline p-0',
};

const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2',
    xl: 'px-8 py-4 text-lg rounded-xl gap-3',
};

function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            className={`
                inline-flex items-center justify-center font-medium
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <>
                    <LoadingIcon size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />}
                </>
            )}
        </motion.button>
    );
}

export default Button;
