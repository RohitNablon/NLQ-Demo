import React from 'react';
import { cn } from '../lib/utils';
import { GlassPanel } from './GlassPanel';
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const VARIANTS = {
    sentiment: {
        color: 'text-cyan-400',
        borderColor: 'border-cyan-500/30',
        iconBg: 'bg-cyan-500/10',
        lineColor: '#06b6d4',
        shadow: 'shadow-cyan-900/20'
    },
    innovation: {
        color: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        iconBg: 'bg-purple-500/10',
        lineColor: '#a855f7',
        shadow: 'shadow-purple-900/20'
    },
    competitive: {
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/10',
        lineColor: '#10b981',
        shadow: 'shadow-emerald-900/20'
    },
    satisfaction: {
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        iconBg: 'bg-blue-500/10',
        lineColor: '#3b82f6',
        shadow: 'shadow-blue-900/20'
    }
};

export function ExecutiveGridCard({
    variant = 'sentiment',
    icon: Icon,
    title,
    value,
    subValue,
    change,
    changeLabel,
    sparklineData,
    children,
    className
}) {
    const style = VARIANTS[variant] || VARIANTS.sentiment;

    return (
        <GlassPanel className={cn(
            'flex flex-col h-full border transition-all duration-300 hover:shadow-lg',
            style.borderColor,
            style.shadow,
            className
        )}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg", style.iconBg)}>
                    {Icon && <Icon className={cn("w-5 h-5", style.color)} />}
                </div>

                {change && (
                    <div className={cn(
                        "px-2 py-1 rounded text-xs font-bold flex items-center gap-1",
                        change > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            change < 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    )}>
                        {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {change > 0 ? '+' : ''}{change}
                    </div>
                )}
            </div>

            {/* Main Metric */}
            <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
                    {subValue && <span className="text-lg text-gray-500">{subValue}</span>}
                </div>
                {changeLabel && <div className="text-xs text-gray-500 mt-1">{changeLabel}</div>}

                {/* Sparkline */}
                {sparklineData && (
                    <div className="h-8 w-full mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData.map((val, i) => ({ v: val, i }))}>
                                <Line
                                    type="monotone"
                                    dataKey="v"
                                    stroke={style.lineColor}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5 w-full mb-4" />

            {/* Content Slot (Lists, Progress Bars etc) */}
            <div className="flex-1 space-y-4">
                {children}
            </div>
        </GlassPanel>
    );
}

// Sub-components for standardizing content
export function GridList({ items }) {
    return (
        <ul className="space-y-3">
            {items.map((item, idx) => (
                <li key={idx} className="text-sm group">
                    <div className="font-medium text-white mb-0.5 flex items-center gap-2">
                        {item.status === 'success' && <CheckCircle size={14} className="text-emerald-400" />}
                        {item.status === 'warning' && <AlertTriangle size={14} className="text-amber-400" />}
                        {item.status === 'info' && <Info size={14} className="text-cyan-400" />}
                        {item.label}
                    </div>
                    <div className="text-xs text-gray-500 pl-6 relative">
                        {item.value}
                        {item.subtext && <span className="block text-gray-600 mt-0.5 italic">{item.subtext}</span>}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function GridProgress({ label, value, max = 100, color = 'bg-cyan-500', size = 'sm' }) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-bold">{value}</span>
            </div>
            <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", size === 'lg' ? 'h-2' : 'h-1')}>
                <div
                    className={cn("h-full rounded-full transition-all duration-500", color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
