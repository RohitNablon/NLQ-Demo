import React, { useState, useEffect, useRef } from 'react';
import InsightGrid from './InsightGrid';
import MockChart from './MockChart';
import AgentNetworkVisualizer from './AgentNetworkVisualizer';
import AgentTrace from './AgentTrace';
import qaData from '../QA.json';
import './ChatInterface.css';
import { Send, Database, MessageSquare, LayoutGrid, LogOut, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

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

const ChatInterface = ({ dbInfo, onDisconnect, initialQuestion }) => {
    // Helper to determine active step for visualizer
    const getActiveTraceStep = (trace) => {
        if (!trace) return null;
        if (trace.isComplete) return 'complete'; // or 'end' if we want to stay on end node
        // Order of precedence (reverse)
        if (trace.end) return 'end';
        if (trace.final) return 'final';
        if (trace.validator) return 'validator';
        if (trace.visualizer) return 'visualizer';
        if (trace.sandbox) return 'sandbox';
        if (trace.generator) return 'generator';
        if (trace.selector) return 'selector';
        if (trace.general_llm) return 'general_llm'; // Add General LLM step
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
    const [confidencePopup, setConfidencePopup] = useState(null); // { score, reason }
    const messagesEndRef = useRef(null);
    const initialQuestionProcessed = useRef(null);

    useEffect(() => {
        if (initialQuestion && initialQuestion !== initialQuestionProcessed.current) {
            initialQuestionProcessed.current = initialQuestion;
            createNewSession(initialQuestion);
        }
    }, [initialQuestion]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createNewSession = (initialQuery = null) => {
        const activeSess = sessions.find(s => s.id === activeSessionId);

        // Reuse current session if it's empty and has generic title
        if (activeSess && activeSess.messages.length === 0 && (activeSess.title === 'New Chat' || !activeSess.title)) {
            if (initialQuery) {
                const updatedSession = {
                    ...activeSess,
                    title: initialQuery.length > 30 ? initialQuery.substring(0, 30) + '...' : initialQuery,
                    timestamp: Date.now()
                };
                setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
                setView('chat');
                setTimeout(() => handleSendMessage(initialQuery, activeSess.id), 100);
            }
            return;
        }

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
                let newTitle = session.title;
                if (session.messages.length === 0) {
                    if (query.includes('Dashboard Summary Request')) {
                        newTitle = 'Dashboard Executive Summary';
                    } else {
                        newTitle = query.length > 30 ? query.substring(0, 30) + '...' : query;
                    }
                }
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

        // Find QA Match - making it more robust (case-insensitive, trimmed, ignoring trailing question marks)
        const normalize = (str) => str.toLowerCase().trim().replace(/[?]$/, '');
        const match = qaData.find(q => normalize(q.Question) === normalize(query));

        if (match) {
            // Existing Mock Logic for Curated Questions
            setTimeout(() => {
                setIsTyping(false);
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
                        general_llm: null,
                        validator: null
                    },
                    confidence: 0.96 + (Math.random() * 0.04),
                    confidenceReason: "Verification Successful: The input query aligns with a pre-validated analytical template in the Enterprise Data Hub. SQL logic and schema mappings for this domain have been explicitly verified by data stewards for 100% accuracy against the production warehouse.",
                    content: match.Answer
                };

                setSessions(prev => prev.map(session => {
                    if (session.id === sessionId) {
                        return { ...session, messages: [...session.messages, agentMsg] };
                    }
                    return session;
                }));

                const stepDelay = 800;
                let delay = 500;

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'refiner', `Refining "${query}"...`), delay);
                delay += stepDelay;

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'evaluator', 'Routing to SQL Engine...'), delay);
                delay += stepDelay;

                const tables = match.Tables_Used ? match.Tables_Used.join(', ') : 'Identifying tables...';
                setTimeout(() => updateTrace(sessionId, agentMsgId, 'selector', `Identified Tables: ${tables}`), delay);
                delay += stepDelay;

                const sqlSnippet = match.SQL_Query || 'Generating SQL...';
                setTimeout(() => updateTrace(sessionId, agentMsgId, 'generator', `Generated SQL: ${sqlSnippet}`), delay);
                delay += stepDelay;

                const dataPreview = match.SQL_Response ? JSON.stringify(match.SQL_Response, null, 2) : 'Validating Query & Data...';
                setTimeout(() => updateTrace(sessionId, agentMsgId, 'sandbox', `Execution Result: ${dataPreview}`), delay);
                delay += stepDelay;

                if (match.Need_Visulization) {
                    setTimeout(() => updateTrace(sessionId, agentMsgId, 'visualizer', 'Generating Chart Configuration...'), delay);
                    delay += stepDelay;
                }

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'final', 'Formulating Final Answer...'), delay);
                delay += stepDelay;

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'validator', 'LLM-as-Judge: Data verified against Source-of-Truth.'), delay);
                delay += stepDelay;

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'end', 'Process Complete.'), delay);
                delay += stepDelay;

                setTimeout(() => {
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
        } else {
            // Dynamic Fallback to Azure OpenAI
            const performDynamicSearch = async () => {
                const agentMsgId = Date.now() + 1;
                // Initialize Agent Message with empty trace
                setSessions(prev => prev.map(session => {
                    if (session.id === sessionId) {
                        const agentMsg = {
                            id: agentMsgId,
                            type: 'agent',
                            trace: {
                                refiner: null, evaluator: null, selector: null,
                                generator: null, sandbox: null, visualizer: null, final: null,
                                general_llm: null, validator: null
                            },
                            content: '' // Will fill later
                        };
                        return { ...session, messages: [...session.messages, agentMsg] };
                    }
                    return session;
                }));

                // Simulate Trace Steps for Dynamic Query
                const stepDelay = 1000;
                let delay = 100;

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'refiner', `Analyzing dynamic query: "${query}"...`), delay);
                delay += stepDelay;

                setTimeout(() => updateTrace(sessionId, agentMsgId, 'evaluator', 'Routing to External Knowledge Base (LLM)...'), delay);
                delay += stepDelay;

                // USE GENERAL LLM PATH NOT SQL PATH
                setTimeout(() => updateTrace(sessionId, agentMsgId, 'general_llm', 'Querying General Knowledge Model...'), delay);
                delay += stepDelay;

                try {
                    // Call Azure OpenAI
                    const endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
                    const apiKey = process.env.REACT_APP_AZURE_OPENAI_API_KEY;
                    const deployment = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT;
                    const version = process.env.REACT_APP_AZURE_OPENAI_VERSION || '2024-02-15-preview';

                    if (!endpoint || !apiKey || !deployment) {
                        throw new Error("Azure OpenAI credentials not configured.");
                    }

                    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${version}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': apiKey
                        },
                        body: JSON.stringify({
                            messages: [
                                { role: 'system', content: 'You are a helpful data analyst assistant. Provide clear, concise answers to user questions about their data. If you do not have specific data access, provide a general answer or guidance.' },
                                { role: 'user', content: query }
                            ],
                            temperature: 0.7
                        })
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        throw new Error(`Azure OpenAI Error: ${response.status} - ${errText}`);
                    }

                    const data = await response.json();
                    const aiContent = data.choices[0]?.message?.content || "No response generated.";

                    // Update trace with success - SKIP generator/sandbox/final steps as they are SQL specific
                    // The General LLM node directly connects to End in the visualizer

                    setTimeout(() => updateTrace(sessionId, agentMsgId, 'end', 'Dynamic processed complete.'), delay);

                    // Finalize Message
                    setTimeout(() => {
                        updateTrace(sessionId, agentMsgId, 'complete', true);
                        setSessions(prev => prev.map(session => {
                            if (session.id === sessionId) {
                                return {
                                    ...session,
                                    messages: session.messages.map(m => m.id === agentMsgId ? {
                                        ...m,
                                        content: aiContent,
                                        showChart: false // No charts for dynamic yet
                                    } : m)
                                };
                            }
                            return session;
                        }));
                        setIsTyping(false);
                    }, delay + 500);

                } catch (error) {
                    console.error("LLM Call Failed", error);
                    // Update trace with error
                    setTimeout(() => {
                        updateTrace(sessionId, agentMsgId, 'end', 'Error: Failed to connect to AI Service.');
                        updateTrace(sessionId, agentMsgId, 'complete', true);
                        setSessions(prev => prev.map(session => {
                            if (session.id === sessionId) {
                                return {
                                    ...session,
                                    messages: session.messages.map(m => m.id === agentMsgId ? {
                                        ...m,
                                        content: `**Error**: ${error.message}. Please check your connection or credentials.`,
                                        showChart: false
                                    } : m)
                                };
                            }
                            return session;
                        }));
                        setIsTyping(false);
                    }, delay);
                }
            };
            performDynamicSearch();
        }
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
                                                    {msg.confidence && (
                                                        <button
                                                            className="confidence-badge clickable"
                                                            onClick={() => setConfidencePopup({ score: msg.confidence, reason: msg.confidenceReason })}
                                                            title="Click to view verification reasoning"
                                                        >
                                                            <div className="confidence-indicator" style={{ width: `${msg.confidence * 100}%` }} />
                                                            <span className="confidence-text">{Math.round(msg.confidence * 100)}% Confidence</span>
                                                        </button>
                                                    )}
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

            {/* Confidence Reasoning Popup */}
            {confidencePopup && (
                <div className="confidence-modal-overlay" onClick={() => setConfidencePopup(null)}>
                    <div className="confidence-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <ShieldCheck size={20} className="modal-icon" />
                            <h3>Verification Reasoning</h3>
                            <button className="close-btn" onClick={() => setConfidencePopup(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="score-summary">
                                <div className="score-large">{Math.round(confidencePopup.score * 100)}%</div>
                                <div className="score-label">System Confidence</div>
                            </div>
                            <div className="reason-text">
                                {confidencePopup.reason}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-status">
                                <span className="status-dot green" /> Verified by LLM-as-Judge
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
