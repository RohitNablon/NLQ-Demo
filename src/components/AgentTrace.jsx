import React, { useState, useEffect } from 'react';
import {
    Brain,
    Search,
    Filter,
    Terminal,
    PlayCircle,
    BarChart2,
    FileText,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Loader
} from 'lucide-react';

const stepConfig = {
    refiner: { label: 'Query Refiner', icon: Search },
    evaluator: { label: 'Evaluator', icon: Brain },
    selector: { label: 'Table Selector', icon: Filter },
    generator: { label: 'Query Engine', icon: Terminal },
    sandbox: { label: 'Query Sandbox', icon: PlayCircle },
    visualizer: { label: 'Visualizer', icon: BarChart2 }
};

const AgentTrace = ({ trace }) => {
    const [expandedStep, setExpandedStep] = useState(null);

    // Auto-expand the latest active step
    useEffect(() => {
        if (!trace) return;
        const keys = Object.keys(stepConfig);
        // Find the last key that has a value
        let lastActive = null;
        for (const key of keys) {
            if (trace[key]) lastActive = key;
        }
        if (lastActive) setExpandedStep(lastActive);
    }, [trace]);

    const toggleStep = (stepId) => {
        setExpandedStep(prev => prev === stepId ? null : stepId);
    };

    if (!trace) return null;

    return (
        <div className="agent-trace-container" style={{
            marginTop: '10px',
            marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.2)',
            overflow: 'hidden'
        }}>
            <div className="trace-header" style={{
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.85rem',
                color: '#aaa',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Brain size={14} />
                <span>Agent Reasoning Trace</span>
            </div>

            <div className="trace-steps">
                {Object.entries(stepConfig).map(([key, config]) => {
                    const content = trace[key];
                    if (!content) return null; // Don't show steps not yet reached

                    const isExpanded = expandedStep === key;
                    const Icon = config.icon;

                    return (
                        <div key={key} className="trace-step-item" style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div
                                className="step-header"
                                onClick={() => toggleStep(key)}
                                style={{
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className={`status-icon ${content ? 'text-success' : ''}`}>
                                        <Icon size={14} color="#4ade80" />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>{config.label}</span>
                                </div>
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>

                            {isExpanded && (
                                <div className="step-content fade-in" style={{
                                    padding: '8px 12px 12px 34px',
                                    fontSize: '0.85rem',
                                    color: '#bbb',
                                    lineHeight: '1.4'
                                }}>
                                    {/* If it looks like SQL, preserve formatting */}
                                    {key === 'generator' && content.includes('SELECT') ? (
                                        <pre style={{
                                            background: '#111',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            overflowX: 'auto',
                                            fontFamily: 'monospace',
                                            fontSize: '0.8rem',
                                            border: '1px solid #333'
                                        }}>
                                            {content.replace('Generated SQL: ', '')}
                                        </pre>
                                    ) : (
                                        content
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!trace.complete && !trace.end && (
                <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                    Agent is thinking...
                </div>
            )}
        </div>
    );
};

export default AgentTrace;
