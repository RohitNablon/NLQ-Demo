import { memo } from 'react'
import { EdgeProps, getBezierPath } from 'reactflow'

interface AnimatedEdgeProps extends EdgeProps {
    data?: {
        isActive?: boolean
        isHighlighted?: boolean
        isDimmed?: boolean
        packetCount?: number
        thickness?: number
    }
}

const AnimatedEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data = {},
}: AnimatedEdgeProps) => {
    const { isActive = false, isHighlighted = false, isDimmed = false, packetCount = 1, thickness = 2 } = data

    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    // Determine edge styling based on state
    const getEdgeColor = () => {
        if (isDimmed) return '#94a3b8'
        if (isHighlighted) return '#00D4FF'  // Electric Blue
        if (isActive) return '#00D4FF'
        return style.stroke || '#94a3b8'
    }

    const getEdgeOpacity = () => {
        if (isDimmed) return 0.15
        if (isHighlighted) return 1
        if (isActive) return 1
        return style.opacity || 0.6
    }

    const edgeColor = getEdgeColor()
    const edgeOpacity = getEdgeOpacity()
    const strokeWidth = isActive || isHighlighted ? thickness * 1.5 : thickness

    return (
        <g className="react-flow__edge">
            {/* Glow and gradient definitions */}
            {(isActive || isHighlighted) && (
                <defs>
                    <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={edgeColor} stopOpacity="0.2" />
                        <stop offset="50%" stopColor={edgeColor} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={edgeColor} stopOpacity="0.2" />
                    </linearGradient>
                    <filter id={`glow-${id}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            )}

            {/* Base edge path */}
            <path
                id={`path-${id}`}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={strokeWidth}
                stroke={edgeColor}
                opacity={edgeOpacity}
                fill="none"
                markerEnd={markerEnd ? `url(#marker-${id})` : undefined}
                style={{
                    transition: 'all 0.3s ease-in-out',
                }}
            />

            {/* Glowing gradient overlay for active/highlighted edges */}
            {(isActive || isHighlighted) && (
                <path
                    d={edgePath}
                    strokeWidth={strokeWidth + 4}
                    stroke={`url(#gradient-${id})`}
                    opacity={0.6}
                    fill="none"
                    filter={`url(#glow-${id})`}
                >
                    {isActive && (
                        <animate
                            attributeName="opacity"
                            values="0.6;1;0.6"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    )}
                </path>
            )}

            {/* Animated data packets using animateMotion */}
            {isActive && (
                <>
                    {Array.from({ length: packetCount }).map((_, index) => (
                        <g key={`packet-${id}-${index}`}>
                            <circle
                                r={3}
                                fill={edgeColor}
                                filter={`url(#glow-${id})`}
                            >
                                <animateMotion
                                    dur={`${2 + (Math.random() * 0.5)}s`}
                                    repeatCount="indefinite"
                                    begin={`${index * 0.4}s`}
                                >
                                    <mpath href={`#path-${id}`} />
                                </animateMotion>
                                <animate
                                    attributeName="r"
                                    values="3;5;3"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    dur="2s"
                                    repeatCount="indefinite"
                                    begin={`${index * 0.4}s`}
                                />
                            </circle>
                        </g>
                    ))}
                </>
            )}

            {/* Custom arrow marker */}
            {markerEnd && (
                <defs>
                    <marker
                        id={`marker-${id}`}
                        markerWidth={15}
                        markerHeight={15}
                        refX={12}
                        refY={6}
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path
                            d="M0,0 L0,12 L12,6 z"
                            fill={edgeColor}
                            opacity={edgeOpacity}
                        />
                    </marker>
                </defs>
            )}
        </g>
    )
})

AnimatedEdge.displayName = 'AnimatedEdge'

export default AnimatedEdge

