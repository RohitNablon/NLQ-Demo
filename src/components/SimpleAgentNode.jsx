import React from 'react';
import { Handle, Position } from 'reactflow';
import { IconMapper } from '../utils/IconMapper';
import { THEME_COLORS, GLASSMORPHISM, SHADOWS } from '../constants/theme';

/**
 * Simplified Agent Node for ReactFlow
 * Glassmorphism design with status-based styling
 */
export default function SimpleAgentNode({ data }) {
    const { label, executionState = 'idle', icon = 'Bot', type = 'agent' } = data;

    // Status-based colors
    const getStatusColor = () => {
        switch (executionState) {
            case 'executing':
                return THEME_COLORS.status.executing;
            case 'completed':
                return THEME_COLORS.status.completed;
            case 'failed':
                return THEME_COLORS.status.failed;
            default:
                return THEME_COLORS.status.idle;
        }
    };

    const statusColor = getStatusColor();
    const isExecuting = executionState === 'executing';

    return (
        <div
            style={{
                minWidth: 180,
                padding: '16px',
                borderRadius: '12px',
                background: GLASSMORPHISM.backgroundDarker,
                backdropFilter: GLASSMORPHISM.backdropBlur,
                border: `2px solid ${statusColor}`,
                boxShadow: isExecuting ? SHADOWS.glow.blueLarge : SHADOWS.md,
                animation: isExecuting ? 'pulse 2s infinite' : 'none',
                transition: 'all 0.3s ease',
            }}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: statusColor,
                    width: 10,
                    height: 10,
                    border: '2px solid rgba(255,255,255,0.2)',
                }}
            />

            {/* Icon with status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                    style={{
                        position: 'relative',
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconMapper iconName={icon} size={24} style={{ color: statusColor }} />

                    {/* Status badge dot */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: statusColor,
                            border: '2px solid rgba(9,9,11,0.9)',
                            boxShadow: `0 0 8px ${statusColor}`,
                            animation: isExecuting ? 'ping 1s infinite' : 'none',
                        }}
                    />
                </div>

                {/* Agent name */}
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: THEME_COLORS.text.primary,
                            marginBottom: '2px',
                        }}
                    >
                        {label}
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            color: THEME_COLORS.text.tertiary,
                            textTransform: 'capitalize',
                        }}
                    >
                        {type}
                    </div>
                </div>
            </div>

            {/* Status indicator */}
            {isExecuting && (
                <div
                    style={{
                        fontSize: '10px',
                        color: statusColor,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    <div
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: statusColor,
                            animation: 'pulse 1s infinite',
                        }}
                    />
                    Processing...
                </div>
            )}

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: statusColor,
                    width: 10,
                    height: 10,
                    border: '2px solid rgba(255,255,255,0.2)',
                }}
            />

            {/* CSS Animations */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
