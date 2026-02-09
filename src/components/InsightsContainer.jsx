import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AnalyticsDashboard from './AnalyticsDashboard';
import ChatInterface from './ChatInterface';
import SimpleNetworkGraph from './SimpleNetworkGraph';
import { useExecutionTracker } from '../hooks/useExecutionTracker';
import { ReactFlowProvider } from 'reactflow';

/**
 * Insights Container with Tabbed Interface
 * Tab 1: Insights Dashboard
 * Tab 2: Deep Dive (Chat + Network Graph)
 */
export default function InsightsContainer({ dbInfo, onNavigate }) {
    const [activeTab, setActiveTab] = useState("insights");
    const [selectedQuestion, setSelectedQuestion] = useState("");
    const [currentWorkflow, setCurrentWorkflow] = useState(null);
    const { executionState, updateExecutionState, reset } = useExecutionTracker();

    const handleWorkflowStart = (workflow) => {
        setCurrentWorkflow(workflow);
        reset();
    };

    const handleQuestionSelect = (question) => {
        console.log('Question selected from Insights:', question);
        if (question) {
            setSelectedQuestion(question);
            setActiveTab("deepdive");
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#09090b] font-['Jost']">
            {/* Reduced Header */}
            <div className="px-6 py-3 border-b border-white/10 flex-shrink-0 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white tracking-wide">{dbInfo?.name || 'Insights'}</h3>
                    </div>
                    {dbInfo?.status && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-emerald-400 text-xs font-medium tracking-wide">{dbInfo.status}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabbed Content - Premium Styling */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 pt-3 pb-2 flex-shrink-0">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg">
                        <TabsTrigger
                            value="insights"
                            className="text-gray-400 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-cyan-500/20 border border-transparent transition-all duration-300 font-medium px-4"
                        >
                            <span className="mr-2">📊</span> Insights
                        </TabsTrigger>
                        <TabsTrigger
                            value="deepdive"
                            className="text-gray-400 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 data-[state=active]:shadow-none data-[state=active]:border-purple-500/20 border border-transparent transition-all duration-300 font-medium px-4"
                        >
                            <span className="mr-2">🔍</span> Deep Dive
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab 1: Insights Dashboard - Scrollable */}
                <TabsContent value="insights" className="flex-1 overflow-y-auto mt-0 px-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                    <AnalyticsDashboard
                        dbInfo={dbInfo}
                        onQuestionSelect={handleQuestionSelect}
                        onNavigate={onNavigate}
                    />
                </TabsContent>

                {/* Tab 2: Deep Dive - Fixed height with internal scrolling */}
                <TabsContent value="deepdive" className="flex-1 overflow-hidden mt-0 px-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                    <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
                        {/* Left Panel: Chat (35%) */}
                        <div className="bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-2xl" style={{ flex: '0 0 35%', minWidth: 0 }}>
                            <ChatInterface
                                dbInfo={dbInfo}
                                onWorkflowStart={handleWorkflowStart}
                                updateExecutionState={updateExecutionState}
                                resetExecution={reset}
                                initialQuestion={selectedQuestion}
                            />
                        </div>

                        {/* Right Panel: Network Graph (65%) */}
                        <div className="bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative" style={{ flex: '1', minWidth: 0 }}>
                            {/* Graph Header Overlay */}
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
                                <h4 className="text-white font-medium text-sm bg-black/40 px-3 py-1 rounded backdrop-blur border border-white/5 self-start">
                                    Agent Neural Network
                                </h4>
                                {currentWorkflow && (
                                    <span className="text-xs text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-500/20 self-start animate-pulse">
                                        Live Execution
                                    </span>
                                )}
                            </div>

                            <ReactFlowProvider>
                                <SimpleNetworkGraph
                                    workflow={currentWorkflow}
                                    executionState={executionState}
                                    defaultVisible={true} // Force visibility
                                />
                            </ReactFlowProvider>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
