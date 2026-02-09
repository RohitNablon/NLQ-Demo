import React from 'react';
import { cn } from '../lib/utils';
import { Activity } from 'lucide-react';

/**
 * Static Top Branding Bar
 * Shows product name + tagline on left, Live status on right
 * Aligned with 'Catalyst AI' design (Lego Gold Standard)
 */
export default function TopBrandingBar() {
    return (
        <div className="h-16 bg-[#09090b] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 z-50 relative">
            {/* Left: Product Branding */}
            <div className="flex items-center h-full">
                {/* Logo Area */}
                <div className="flex items-center mr-6">
                    <div className="w-auto h-8 flex items-center justify-center">
                        {/* Using the text logo style as per user description of 'neat' and 'not elongated' */}
                        {/* If image is preferred, we use the specific asset, but contained tightly */}
                        <div className="bg-[#051c2c] px-3 py-1.5 rounded border border-blue-900/30 flex items-center justify-center">
                            <span className="text-white font-bold tracking-widest text-xs">NABLON</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-white/10 mr-6"></div>

                {/* Product Name */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 font-sans tracking-tight">
                            Envoy
                        </span>
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200 font-sans tracking-tight">
                            AI
                        </span>
                    </div>
                    <span className="text-gray-500 text-xs font-medium tracking-wide uppercase">
                        Agentic Analytics Platform
                    </span>
                </div>
            </div>

            {/* Right: Live Status & User Profile Placeholder */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-emerald-400 text-xs font-medium tracking-wide">SYSTEM LIVE</span>
                </div>

                {/* User Avatar Placeholder - optional but adds to the header feel */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs text-white font-bold">
                    JD
                </div>
            </div>
        </div>
    );
}
