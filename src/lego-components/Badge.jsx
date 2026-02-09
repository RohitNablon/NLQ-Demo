import React from 'react';
import { cn } from '../lib/utils';

export function Badge({ children, variant = 'cyan', size = 'md', className }) {
    const variantClasses = {
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs'
    };

    return (
        <span className={cn(
            'inline-flex items-center border rounded-full font-medium',
            variantClasses[variant],
            sizeClasses[size],
            className
        )}>
            {children}
        </span>
    );
}
