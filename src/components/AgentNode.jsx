import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Box, Typography, keyframes, Tooltip } from '@mui/material'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { IconMapper } from '../utils/IconMapper'
import { THEME_COLORS, SHADOWS, ANIMATIONS, GLASSMORPHISM } from '../constants/theme'

// Pulse animation for executing state (Border/Shadow) - Electric Blue
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(0, 212, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
`;

// Gentle background pulsing for executing state - Electric Blue
const pulseBg = keyframes`
  0% { background-color: rgba(0, 212, 255, 0.05); }
  50% { background-color: rgba(0, 212, 255, 0.12); }
  100% { background-color: rgba(0, 212, 255, 0.05); }
`;

interface AgentNodeProps {
    data: {
        label: string
        isAgent: boolean
        instructions?: string
        description?: string
        executionState?: 'idle' | 'executing' | 'completed' | 'failed'
        icon?: string
        requiresAuth?: boolean  // Tool requires OAuth
        authConnected?: boolean  // OAuth is connected
    }
}

const STATE_CONFIG = {
    idle: {
        color: THEME_COLORS.status.idle,
        borderColor: THEME_COLORS.border.light,
        glow: 'rgba(255, 255, 255, 0.05)'
    },
    executing: {
        color: THEME_COLORS.status.executing,  // Electric blue #00D4FF
        borderColor: THEME_COLORS.status.executing,
        glow: 'rgba(0, 212, 255, 0.6)'  // Electric blue glow
    },
    completed: {
        color: THEME_COLORS.status.completed,  // Muted green
        borderColor: THEME_COLORS.status.completed,
        glow: 'rgba(102, 187, 106, 0.6)'
    },
    failed: {
        color: THEME_COLORS.status.failed,  // Crimson
        borderColor: THEME_COLORS.status.failed,
        glow: 'rgba(255, 68, 68, 0.6)'
    }
}

function AgentNode({ data }: AgentNodeProps) {
    const { label, isAgent, description, executionState = 'idle', icon, requiresAuth, authConnected } = data
    const config = STATE_CONFIG[executionState] || STATE_CONFIG.idle;

    // Determine if auth warning should be shown
    const showAuthWarning = requiresAuth && !authConnected

    const formatAgentName = (name: string) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    return (
        <Tooltip
            title={description || ''}
            arrow
            placement="top"
            enterDelay={300}
            sx={{
                '& .MuiTooltip-tooltip': {
                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '0.8rem',
                    maxWidth: '300px',
                    fontFamily: 'Jost',
                },
                '& .MuiTooltip-arrow': {
                    color: 'rgba(9, 9, 11, 0.95)',
                },
            }}
        >
            <Box
                className="agent-node-header"
                sx={{
                    position: 'relative',
                    minWidth: 200,
                    maxWidth: 280,
                    borderRadius: '16px',
                    background: executionState === 'executing'
                        ? 'rgba(0, 212, 255, 0.05)'
                        : GLASSMORPHISM.backgroundDarker,
                    animation: executionState === 'executing' ? `${pulseBg} 2s ease-in-out infinite` : 'none',
                    backdropFilter: GLASSMORPHISM.backdropBlur,
                    border: executionState === 'idle' ? '1px solid' : '2px solid',
                    borderColor: config.borderColor,
                    transition: `all ${ANIMATIONS.duration.medium} ${ANIMATIONS.easing.default}`,
                    boxShadow: (executionState === 'idle' || executionState === 'completed')
                        ? SHADOWS.md
                        : `${SHADOWS.glow[executionState === 'executing' ? 'blue' : executionState === 'failed' ? 'red' : 'green']}, ${SHADOWS.glass}, ${SHADOWS.lg}`,
                    '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: executionState === 'idle'
                            ? `${SHADOWS.glow.blue}, ${SHADOWS.xl}`
                            : `0 0 30px ${config.glow}, ${SHADOWS.xl}`,
                        borderColor: executionState === 'idle' ? THEME_COLORS.accent.primary : config.borderColor,
                    },
                    '&::after': executionState === 'executing' ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '16px',
                        boxShadow: '0 0 0 0 rgba(0, 212, 255, 0.4)',
                        animation: `${pulse} 2s infinite`,
                        zIndex: -1,
                    } : {}
                }}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    style={{
                        background: config.color,
                        width: 10,
                        height: 10,
                        border: '2px solid rgba(30, 41, 59, 1)',
                        top: -5,
                    }}
                />

                {/* Header Section */}
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}>
                    {/* Icon with status badge */}
                    <Box sx={{ position: 'relative' }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            background: isAgent
                                ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 180, 255, 0.15) 100%)'
                                : 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(71, 85, 105, 0.1) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid',
                            borderColor: isAgent ? THEME_COLORS.accent.primary + '4D' : 'rgba(148, 163, 184, 0.2)',
                            boxShadow: isAgent ? `0 0 12px ${THEME_COLORS.accent.primary}33` : 'none',
                        }}>
                            <IconMapper
                                iconName={icon || (isAgent ? "Bot" : "Wrench")}
                                size={24}
                                color={isAgent ? THEME_COLORS.accent.primary : '#cbd5e1'}
                            />
                        </Box>

                        {/* Status Badge Dot */}
                        {executionState !== 'idle' && (
                            <Box sx={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: config.color,
                                border: '2px solid rgba(30, 41, 59, 1)',
                                boxShadow: `0 0 8px ${config.glow}`,
                            }} />
                        )}

                        {/* Auth Warning Indicator */}
                        {showAuthWarning && (
                            <Tooltip
                                title="Requires OAuth authentication"
                                placement="top"
                                arrow
                            >
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: -4,
                                    right: -4,
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(234, 179, 8, 0.9)',
                                    border: '2px solid rgba(30, 41, 59, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 12px rgba(234, 179, 8, 0.6)',
                                    fontSize: '0.7rem',
                                }}>
                                    ⚠️
                                </Box>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Agent Name */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: '#fff',
                                fontWeight: 700,
                                fontFamily: 'Jost',
                                letterSpacing: '0.01em',
                                fontSize: '1rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {formatAgentName(label)}
                        </Typography>
                    </Box>

                    {/* Status Icon */}
                    {executionState !== 'idle' && (
                        <Box sx={{
                            animation: executionState === 'executing' ? 'spin 2s linear infinite' : 'none',
                            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {executionState === 'executing' && <Loader2 size={18} color={THEME_COLORS.status.executing} />}
                            {executionState === 'completed' && <CheckCircle2 size={18} color={THEME_COLORS.status.completed} />}
                            {executionState === 'failed' && <AlertCircle size={18} color={THEME_COLORS.status.failed} />}
                        </Box>
                    )}
                </Box>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    style={{
                        background: config.color,
                        width: 10,
                        height: 10,
                        border: '2px solid rgba(30, 41, 59, 1)',
                        bottom: -5,
                    }}
                />
            </Box>
        </Tooltip>
    )
}

export default AgentNode
