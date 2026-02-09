import React from 'react';
import { cn } from '../lib/utils';
import { ThumbsUp, Shield, Wrench, Zap, ArrowRight } from 'lucide-react';

const VARIANTS = {
    capitalize: {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: ThumbsUp,
        label: 'CAPITALIZE'
    },
    defend: {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: Shield,
        label: 'DEFEND'
    },
    fix: {
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        icon: Wrench,
        label: 'FIX'
    },
    accelerate: {
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        icon: Zap,
        label: 'ACCELERATE'
    }
};

export function StrategicPriorityCard({ variant, title, metric, subtitle, actionLabel, onClick }) {
    const style = VARIANTS[variant] || VARIANTS.capitalize;
    const Icon = style.icon;

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative p-4 rounded-xl border bg-[#18181b]/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden",
                style.border,
                `hover:${style.border.replace('/20', '/40')}`
            )}
        >
            {/* Hover Glow Effect */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/5 to-transparent"
            )} />

            <div className="flex items-start gap-4 relatie z-10">
                {/* Icon Box */}
                <div className={cn("p-2.5 rounded-lg flex-shrink-0", style.bg, style.border, "border")}>
                    <Icon className={cn("w-5 h-5", style.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className={cn("text-[10px] font-bold tracking-widest mb-1.5 uppercase", style.color)}>
                        {style.label}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug mb-1">
                        {title}
                        {metric && <span className="text-gray-400 font-normal ml-1.5">{metric}</span>}
                    </h3>

                    <p className="text-xs text-gray-400 font-medium">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Action Icon (appears on hover) */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowRight className={cn("w-4 h-4", style.color)} />
            </div>
        </div>
    );
}
