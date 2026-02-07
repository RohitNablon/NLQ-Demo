import React, { useState, useEffect, useRef } from 'react';
import InsightGrid from './InsightGrid';
import MockChart from './MockChart';
import AgentNetworkVisualizer from './AgentNetworkVisualizer';
import AgentTrace from './AgentTrace';
import qaData from '../QA.json';
import './ChatInterface.css';
import { Send, Database, MessageSquare, LayoutGrid, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

// Simple Markdown Renderer for Agent Answers
// Simple Markdown Renderer for Agent Answers
const SimpleMarkdown = ({ text }) => {
    if (!text) return null;

    // Split into lines
    const lines = text.split('\n');

    return (
        <div className="markdown-content" style={{ fontFamily: "'Jost', sans-serif" }}>
            {lines.map((line, i) => {
                const trimmed = line.trim();

                // Handle Headers (###)
                if (trimmed.startsWith('###')) {
                    return (
                        <h3 key={i} style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: '#fff',
                            marginTop: '24px',
                            marginBottom: '12px',
                            letterSpacing: '0.5px'
                        }}>
                            {trimmed.replace(/^###\s*/, '')}
                        </h3>
                    );
                }

                // Handle Bullet Points
                const isBullet = trimmed.startsWith('-');
                const content = isBullet ? trimmed.substring(1).trim() : line;

                // Parse Bold (**text**)
                const parts = content.split(/(\*\*.*?\*\*)/g);
                const renderedParts = parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                            <strong key={index} style={{
                                color: 'var(--accent)',
                                fontWeight: 600
                            }}>
                                {part.slice(2, -2)}
                            </strong>
                        );
                    }
                    return part;
                });

                if (isBullet) {
                    return (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '8px',
                            paddingLeft: '4px',
                            lineHeight: '1.6'
                        }}>
                            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>•</span>
                            <span style={{ color: '#e0e0e0' }}>{renderedParts}</span>
                        </div>
                    );
                }

                // Empty line
                if (!trimmed) {
                    return <div key={i} style={{ height: '16px' }} />;
                }

                // Regular Paragraph
                return (
                    <div key={i} style={{
                        marginBottom: '8px',
                        lineHeight: '1.7',
                        color: '#e0e0e0',
                        fontSize: '1rem'
                    }}>
                        {renderedParts}
                    </div>
                );
            })}
        </div>
    );
};

const ChatInterface = ({ dbInfo, onDisconnect }) => {
    // Helper to determine active step for visualizer
    const getActiveTraceStep = (trace) => {
        if (!trace) return null;
        if (trace.isComplete) return 'complete'; // or 'end' if we want to stay on end node
        // Order of precedence (reverse)
        if (trace.end) return 'end';
        if (trace.final) return 'final';
        if (trace.visualizer) return 'visualizer';
        if (trace.sandbox) return 'sandbox';
        if (trace.generator) return 'generator';
        if (trace.selector) return 'selector';
        if (trace.evaluator) return 'evaluator';
        if (trace.refiner) return 'refiner';
        return null; // or idle
    };
    const [view, setView] = useState('grid'); // 'grid' | 'chat'

    // Session State
    const [sessions, setSessions] = useState([
        { id: '1', title: 'New Chat', messages: [], timestamp: Date.now() }
    ]);
    const [activeSessionId, setActiveSessionId] = useState('1');

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const messages = activeSession.messages;

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createNewSession = (initialQuery = null) => {
        const newId = Date.now().toString();
        const newSession = {
            id: newId,
            title: initialQuery ? (initialQuery.length > 30 ? initialQuery.substring(0, 30) + '...' : initialQuery) : 'New Chat',
            messages: [],
            timestamp: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
        setView('chat');

        if (initialQuery) {
            // Slight delay to allow state update before sending
            setTimeout(() => handleSendMessage(initialQuery, newId), 100);
        }
    };

    const handleSelectInsight = (question) => {
        createNewSession(question);
    };

    const handleSendMessage = async (text, sessionId = activeSessionId) => {
        if (!text && !inputValue.trim()) return;
        const query = text || inputValue;

        // Add User Message
        const userMsg = { id: Date.now(), type: 'user', content: query };

        setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                // Update title if it's the first message and title is generic
                const newTitle = session.messages.length === 0 ? (query.length > 30 ? query.substring(0, 30) + '...' : query) : session.title;
                return {
                    ...session,
                    title: newTitle,
                    messages: [...session.messages, userMsg]
                };
            }
            return session;
        }));

        setInputValue('');
        setIsTyping(true);

        // Find QA Match
        const match = qaData.find(q => q.Question === query) || qaData[0];

        // Simulate Agent Response
        setTimeout(() => {
            setIsTyping(false); // Stop global loader since we show the message now
            const agentMsgId = Date.now() + 1;
            const agentMsg = {
                id: agentMsgId,
                type: 'agent',
                trace: {
                    refiner: null,
                    evaluator: null,
                    selector: null,
                    generator: null,
                    sandbox: null,
                    visualizer: null,
                    final: null
                },
                content: match.Answer // Pre-load or set later? Setting later to simulate thinking
            };

            setSessions(prev => prev.map(session => {
                if (session.id === sessionId) {
                    return { ...session, messages: [...session.messages, agentMsg] };
                }
                return session;
            }));

            // Simulate Trace Steps via QA Data
            const stepDelay = 800;
            let delay = 500;

            // 1. Refiner
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'refiner', `Refining "${query}"...`), delay);
            delay += stepDelay;

            // 2. Evaluator
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'evaluator', 'Routing to SQL Engine...'), delay);
            delay += stepDelay;

            // 3. Selector
            const tables = match.Tables_Used ? match.Tables_Used.join(', ') : 'Identifying tables...';
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'selector', `Identified Tables: ${tables}`), delay);
            delay += stepDelay;

            // 4. Generator
            const sqlSnippet = match.SQL_Query || 'Generating SQL...';
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'generator', `Generated SQL: ${sqlSnippet}`), delay);
            delay += stepDelay;

            // 5. Sandbox
            const dataPreview = match.SQL_Response ? JSON.stringify(match.SQL_Response, null, 2) : 'Validating Query & Data...';
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'sandbox', `Execution Result: ${dataPreview}`), delay);
            delay += stepDelay;

            // 6. Visualizer (Conditional)
            if (match.Need_Visulization) {
                setTimeout(() => updateTrace(sessionId, agentMsgId, 'visualizer', 'Generating Chart Configuration...'), delay);
                delay += stepDelay;
            }
            // Else: Skip Visualizer step entirely so it doesn't highlight in the graph

            // 7. Final Answer
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'final', 'Formulating Final Answer...'), delay);
            delay += stepDelay;

            // 8. End
            setTimeout(() => updateTrace(sessionId, agentMsgId, 'end', 'Process Complete.'), delay);
            delay += stepDelay;

            // Finish
            setTimeout(() => {

                // Determine Chart Type based on Question (Pre-calculation for Trace)
                let specificChartType = 'default';
                let chartDescription = 'Bar Chart';

                if (match.Question.includes('Year Wise')) {
                    specificChartType = 'trend_line';
                    chartDescription = 'Trend Line Chart';
                }
                else if (match.Question.includes('Bottom 5')) {
                    specificChartType = 'bar_horizontal_bottom_5';
                    chartDescription = 'Horizontal Bar Chart';
                }
                else if (match.Question.includes('Top 5 stores')) {
                    specificChartType = 'bar_vertical_top_5';
                    chartDescription = 'Vertical Bar Chart';
                }

                // Update Trace with specific chart info if visualization was needed
                if (match.Need_Visulization) {
                    updateTrace(sessionId, agentMsgId, 'visualizer', `Generated ${chartDescription}`);
                }

                updateTrace(sessionId, agentMsgId, 'complete', true);

                setSessions(prev => prev.map(session => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            messages: session.messages.map(m => m.id === agentMsgId ? {
                                ...m,
                                content: match.Answer,
                                showChart: match.Need_Visulization,
                                chartType: specificChartType
                            } : m)
                        };
                    }
                    return session;
                }));
            }, delay);

        }, 500);
    };

    const updateTrace = (sessionId, msgId, field, value) => {
        setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                return {
                    ...session,
                    messages: session.messages.map(msg => {
                        if (msg.id === msgId) {
                            if (field === 'complete') return { ...msg, isComplete: true };
                            return { ...msg, trace: { ...msg.trace, [field]: value } };
                        }
                        return msg;
                    })
                };
            }
            return session;
        }));
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    return (
        <div className={`chat-interface ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {/* Sidebar */}
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    {isSidebarOpen && <div className="nablon-logo" style={{ fontSize: '1.2rem' }}>Nablon</div>}
                    <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                <div className="db-selector" title={dbInfo?.databaseType || 'Sales DB'}>
                    <Database size={16} />
                    {isSidebarOpen && <span>{dbInfo?.databaseType || 'Sales DB'}</span>}
                </div>

                <nav className="sidebar-nav">
                    <div
                        className="nav-item new-chat-btn"
                        onClick={() => createNewSession()}
                        title="New Chat"
                        style={{ background: 'var(--accent)', color: 'white', marginBottom: '20px' }}
                    >
                        <MessageSquare size={18} />
                        {isSidebarOpen && <span>New Chat</span>}
                    </div>

                    <div className="nav-section-label" style={{
                        padding: '0 12px',
                        marginBottom: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: isSidebarOpen ? 'block' : 'none'
                    }}>
                        History
                    </div>

                    <div className="session-list" style={{ flex: 1, overflowY: 'auto' }}>
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className={`nav-item ${activeSessionId === session.id && view === 'chat' ? 'active' : ''}`}
                                onClick={() => { setActiveSessionId(session.id); setView('chat'); }}
                                title={session.title}
                            >
                                <MessageSquare size={18} style={{ opacity: 0.7 }} />
                                {isSidebarOpen && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</span>}
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="nav-item" onClick={onDisconnect} title="Disconnect">
                        <LogOut size={18} />
                        {isSidebarOpen && <span>Disconnect</span>}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="chat-main">
                <div className="chat-scroll-area">
                    {view === 'grid' ? (
                        <div className="chat-container-width fade-in">
                            <InsightGrid onSelect={handleSelectInsight} questions={qaData} />
                        </div>
                    ) : (
                        <div className="chat-container-width">
                            {messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.type}`}>
                                    {msg.type === 'user' ? (
                                        <div className="user-bubble">{msg.content}</div>
                                    ) : (
                                        <div className="agent-response">
                                            {/* Render Trace if available */}
                                            {msg.trace && <AgentTrace trace={msg.trace} />}

                                            {msg.isComplete && (
                                                <div className="final-answer-container fade-in">
                                                    <div className="answer-text" style={{
                                                        marginBottom: '15px',
                                                        fontSize: '1rem',
                                                        lineHeight: '1.6',
                                                        color: '#e0e0e0'
                                                    }}>
                                                        <SimpleMarkdown text={msg.content} />
                                                    </div>

                                                    {msg.showChart && (
                                                        <div className="chart-wrapper" style={{
                                                            marginTop: '20px',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '8px',
                                                            padding: '20px',
                                                            background: 'var(--bg-secondary)'
                                                        }}>
                                                            <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#888' }}>Visualization</div>
                                                            <MockChart type={msg.chartType} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Agent is thinking...</div>}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask a question about your data..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button className="send-btn" onClick={() => handleSendMessage()}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </main>

            {/* Right Side: Network Visualizer */}
            <aside className={`chat-visualizer-panel ${isRightSidebarOpen ? '' : 'collapsed'}`}>
                <div className="visualizer-header">
                    <div className="visualizer-title">Neural Orchestration</div>
                    <button
                        className="visualizer-toggle-btn"
                        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                        title={isRightSidebarOpen ? "Collapse Orchestrator" : "Expand Orchestrator"}
                    >
                        {isRightSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <div className="visualizer-content">
                    <AgentNetworkVisualizer
                        activeStep={messages.length > 0 && messages[messages.length - 1].type === 'agent' ? getActiveTraceStep(messages[messages.length - 1].trace) : null}
                        trace={messages.length > 0 && messages[messages.length - 1].type === 'agent' ? messages[messages.length - 1].trace : null}
                    />
                </div>
            </aside>
        </div>
    );
};

export default ChatInterface;
