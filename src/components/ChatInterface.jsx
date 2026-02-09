import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Trash2, Loader2, Sparkles, User, Bot, ArrowRight, HelpCircle, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import curatedQuestions from '../mock-data/curated-questions.json';
import workflows from '../mock-data/workflows.json';
import { cn } from '../lib/utils';

/**
 * Thinking Process Component (Presentational)
 */
function ThinkingProcess({ steps, isOpen, onToggle, className }) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className={cn("rounded-xl border border-purple-500/20 overflow-hidden bg-[#1a1d2e]/80 backdrop-blur-sm mb-4 transition-all duration-300", className)}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 bg-purple-500/5 hover:bg-purple-500/10 transition-colors text-left"
            >
                <div className="flex items-center gap-2.5">
                    {isOpen ? <ChevronDown size={14} className="text-purple-400" /> : <ChevronRight size={14} className="text-purple-400" />}
                    <span className="text-sm font-medium text-gray-200">
                        Thinking Process <span className="text-gray-500 ml-1">({steps.length} steps)</span>
                    </span>
                    {steps.every(s => s.status === 'completed') && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 font-medium">
                            Complete
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="p-4 space-y-3 bg-[#09090b]/30">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {step.status === 'completed' ? (
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                ) : step.status === 'active' ? (
                                    <Loader2 size={14} className="text-pink-400 animate-spin" />
                                ) : (
                                    <Circle size={14} className="text-gray-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={cn(
                                    "text-xs font-mono",
                                    step.status === 'active' ? "text-pink-200" :
                                        step.status === 'completed' ? "text-gray-400" : "text-gray-600"
                                )}>
                                    {step.label}
                                </p>
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {step.duration ? `${step.duration}ms` : ''}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Stateful wrapper for ThinkingProcess in history
 */
function ThinkingProcessHistoryItem({ steps }) {
    const [isOpen, setIsOpen] = useState(false);
    return <ThinkingProcess steps={steps} isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} className="w-full max-w-md" />;
}

/**
 * Premium Chat Interface
 */
export default function ChatInterface({ dbInfo, onWorkflowStart, updateExecutionState, resetExecution, initialQuestion }) {
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Thinking Process State
    const [thinkingSteps, setThinkingSteps] = useState([]); // For CURRENT execution
    const [isThinkingOpen, setIsThinkingOpen] = useState(true);

    const messagesEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, thinkingSteps, isThinkingOpen]);

    // Handle Initial Question (Deep Link)
    useEffect(() => {
        if (initialQuestion && initialQuestion.trim() !== '') {
            // setQuery(initialQuestion); // Optional: if you want it in the input
            processQuery(initialQuestion);
        }
    }, [initialQuestion]);

    // Initial Welcome Message & Suggestions
    useEffect(() => {
        if (messages.length === 0 && dbInfo) {
            // Find relevant suggestions
            const curatedForDb = curatedQuestions.filter(q => q.database === dbInfo?.id);
            const suggestions = curatedForDb
                .sort((a, b) => (a.workflowId ? -1 : 1)) // Prioritize ones with workflowId
                .slice(0, 4);

            setMessages([
                {
                    role: 'assistant',
                    content: `Hello! I'm your **${dbInfo.name}** AI Agent. \n\nI'm ready to run deep investigations on your data. Select a common query below or ask something specific.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isWelcome: true,
                    suggestions: suggestions
                }
            ]);
        }
    }, [dbInfo]);

    const handleClearHistory = () => {
        setMessages([]);
        if (resetExecution) resetExecution();
    };

    const processQuery = async (userQuery) => {
        if (!userQuery.trim() || loading) return;

        setQuery('');

        // 1. Add User Message
        const newMessage = {
            role: 'user',
            content: userQuery,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);
        setLoading(true);
        setIsThinkingOpen(true);
        setThinkingSteps([]); // Reset steps

        // Reset Graph
        if (resetExecution) resetExecution();

        // 2. Find Workflow Match
        const curatedForDb = curatedQuestions.filter(q => q.database === dbInfo?.id);
        let match = findCuratedQuestion(userQuery, curatedForDb);
        let workflow = null;

        if (match && match.workflowId) {
            workflow = workflows[dbInfo.id]?.[match.workflowId];
        }

        // 2.5 If no curated match, check workflows.json directly (for follow-ups)
        if (!workflow && workflows[dbInfo.id]) {
            const allWorkflows = Object.values(workflows[dbInfo.id]);
            workflow = findWorkflowByQuestion(userQuery, allWorkflows);
        }

        if (workflow) {
            console.log('Workflow found:', workflow);
            if (workflow) {
                // 3. Start Workflow Visualization (Graph)
                if (onWorkflowStart) onWorkflowStart(workflow);

                // 4. Simulate Execution Delay (Synchronized with Graph)
                const completedSteps = await simulateAgentExecution(workflow.agents);

                // 5. Add Assistant Response ONLY after processing
                const assistantResponse = {
                    role: 'assistant',
                    content: workflow.answer,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    followUps: workflow.followUp || [],
                    chart: workflow.chart, // Pass chart data
                    thinkingSteps: completedSteps // Attach the finished steps
                };
                setMessages(prev => [...prev, assistantResponse]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I recognize this query, but the workflow is not fully configured yet." }]);
            }
        } else {
            // Fallback Logic
            console.log('No workflow match. Using fallback.');
            // Init fallback steps
            const fallbackAgents = [
                { id: 'intent', name: 'Intent Classifier', type: 'system' },
                { id: 'search', name: 'Knowledge Graph Search', type: 'retrieval' },
                { id: 'synthesis', name: 'Answer Synthesis', type: 'generation' }
            ];
            const completedSteps = await simulateAgentExecution(fallbackAgents);

            const fallback = generateGracefulFallback(userQuery, curatedForDb);
            setMessages(prev => [...prev, {
                ...fallback,
                role: 'assistant',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                thinkingSteps: completedSteps
            }]);
        }

        setLoading(false);
        setThinkingSteps([]); // Clear temporary steps
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        processQuery(query);
    };

    // Helper: Find Workflow directly
    const findWorkflowByQuestion = (query, workflowList) => {
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const normalizedQuery = normalize(query);

        return workflowList.find(w => {
            if (!w.question) return false;
            const normalizedQ = normalize(w.question);
            return normalizedQ === normalizedQuery || normalizedQ.includes(normalizedQuery) || normalizedQuery.includes(normalizedQ);
        });
    };

    // Helper: Find Question
    const findCuratedQuestion = (query, questions) => {
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const normalizedQuery = normalize(query);

        // Exact (Normalized)
        let match = questions.find(q => normalize(q.question) === normalizedQuery);

        // Fuzzy
        if (!match) {
            match = questions.find(q => {
                const qWords = normalize(q.question).split(/\s+/);
                const uWords = normalizedQuery.split(/\s+/);
                const hits = uWords.filter(w => qWords.some(qw => qw.includes(w))).length;
                return (hits / uWords.length) > 0.6;
            });
        }
        return match;
    };

    // Helper: Simulate Execution (The 8s delay logic w/ Steps)
    const simulateAgentExecution = async (agents) => {
        // Calculate total time or enforce minimum 8s
        const totalDuration = agents.reduce((sum, a) => sum + (a.duration || 1), 0) * 1000;
        const minTime = 8000;
        const executionTime = Math.max(totalDuration, minTime);
        const stepTime = executionTime / agents.length;

        // Initialize Steps
        const steps = agents.map(a => ({
            id: a.id,
            label: `Agent: ${a.name} (${a.type || 'processing'})`,
            status: 'pending'
        }));
        setThinkingSteps(steps);

        const finalSteps = [...steps];

        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const start = Date.now();

            // Update Active
            setThinkingSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'active' } : s));

            // Update Graph State
            if (updateExecutionState) {
                updateExecutionState({ type: 'agent_start', agent: agent.id, name: agent.name });
            }

            // Wait
            await new Promise(r => setTimeout(r, stepTime));
            const duration = Date.now() - start;

            // Complete Agent & Update Graph
            if (updateExecutionState) {
                updateExecutionState({ type: 'agent_complete', agent: agent.id });
            }

            // Update Completed in Steps
            const updated = { ...finalSteps[i], status: 'completed', duration };
            finalSteps[i] = updated;

            setThinkingSteps(prev => {
                const newSteps = [...prev];
                newSteps[i] = updated;
                return newSteps;
            });
        }
        return finalSteps;
    };

    // Helper: Fallback
    const generateGracefulFallback = (query, questions) => {
        const suggestions = questions.slice(0, 3);
        return {
            content: `I don't have a specific workflow for that yet. Based on the **${dbInfo?.name}** metadata, here are some things I *can* answer:`,
            followUps: suggestions.map(s => s.question)
        };
    };

    const handleSuggestionClick = (text) => {
        setQuery(text); // Visual update
        setTimeout(() => processQuery(text), 0); // Trigger processing
    };

    return (
        <div className="flex flex-col h-full bg-[#0f1419] font-['Jost'] text-gray-100 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f1419]/80 backdrop-blur-sm absolute top-0 w-full z-10 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Sparkles size={16} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white leading-tight">Deep Insights</h3>
                        <p className="text-[10px] text-gray-500">Powered by DeepAgent</p>
                    </div>
                </div>
                <button onClick={handleClearHistory} className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-red-400">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 pt-16 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'user'
                            ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                            : 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400'
                            }`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>

                        {/* Bubble Content Key */}
                        <div className={`flex flex-col max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                            {/* Thinking Process (Attached to History) */}
                            {msg.role === 'assistant' && msg.thinkingSteps && (
                                <ThinkingProcessHistoryItem steps={msg.thinkingSteps} />
                            )}

                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm border ${msg.role === 'user'
                                ? 'bg-indigo-600/90 text-white rounded-tr-sm border-indigo-500/50 shadow-indigo-500/10'
                                : 'bg-[#27272a]/80 text-gray-200 rounded-tl-sm border-white/5 shadow-black/20'
                                }`}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                        strong: ({ node, ...props }) => <span className="font-semibold text-white" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                        li: ({ node, ...props }) => <li className="marker:text-gray-500" {...props} />,
                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-4 rounded-lg border border-white/10 shadow-lg"><table className="w-full text-sm text-left border-collapse" {...props} /></div>,
                                        thead: ({ node, ...props }) => <thead className="bg-white/5 text-gray-400 uppercase text-xs tracking-wider" {...props} />,
                                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/5" {...props} />,
                                        tr: ({ node, ...props }) => <tr className="hover:bg-white/5 transition-colors duration-150" {...props} />,
                                        th: ({ node, ...props }) => <th className="px-4 py-3 font-medium text-gray-300 border-b border-white/10" {...props} />,
                                        td: ({ node, ...props }) => <td className="px-4 py-3 text-gray-300 border-b border-white/5" {...props} />,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>

                                {/* Dynamic Chart Rendering */}
                                {msg.chart && (
                                    <div className="mt-6 mb-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                {msg.chart.title}
                                            </h4>
                                        </div>
                                        <div className="h-64 w-full bg-black/20 rounded-xl border border-white/5 p-4 mx-auto">
                                            <ResponsiveContainer width="100%" height="100%">
                                                {msg.chart.type === 'line' ? (
                                                    <LineChart data={msg.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                        <XAxis
                                                            dataKey={msg.chart.xAxisKey}
                                                            stroke="#666"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <YAxis
                                                            stroke="#666"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickFormatter={(value) => value >= 1000 ? `$${value / 1000}k` : value}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ color: '#e5e7eb', fontSize: '12px' }}
                                                            cursor={{ stroke: '#ffffff20' }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey={msg.chart.seriesKey}
                                                            stroke="#8b5cf6"
                                                            strokeWidth={3}
                                                            dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                                                            activeDot={{ r: 6, fill: '#fff' }}
                                                            animationDuration={1500}
                                                        />
                                                    </LineChart>
                                                ) : msg.chart.type === 'area' ? (
                                                    <AreaChart data={msg.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                        <XAxis
                                                            dataKey={msg.chart.xAxisKey}
                                                            stroke="#666"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <YAxis
                                                            stroke="#666"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickFormatter={(value) => value >= 1000 ? `$${value / 1000}k` : value}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ color: '#e5e7eb', fontSize: '12px' }}
                                                            cursor={{ stroke: '#ffffff20' }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey={msg.chart.seriesKey}
                                                            stroke="#8b5cf6"
                                                            fillOpacity={1}
                                                            fill="url(#colorArea)"
                                                            strokeWidth={3}
                                                            animationDuration={1500}
                                                        />
                                                    </AreaChart>
                                                ) : (
                                                    <BarChart data={msg.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                        <XAxis
                                                            dataKey={msg.chart.xAxisKey}
                                                            stroke="#666"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <YAxis
                                                            stroke="#666"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickFormatter={(value) => value >= 1000 ? `$${value / 1000}k` : value}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ color: '#e5e7eb', fontSize: '12px' }}
                                                            cursor={{ fill: '#ffffff05' }}
                                                        />
                                                        <Bar
                                                            dataKey={msg.chart.seriesKey}
                                                            fill="#8b5cf6"
                                                            radius={[4, 4, 0, 0]}
                                                            barSize={30}
                                                            animationDuration={1500}
                                                        >
                                                            {msg.chart.data.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={index < 3 ? '#8b5cf6' : '#6366f1'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                )}
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Suggestions / Follow-ups */}
                            {(msg.suggestions || msg.followUps) && (
                                <div className="space-y-2 w-full">
                                    {msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Most Frequent Queries</p>
                                            {msg.suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSuggestionClick(s.question)}
                                                    className="p-3 text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg text-gray-300 hover:text-cyan-300 transition-all group flex items-start gap-2"
                                                >
                                                    <span className="text-lg opacity-50 bg-white/5 p-1 rounded group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:opacity-100 transition-all">{s.icon || '❔'}</span>
                                                    <div>
                                                        <div className="font-medium mb-0.5">{s.question}</div>
                                                        <div className="text-[10px] text-gray-500">{s.category} • {s.complexity}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.followUps && msg.followUps.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.followUps.map((fu, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSuggestionClick(fu)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-full text-xs text-cyan-300 transition-all group"
                                                >
                                                    <HelpCircle size={12} className="opacity-50 group-hover:opacity-100" />
                                                    {fu}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timestamp */}
                            <span className="text-[10px] text-gray-500 px-1">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator (Active Thinking Process) */}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <Bot size={14} className="text-cyan-400" />
                        </div>
                        <div className="flex-1 max-w-[85%]">
                            <ThinkingProcess
                                steps={thinkingSteps}
                                isOpen={isThinkingOpen}
                                onToggle={() => setIsThinkingOpen(!isThinkingOpen)}
                            />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0f1419] border-t border-white/5">
                <form className="chat-form relative" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a meaningful question..."
                        className="w-full bg-[#1a1d2e] text-white rounded-xl pl-4 pr-12 py-3.5 border border-purple-500/20 hover:border-purple-500/30 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/40 focus:outline-none placeholder:text-gray-600 text-sm transition-all shadow-inner"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="absolute right-2 top-2 p-1.5 text-white bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
                    >
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
