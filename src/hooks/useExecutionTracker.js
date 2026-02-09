import { useState, useCallback } from 'react';

/**
 * Simplified execution tracker for demo
 * Simulates agent execution states without WebSocket
 */
export function useExecutionTracker() {
    const [executionState, setExecutionState] = useState({
        isExecuting: false,
        activeAgents: new Set(),
        completedAgents: new Set(),
        failedAgents: new Set(),
        currentAgent: null,
        executionSteps: [],
    });

    const updateExecutionState = useCallback((event) => {
        setExecutionState((prev) => {
            const newState = { ...prev };

            if (event.type === 'agent_start') {
                newState.isExecuting = true;
                newState.activeAgents = new Set(prev.activeAgents);
                newState.activeAgents.add(event.agent);
                newState.currentAgent = event.name;
                newState.executionSteps = [
                    ...prev.executionSteps,
                    {
                        agent: event.agent,
                        name: event.name,
                        status: 'running',
                        timestamp: Date.now(),
                        message: `Processing with ${event.name}...`,
                    },
                ];
            } else if (event.type === 'agent_complete') {
                newState.activeAgents = new Set(prev.activeAgents);
                newState.activeAgents.delete(event.agent);
                newState.completedAgents = new Set(prev.completedAgents);
                newState.completedAgents.add(event.agent);

                // Update step status
                newState.executionSteps = prev.executionSteps.map((step) =>
                    step.agent === event.agent
                        ? { ...step, status: 'completed', endTime: Date.now() }
                        : step
                );

                // Check if all done
                if (newState.activeAgents.size === 0) {
                    newState.isExecuting = false;
                    newState.currentAgent = null;
                }
            } else if (event.type === 'reset') {
                return {
                    isExecuting: false,
                    activeAgents: new Set(),
                    completedAgents: new Set(),
                    failedAgents: new Set(),
                    currentAgent: null,
                    executionSteps: [],
                };
            }

            return newState;
        });
    }, []);

    const getAgentStatus = useCallback(
        (agentId) => {
            if (executionState.activeAgents.has(agentId)) return 'executing';
            if (executionState.completedAgents.has(agentId)) return 'completed';
            if (executionState.failedAgents.has(agentId)) return 'failed';
            return 'idle';
        },
        [executionState]
    );

    const reset = useCallback(() => {
        updateExecutionState({ type: 'reset' });
    }, [updateExecutionState]);

    return {
        executionState,
        updateExecutionState,
        getAgentStatus,
        reset,
    };
}
