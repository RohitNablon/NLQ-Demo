import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import SimpleAgentNode from './SimpleAgentNode';
import { THEME_COLORS } from '../constants/theme';

const nodeTypes = {
    agent: SimpleAgentNode,
};

function GraphInner({ nodes, edges }) {
    const { fitView } = useReactFlow();

    useEffect(() => {
        // Enforce fitView whenever nodes/edges change
        if (nodes.length > 0) {
            window.requestAnimationFrame(() => {
                fitView({ padding: 0.2, duration: 800 });
            });
        }
    }, [nodes, edges, fitView]);

    return null;
}

/**
 * Simplified Network Graph for demo
 * Displays agent workflow using ReactFlow
 */
export default function SimpleNetworkGraph({ workflow, executionState }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    // Convert workflow to ReactFlow nodes/edges
    useEffect(() => {
        if (!workflow?.agents) {
            // Default State: Show a static, idle graph structure
            const defaultNodes = [
                { id: 'intent', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'Intent Agent', icon: 'Lightbulb', type: 'understanding', executionState: 'idle' } },
                { id: 'supervisor', type: 'agent', position: { x: 0, y: 150 }, data: { label: 'Supervisor', icon: 'Cpu', type: 'orchestration', executionState: 'idle' } },
                { id: 'schema', type: 'agent', position: { x: 250, y: 150 }, data: { label: 'Schema Agent', icon: 'Database', type: 'context', executionState: 'idle' } },
                { id: 'planner', type: 'agent', position: { x: -250, y: 150 }, data: { label: 'Planner', icon: 'Wrench', type: 'orchestration', executionState: 'idle' } },
                { id: 'viz', type: 'agent', position: { x: 0, y: 300 }, data: { label: 'Visualization', icon: 'BarChart', type: 'presentation', executionState: 'idle' } },
            ];

            const defaultEdges = [
                { id: 'e1', source: 'intent', target: 'supervisor', type: 'default', style: { stroke: THEME_COLORS.status.idle, strokeWidth: 2 }, animated: true },
                { id: 'e2', source: 'supervisor', target: 'schema', type: 'default', style: { stroke: THEME_COLORS.status.idle, strokeWidth: 2 } },
                { id: 'e3', source: 'supervisor', target: 'planner', type: 'default', style: { stroke: THEME_COLORS.status.idle, strokeWidth: 2 } },
                { id: 'e4', source: 'supervisor', target: 'viz', type: 'default', style: { stroke: THEME_COLORS.status.idle, strokeWidth: 2 } },
            ];

            setNodes(defaultNodes);
            setEdges(defaultEdges);
            return;
        }

        // Create nodes with execution status
        const newNodes = workflow.agents.map((agent, idx) => ({
            id: agent.id,
            type: 'agent',
            position: {
                x: (agent.position ? agent.position[0] : 0) * 250,
                y: (agent.position ? agent.position[1] : idx * 1) * 180, // Fallback vertical stack
            },
            data: {
                label: agent.name,
                executionState: getAgentExecutionState(agent.id),
                icon: agent.icon,
                type: agent.type,
            },
        }));

        // Create edges
        const newEdges = workflow.edges.map((edge, idx) => ({
            id: `edge-${idx}`,
            source: edge.source,
            target: edge.target,
            type: 'default', // Changed to 'default' (Bezier) for fluid lines
            animated: isEdgeActive(edge.source, edge.target),
            style: {
                stroke: isEdgeActive(edge.source, edge.target)
                    ? THEME_COLORS.status.executing
                    : THEME_COLORS.status.idle,
                strokeWidth: isEdgeActive(edge.source, edge.target) ? 3 : 2,
            },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
    }, [workflow, executionState]);

    const getAgentExecutionState = (agentId) => {
        if (!executionState) return 'idle';
        if (executionState.activeAgents?.has(agentId)) return 'executing';
        if (executionState.completedAgents?.has(agentId)) return 'completed';
        if (executionState.failedAgents?.has(agentId)) return 'failed';
        return 'idle';
    };

    const isEdgeActive = (source, target) => {
        if (!executionState) return false;
        // Edge is active if source is completed and target is executing
        return (
            executionState.completedAgents?.has(source) &&
            executionState.activeAgents?.has(target)
        );
    };

    return (
        <div style={{ width: '100%', height: '100%', background: '#09090b', borderRadius: '12px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#ffffff10" gap={20} size={1} />
                <Controls
                    style={{
                        button: {
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                        },
                    }}
                />
                <MiniMap
                    nodeColor={(node) => {
                        const state = node.data.executionState;
                        if (state === 'executing') return THEME_COLORS.status.executing;
                        if (state === 'completed') return THEME_COLORS.status.completed;
                        if (state === 'failed') return THEME_COLORS.status.failed;
                        return THEME_COLORS.status.idle;
                    }}
                    style={{
                        background: 'rgba(9,9,11,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                />
                <GraphInner nodes={nodes} edges={edges} />
            </ReactFlow>
        </div>
    );
}
