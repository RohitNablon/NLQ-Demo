import React, { useMemo, useState } from 'react';
import {
    Brain,
    Search,
    Filter,
    Database,
    Terminal,
    PlayCircle,
    BarChart2,
    FileText,
    MessageSquare,
    CheckCircle
} from 'lucide-react';
import './AgentNetworkVisualizer.css';

const AgentNetworkVisualizer = ({ activeStep, trace }) => {
    const [hoveredNode, setHoveredNode] = useState(null);

    // Node Dimensions
    const NODE_WIDTH = 120;
    const NODE_HEIGHT = 70;
    const CANVAS_WIDTH = 500;

    // Grid Columns (Center points)
    const COL_L = 80;
    const COL_C = 250 - (NODE_WIDTH / 2); // Centered: 250 - 60 = 190
    const COL_R = 420 - NODE_WIDTH;     // Right aligned-ish: ~300

    // Adjusted Columns for cleaner look in 500px
    // Center = 190 (Nodes are 120 wide, so 190+60=250 center)
    // Left = 50  (Center 110)
    // Right = 330 (Center 390)

    // Vertical Spacing
    const Y_START = 20;
    const Y_GAP = 90;

    // Node Definitions with Metadata
    const nodesConfig = {
        refiner: {
            id: 'refiner',
            label: 'Query Refiner',
            icon: Search,
            role: 'Contextualizer',
            description: 'Analyzes user input and chat history to formulate a precise query.',
            input: 'User Query, Chat History',
            output: 'Refined Query',
            x: 190, y: Y_START
        },
        evaluator: {
            id: 'evaluator',
            label: 'Evaluator',
            icon: Brain,
            role: 'Router',
            description: 'Decides if the query needs Database access (SQL) or General Knowledge (LLM).',
            input: 'Refined Query',
            output: 'Routing Strategy',
            x: 190, y: Y_START + Y_GAP
        },
        // Branch A: General LLM (Left)
        general_llm: {
            id: 'general_llm',
            label: 'General LLM',
            icon: MessageSquare,
            role: 'Chatbot',
            description: 'Handles general questions, greetings, or effectively anything not requiring DB access.',
            input: 'Refined Query',
            output: 'Text Response',
            x: 50, y: Y_START + Y_GAP * 2
        },
        // Branch B: SQL Pipeline (Right)
        selector: {
            id: 'selector',
            label: 'Table Selector',
            icon: Filter,
            role: 'Schema Expert',
            description: 'Identifies relevant tables and columns from the database metadata.',
            input: 'DB Metadata',
            output: 'Relevant Schemas',
            x: 330, y: Y_START + Y_GAP * 2
        },
        generator: {
            id: 'generator',
            label: 'Query Engine',
            icon: Terminal,
            role: 'Coder',
            description: 'Writes the actual SQL query based on the selected schema.',
            input: 'Schema, Query',
            output: 'SQL Query',
            x: 330, y: Y_START + Y_GAP * 3
        },
        sandbox: {
            id: 'sandbox',
            label: 'Query Sandbox',
            icon: PlayCircle,
            role: 'Tester',
            description: 'Executes the query in a safe environment and catches errors.',
            input: 'SQL Query',
            output: 'Raw Data / Error',
            x: 330, y: Y_START + Y_GAP * 4
        },
        // Visualizer (Moved to Center/Left relative to pipeline)
        visualizer: {
            id: 'visualizer',
            label: 'Visualizer',
            icon: BarChart2,
            role: 'Analyst',
            description: 'Determines the best chart type to represent the result data.',
            input: 'Query Results',
            output: 'Chart Configuration',
            x: 190, y: Y_START + Y_GAP * 5 // Center Column
        },
        final: {
            id: 'final',
            label: 'Final Answer',
            icon: FileText,
            role: 'Writer',
            description: 'Synthesizes the data into a human-readable natural language response.',
            input: 'Data, Chart',
            output: 'Final Response',
            x: 330, y: Y_START + Y_GAP * 6
        },
        // Convergence
        end: {
            id: 'end',
            label: 'End',
            icon: CheckCircle,
            role: 'Terminator',
            description: 'Process complete.',
            input: 'Response',
            output: 'UI Render',
            x: 190, y: Y_START + Y_GAP * 7
        }
    };

    // Connections (Source -> Target)
    const connections = [
        ['refiner', 'evaluator'],
        ['evaluator', 'general_llm'], // Left Branch
        ['evaluator', 'selector'],    // Right Branch
        ['selector', 'generator'],
        ['generator', 'sandbox'],
        ['sandbox', 'final'],         // Direct Path (Text Only)
        ['sandbox', 'visualizer'],    // Detour to Visualizer
        ['visualizer', 'final'],      // Return from Visualizer to Final (Zig Zag)
        ['final', 'end'],             // SQL Path End
        ['general_llm', 'end']        // LLM Path End
    ];

    // Determine active state
    const { activeNodes, activePaths } = useMemo(() => {
        const nodes = new Set();
        const paths = new Set();

        const addPath = (from, to) => {
            nodes.add(from);
            nodes.add(to);
            paths.add(`${from}-${to}`);
        };

        if (activeStep) nodes.add('refiner');

        if (['evaluator', 'selector', 'generator', 'sandbox', 'visualizer', 'final', 'end', 'complete', 'general_llm'].includes(activeStep)) {
            addPath('refiner', 'evaluator');
        }

        const isSqlPath = ['selector', 'generator', 'sandbox', 'visualizer', 'final', 'end', 'complete'].includes(activeStep);
        const isLlmPath = activeStep === 'general_llm';

        if (isSqlPath) {
            addPath('evaluator', 'selector');
            if (['generator', 'sandbox', 'visualizer', 'final', 'end', 'complete'].includes(activeStep)) {
                addPath('selector', 'generator');
            }
            if (['sandbox', 'visualizer', 'final', 'end', 'complete'].includes(activeStep)) {
                addPath('generator', 'sandbox');
            }

            // Visualizer Logic
            // Check if visualizer was actually triggered in the trace
            const isVisualizerActiveInTrace = trace && trace.visualizer;

            if (isVisualizerActiveInTrace && ['visualizer', 'final', 'end', 'complete'].includes(activeStep)) {
                addPath('sandbox', 'visualizer');
                if (['final', 'end', 'complete'].includes(activeStep)) {
                    addPath('visualizer', 'final');
                }
            } else if (!isVisualizerActiveInTrace && ['final', 'end', 'complete'].includes(activeStep)) {
                // Direct path from Sandbox to Final if Visualizer was skipped
                addPath('sandbox', 'final');
            }
        }
        else if (isLlmPath) {
            addPath('evaluator', 'general_llm');
            if (['end', 'complete'].includes(activeStep)) {
                addPath('general_llm', 'end');
            }
        }

        if (['complete', 'end'].includes(activeStep)) {
            nodes.add('end');
        }

        return { activeNodes: nodes, activePaths: paths };
    }, [activeStep]);

    const renderNode = (key) => {
        const config = nodesConfig[key];
        const isActive = activeNodes.has(key);
        const Icon = config.icon;

        return (
            <div
                className={`agent-node ${isActive ? 'active' : ''}`}
                style={{ left: config.x, top: config.y }}
                key={key}
                onMouseEnter={() => setHoveredNode(config)}
                onMouseLeave={() => setHoveredNode(null)}
            >
                <div className="node-icon">
                    <Icon size={18} />
                </div>
                <div className="node-label">{config.label}</div>
                {isActive && <div className="node-pulse"></div>}
            </div>
        );
    };

    // Orthogonal Edge Routing
    const renderPath = ([startKey, endKey]) => {
        const start = nodesConfig[startKey];
        const end = nodesConfig[endKey];
        const id = `${startKey}-${endKey}`;
        const isActive = activePaths.has(id);

        const sx = start.x + NODE_WIDTH / 2;
        const sy = start.y + NODE_HEIGHT;
        const ex = end.x + NODE_WIDTH / 2;
        const ey = end.y;

        const dx = ex - sx;
        const dy = ey - sy;
        const midY = sy + dy / 2;

        let pathData = '';

        // Case 1: Straight Vertical
        if (Math.abs(dx) < 10) {
            pathData = `M ${sx} ${sy} L ${ex} ${ey}`;
        }
        else {
            // Case 2: Dogleg (Vertical -> Horizontal -> Vertical)
            // Round corners for "Circuit" look
            const r = 15; // Radius

            // Start Vertical
            pathData = `M ${sx} ${sy} L ${sx} ${midY - r}`;

            // Curve 1
            pathData += ` Q ${sx} ${midY} ${sx + (dx > 0 ? r : -r)} ${midY}`;

            // Horizontal
            pathData += ` L ${ex - (dx > 0 ? r : -r)} ${midY}`;

            // Curve 2
            pathData += ` Q ${ex} ${midY} ${ex} ${midY + r}`;

            // End Vertical
            pathData += ` L ${ex} ${ey}`;
        }

        return (
            <path
                key={id}
                d={pathData}
                className={`connection-line ${isActive ? 'active' : ''}`}
                fill="none"
            />
        );
    };

    return (
        <div className="agent-network-container">
            <div className="network-canvas">
                <svg className="connections-layer" style={{ minHeight: '800px' }}>
                    {connections.map(renderPath)}
                </svg>

                {Object.keys(nodesConfig).map(renderNode)}
            </div>

            <div className="network-legend">
                <div className="legend-item">
                    <span className="dot active"></span> Active
                </div>
                <div className="legend-item">
                    <span className="dot inactive"></span> Idle
                </div>
            </div>

            {hoveredNode && (
                <div className="agent-tooltip fade-in-up" style={{
                    left: 20,
                    bottom: 20,
                    top: 'auto'
                }}>
                    <div className="tooltip-header">
                        <span className="tooltip-role">{hoveredNode.role}</span>
                        <span className="tooltip-title"> - {hoveredNode.label}</span>
                    </div>
                    <div className="tooltip-desc">
                        {hoveredNode.description}
                    </div>
                    <div className="tooltip-divider"></div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Input:</span>
                        <span className="tooltip-value">{hoveredNode.input}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Output:</span>
                        <span className="tooltip-value">{hoveredNode.output}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentNetworkVisualizer;
