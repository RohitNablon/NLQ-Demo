import React from 'react';
import { cn } from '../lib/utils';
import { GlassPanel } from './GlassPanel';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, Cell, ResponsiveContainer } from 'recharts';

/**
 * Large format KPI card for hero section
 * Supports sparklines, breakdown bars, and mini charts
 */
export function HeroKPICard({
    icon: Icon,
    value,
    label,
    change,
    changeLabel,
    trend,
    breakdown,
    sparklineData,
    children,
    className
}) {
    return (
        <GlassPanel className={cn('transition-all hover:border-white/20', className)}>
            {/* Header with Icon */}
            {Icon && (
                <div className="mb-4">
                    <div className="inline-flex p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                </div>
            )}

            {/* Main Value */}
            <div className="mb-2">
                <h3 className="text-4xl font-bold text-white">
                    {value}
                </h3>
            </div>

            {/* Label */}
            <p className="text-gray-400 text-sm mb-3">{label}</p>

            {/* Change Indicator */}
            {change && (
                <div className="flex items-center gap-2 mb-4">
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                    <span className={cn(
                        'text-sm font-medium',
                        trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
                    )}>
                        {change} {changeLabel}
                    </span>
                </div>
            )}

            {/* Breakdown Bars */}
            {breakdown && breakdown.length > 0 && (
                <div className="space-y-2 mb-4">
                    {breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-400">{item.label}</span>
                                    <span className="text-xs text-gray-300">{item.percentage}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color || '#06b6d4'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
                <div className="h-12 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData.map((val, idx) => ({ value: val, idx }))}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Custom Children */}
            {children}
        </GlassPanel>
    );
}
