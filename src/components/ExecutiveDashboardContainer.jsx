import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ExecutiveDashboard from './ExecutiveDashboard';
import PlatformIntelligence from './PlatformIntelligence';
import { LayoutDashboard, ServerCog } from 'lucide-react';

/**
 * Top-level container for the Dashboard section
 * Manages the two main views:
 * 1. Executive Summary (Business Focus)
 * 2. Platform Intelligence (Technical Focus)
 */
export default function ExecutiveDashboardContainer({ onNavigate }) {
    return (
        <div className="h-full flex flex-col bg-[#09090b] overflow-hidden">
            <Tabs defaultValue="executive" className="flex-1 flex flex-col min-h-0">
                {/* Header Area with Tabs */}
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-[#09090b] z-10">
                    <TabsList className="bg-white/5 border border-white/10 p-1">
                        <TabsTrigger
                            value="executive"
                            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex items-center gap-2 px-4"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Executive Summary
                        </TabsTrigger>
                        <TabsTrigger
                            value="platform"
                            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 flex items-center gap-2 px-4"
                        >
                            <ServerCog className="w-4 h-4" />
                            Platform Intelligence
                        </TabsTrigger>
                    </TabsList>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-gray-300 transition-colors">
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Tab Content Areas - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-[#09090b]">
                    <TabsContent value="executive" className="mt-0 h-full">
                        <ExecutiveDashboard onNavigate={onNavigate} />
                    </TabsContent>

                    <TabsContent value="platform" className="mt-0 h-full">
                        <PlatformIntelligence />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
