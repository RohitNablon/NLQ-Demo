import React from 'react';
import { cn } from '../lib/utils';

export function Button({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}) {
    const variantClasses = {
        primary: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20',
        success: 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
        ghost: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
        outline: 'bg-transparent text-white border border-white/20 hover:bg-white/5',
        link: 'bg-transparent text-cyan-400 border-none hover:text-cyan-300 hover:underline'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
    };

    const iconSizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6'
    };

    return (
        <button
            className={cn(
                'rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizeClasses[size])} />
            )}
            {!isLoading && Icon && iconPosition === 'left' && <Icon className={iconSizeClasses[size]} />}
            {children}
            {!isLoading && Icon && iconPosition === 'right' && <Icon className={iconSizeClasses[size]} />}
        </button>
    );
}
