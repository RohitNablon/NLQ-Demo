import React from 'react';
import { cn } from '../lib/utils';

export function GlassPanel({ children, className = '', borderColor = 'border-white/10', ...props }) {
    return (
        <div
            className={cn(
                'p-6 rounded-xl bg-white/5 backdrop-blur-sm pointer-events-auto',
                'hover:bg-white/[0.07] transition-all duration-200 border',
                borderColor,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
