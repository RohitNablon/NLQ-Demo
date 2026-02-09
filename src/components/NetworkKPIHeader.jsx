import { Box, Typography, Chip } from '@mui/material'
import { THEME_COLORS, TYPOGRAPHY, Z_INDEX } from '../constants/theme'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface NetworkKPIHeaderProps {
    activeExecutions: number
    totalAgents: number
    successRate: number
    alertsCount: number
    lastUpdated: Date
    prevActiveExecutions?: number
    prevSuccessRate?: number
}

export default function NetworkKPIHeader({
    activeExecutions,
    totalAgents,
    successRate,
    alertsCount,
    lastUpdated,
    prevActiveExecutions = 0,
    prevSuccessRate = 0,
}: NetworkKPIHeaderProps) {
    // Determine if header should be expanded (has activity or completed agents)
    const isExpanded = activeExecutions > 0 || successRate > 0 || alertsCount > 0

    const getTimeSinceUpdate = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        if (seconds < 60) return `Updated ${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `Updated ${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        return `Updated ${hours}h ago`
    }

    const getTrendIndicator = (current: number, previous: number) => {
        if (current > previous) return { icon: TrendingUp, color: THEME_COLORS.status.success }
        if (current < previous) return { icon: TrendingDown, color: THEME_COLORS.status.danger }
        return { icon: Minus, color: THEME_COLORS.text.secondary }
    }

    const executionsTrend = getTrendIndicator(activeExecutions, prevActiveExecutions)
    const successTrend = getTrendIndicator(successRate, prevSuccessRate)
    const ExecutionTrendIcon = executionsTrend.icon
    const SuccessTrendIcon = successTrend.icon

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                height: isExpanded ? '60px' : '0px',
                opacity: isExpanded ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                background: 'transparent',
                zIndex: Z_INDEX.header,
                borderBottom: isExpanded ? `1px solid ${THEME_COLORS.border.light}` : 'none',
                transition: 'all 0.3s ease-in-out',
                overflow: 'hidden',
            }}
        >
            {/* KPI Metrics */}
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {/* Active Executions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: TYPOGRAPHY.fontFamily.primary,
                            fontSize: TYPOGRAPHY.fontSize.xs,
                            fontWeight: TYPOGRAPHY.fontWeight.bold,
                            color: THEME_COLORS.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                        }}
                    >
                        ACTIVE
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                            sx={{
                                fontFamily: TYPOGRAPHY.fontFamily.primary,
                                fontSize: TYPOGRAPHY.fontSize.xl,
                                fontWeight: TYPOGRAPHY.fontWeight.bold,
                                color: activeExecutions > 0 ? THEME_COLORS.accent.primary : THEME_COLORS.text.primary,
                            }}
                        >
                            {activeExecutions}
                        </Typography>
                        <ExecutionTrendIcon
                            size={14}
                            color={executionsTrend.color}
                            strokeWidth={2.5}
                        />
                    </Box>
                </Box>

                {/* Total Agents */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: TYPOGRAPHY.fontFamily.primary,
                            fontSize: TYPOGRAPHY.fontSize.xs,
                            fontWeight: TYPOGRAPHY.fontWeight.bold,
                            color: THEME_COLORS.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                        }}
                    >
                        AGENTS
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: TYPOGRAPHY.fontFamily.primary,
                            fontSize: TYPOGRAPHY.fontSize.xl,
                            fontWeight: TYPOGRAPHY.fontWeight.bold,
                            color: THEME_COLORS.text.primary,
                        }}
                    >
                        {totalAgents}
                    </Typography>
                </Box>

                {/* Success Rate */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: TYPOGRAPHY.fontFamily.primary,
                            fontSize: TYPOGRAPHY.fontSize.xs,
                            fontWeight: TYPOGRAPHY.fontWeight.bold,
                            color: THEME_COLORS.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                        }}
                    >
                        SUCCESS RATE
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                            sx={{
                                fontFamily: TYPOGRAPHY.fontFamily.primary,
                                fontSize: TYPOGRAPHY.fontSize.xl,
                                fontWeight: TYPOGRAPHY.fontWeight.bold,
                                color:
                                    successRate >= 90
                                        ? THEME_COLORS.status.success
                                        : successRate >= 70
                                            ? THEME_COLORS.status.warning
                                            : THEME_COLORS.status.danger,
                            }}
                        >
                            {successRate}%
                        </Typography>
                        <SuccessTrendIcon
                            size={14}
                            color={successTrend.color}
                            strokeWidth={2.5}
                        />
                    </Box>
                </Box>

                {/* Alerts/Failures */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: TYPOGRAPHY.fontFamily.primary,
                            fontSize: TYPOGRAPHY.fontSize.xs,
                            fontWeight: TYPOGRAPHY.fontWeight.bold,
                            color: THEME_COLORS.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                        }}
                    >
                        ALERTS
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                            sx={{
                                fontFamily: TYPOGRAPHY.fontFamily.primary,
                                fontSize: TYPOGRAPHY.fontSize.xl,
                                fontWeight: TYPOGRAPHY.fontWeight.bold,
                                color: alertsCount > 0 ? THEME_COLORS.status.danger : THEME_COLORS.text.primary,
                            }}
                        >
                            {alertsCount}
                        </Typography>
                        {alertsCount > 0 && (
                            <Chip
                                label="!"
                                size="small"
                                sx={{
                                    height: '18px',
                                    minWidth: '18px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    backgroundColor: THEME_COLORS.status.danger,
                                    color: '#fff',
                                    '& .MuiChip-label': { px: 0.5 },
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Last Updated */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: THEME_COLORS.accent.primary,
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.4 },
                        },
                    }}
                />
                <Typography
                    variant="caption"
                    sx={{
                        fontFamily: TYPOGRAPHY.fontFamily.primary,
                        fontSize: TYPOGRAPHY.fontSize.sm,
                        fontWeight: TYPOGRAPHY.fontWeight.medium,
                        color: THEME_COLORS.text.secondary,
                    }}
                >
                    {getTimeSinceUpdate(lastUpdated)}
                </Typography>
            </Box>
        </Box>
    )
}
