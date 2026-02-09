import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { GlassPanel } from './GlassPanel';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Card with expandable details section
 * Used for strategic insights that can be explored further
 */
export function ExpandableCard({
    title,
    icon: Icon,
    children,
    expandedContent,
    expandLabel = "Learn More",
    defaultExpanded = false,
    className
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <GlassPanel className={cn('transition-all hover:border-white/20', className)}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                {Icon && (
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-white flex-1">{title}</h3>
            </div>

            {/* Main Content */}
            <div className="mb-4">
                {children}
            </div>

            {/* Expandable Section */}
            {expandedContent && (
                <>
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="text-gray-300 text-sm space-y-2">
                                {expandedContent}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 
                     border border-white/10 hover:border-white/20 transition-all
                     flex items-center justify-center gap-2 text-sm text-cyan-400"
                    >
                        <span>{isExpanded ? 'Show Less' : expandLabel}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </>
            )}
        </GlassPanel>
    );
}
