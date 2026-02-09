import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function KPICard({
    title,
    value,
    change,
    trend = 'up',
    icon: Icon,
    color = 'cyan',
    className
}) {
    const colorClasses = {
        cyan: {
            icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            trend: trend === 'up' ? 'text-cyan-400' : 'text-red-400'
        },
        green: {
            icon: 'bg-green-500/10 text-green-400 border-green-500/20',
            trend: trend === 'up' ? 'text-green-400' : 'text-red-400'
        },
        purple: {
            icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            trend: trend === 'up' ? 'text-purple-400' : 'text-red-400'
        },
        yellow: {
            icon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            trend: trend === 'up' ? 'text-yellow-400' : 'text-red-400'
        }
    };

    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

    return (
        <div className={cn(
            'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6',
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-2">{value}</p>
                    {change !== undefined && (
                        <div className="flex items-center gap-1">
                            <TrendIcon className={cn('w-4 h-4', colorClasses[color].trend)} />
                            <span className={cn('text-sm font-medium', colorClasses[color].trend)}>
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={cn(
                        'p-3 rounded-lg border',
                        colorClasses[color].icon
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
