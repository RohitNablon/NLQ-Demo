import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
    Node,
    Edge,
    Controls,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
    Background,
    BackgroundVariant,
    MiniMap,
} from 'reactflow'
import { Box, Button, Typography, Paper, Tooltip } from '@mui/material'
import { AutoFixHigh as AutoArrangeIcon } from '@mui/icons-material'
import AgentNode from './AgentNode'
import { hierarchicalLayout } from '../utils/layout'
import { useExecutionTracker } from '../hooks/useExecutionTracker'
import EditAgentDialog from './EditAgentDialog'
import NodeDetailPanel from './NodeDetailPanel'
import NetworkKPIHeader from './NetworkKPIHeader'
import AnimatedEdge from './AnimatedEdge'
import { getConnectedServices } from '../services/oauthService'

const nodeTypes = { agent: AgentNode }
const edgeTypes = { animated: AnimatedEdge }

interface NetworkGraphProps {
    network: any
    sessionId?: string | null
    isEditable?: boolean
    onNetworkUpdate?: (updatedNetwork: any) => void
    externalExecutionState?: any // Use specific type if possible, or any for now to avoid extensive import changes.
}

export default function NetworkGraph({
    network,
    sessionId = null,
    isEditable = false,
    onNetworkUpdate,
    externalExecutionState
}: NetworkGraphProps) {
    const formatNetworkName = (name: string) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    // Sanitize name to match backend logic (OpenAI compatibility)
    const sanitizeName = (name: string) => {
        return name
            .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace invalid chars
            .replace(/_+/g, '_')              // Remove consecutive underscores
            .replace(/^_+|_+$/g, '')          // Trim leading/trailing underscores
    }

    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
    const { fitView } = useReactFlow()
    const [layoutKey, setLayoutKey] = useState(0)

    // Use external state if provided, otherwise generic hook (fallback)
    // Actually, we want to share state. So we should use the one passed from App.
    // If not passed, use hook.
    const internalTracker = useExecutionTracker(sessionId)
    const executionState = externalExecutionState || internalTracker.executionState

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState<{ name: string; data: any } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Detail panel state
    const [detailPanelOpen, setDetailPanelOpen] = useState(false)
    const [selectedNodeForDetail, setSelectedNodeForDetail] = useState<{ name: string; data: any; state: 'idle' | 'executing' | 'completed' | 'failed' } | null>(null)

    // Hover state for lineage highlighting
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
    const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set())

    // OAuth connection state
    const [oauthConnections, setOauthConnections] = useState<Set<string>>(new Set())
    const userId = import.meta.env.VITE_USER_ID || 'demo_user'

    // Tools that require OAuth (expandable list)
    const AUTH_REQUIRED_TOOLS = ['gmail_scanner', 'send_gmail_hocon_html']

    // Fetch OAuth connections on mount
    useEffect(() => {
        async function fetchConnections() {
            try {
                const connections = await getConnectedServices(userId)
                const connectedServices = new Set(
                    connections
                        .filter(conn => conn.connected)
                        .map(conn => conn.service)
                )
                setOauthConnections(connectedServices)
            } catch (err) {
                console.error('Failed to fetch OAuth connections:', err)
            }
        }
        fetchConnections()
    }, [])

    // 1. Initial Graph Construction (Structure & Layout)
    useEffect(() => {
        if (!network || !network.definition) return

        const definition = network.definition
        const newNodes: Node[] = []
        const newEdges: Edge[] = []

        // Create nodes
        Object.entries(definition).forEach(([agentName, agentData]: [string, any]) => {
            const isAgent = 'instructions' in agentData

            // Determine OAuth requirements
            const requiresAuth = AUTH_REQUIRED_TOOLS.includes(agentName)
            const authConnected = requiresAuth ? oauthConnections.has('gmail') : undefined

            newNodes.push({
                id: agentName,
                type: 'agent',
                position: { x: 0, y: 0 },
                dragHandle: '.agent-node-header',
                data: {
                    label: agentName,
                    isAgent: isAgent,
                    instructions: agentData.instructions || '',
                    description: agentData.description || '',
                    executionState: 'idle', // Initial state
                    icon: agentData.icon,
                    requiresAuth,
                    authConnected,
                },
            })

            // Create edges
            if (agentData.tools && Array.isArray(agentData.tools)) {
                agentData.tools.forEach((tool: string) => {
                    newEdges.push({
                        id: `${agentName}-${tool}`,
                        source: agentName,
                        target: tool,
                        type: 'animated',  // Use custom animated edge
                        animated: false,
                        data: {
                            isActive: false,
                            isHighlighted: false,
                            isDimmed: false,
                            packetCount: 1,
                            thickness: 2,
                        },
                        style: { strokeWidth: 2, stroke: '#94a3b8', opacity: 0.6 },
                        markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#94a3b8' },
                    })
                })
            }
        })

        const layoutedNodes = hierarchicalLayout(newNodes, newEdges)
        setNodes(layoutedNodes)
        setEdges(newEdges)

        setTimeout(() => fitView(), 100)
    }, [network, layoutKey, fitView, setNodes, setEdges, oauthConnections])

    // 2. Efficient Status Updates (No Re-layout)
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                const sanitizedId = sanitizeName(node.id)
                let status: 'idle' | 'executing' | 'completed' | 'failed' = 'idle'

                if (executionState.activeAgents.has(sanitizedId)) {
                    status = 'executing'
                } else if (executionState.completedAgents.has(sanitizedId)) {
                    status = 'completed'
                } else if (executionState.failedAgents.has(sanitizedId)) {
                    status = 'failed'
                }

                return {
                    ...node,
                    data: {
                        ...node.data,
                        executionState: status,
                    },
                    style: {
                        ...node.style,
                        opacity: hoveredNodeId !== null && !highlightedNodes.has(node.id) ? 0.3 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                    },
                }
            })
        )

        setEdges((eds) =>
            eds.map((edge) => {
                const sourceSanitized = sanitizeName(edge.source)
                const targetSanitized = sanitizeName(edge.target)

                const isActive = executionState.activeAgents.has(sourceSanitized) && executionState.activeAgents.has(targetSanitized)
                const isCompleted = executionState.completedAgents.has(sourceSanitized) && executionState.completedAgents.has(targetSanitized)
                const isFailed = executionState.failedAgents.has(sourceSanitized) || executionState.failedAgents.has(targetSanitized)

                // Premium theme colors: Electric Blue for active, Muted Green for completed
                const newColor = isActive ? '#00D4FF' : isCompleted ? '#66BB6A' : isFailed ? '#FF4444' : '#94a3b8'
                const newWidth = isActive ? 3 : 2
                const newOpacity = isActive ? 1 : 0.6

                // Determine packet count based on importance (active agents have more packets)
                const packetCount = isActive ? 2 : 1

                return {
                    ...edge,
                    animated: isActive,
                    data: {
                        ...edge.data,
                        isActive,
                        isHighlighted: highlightedEdges.has(edge.id),
                        isDimmed: hoveredNodeId !== null && !highlightedEdges.has(edge.id),
                        packetCount,
                        thickness: newWidth,
                    },
                    style: {
                        ...edge.style,
                        strokeWidth: newWidth,
                        stroke: newColor,
                        opacity: newOpacity,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 15,
                        height: 15,
                        color: newColor,
                    },
                }
            })
        )
    }, [executionState, setNodes, setEdges])

    const handleAutoArrange = useCallback(() => {
        setLayoutKey(prev => prev + 1)
        setTimeout(() => fitView(), 100)
    }, [fitView])

    const handleNodeClick = (_: React.MouseEvent, node: Node) => {
        if (!network) return

        const agentData = network.definition[node.id]
        if (agentData) {
            const sanitizedId = sanitizeName(node.id)
            // Determine execution state
            let state: 'idle' | 'executing' | 'completed' | 'failed' = 'idle'
            if (executionState.activeAgents.has(sanitizedId)) state = 'executing'
            else if (executionState.completedAgents.has(sanitizedId)) state = 'completed'
            else if (executionState.failedAgents.has(sanitizedId)) state = 'failed'

            // Open detail panel
            setSelectedNodeForDetail({ name: node.id, data: agentData, state })
            setDetailPanelOpen(true)
        }
    }

    const handleSaveAgent = async (agentName: string, updatedData: { instructions?: string; tools: string[] }) => {
        if (!network) return

        setIsSaving(true)
        try {
            const newDefinition = {
                ...network.definition,
                [agentName]: {
                    ...network.definition[agentName],
                    ...updatedData
                }
            }

            const response = await fetch(`/api/networks/${network.network_name}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    definition: newDefinition,
                    top_agent: network.top_agent,
                    sample_queries: network.sample_queries
                })
            })

            const result = await response.json()
            if (result.success) {
                if (onNetworkUpdate) {
                    onNetworkUpdate({
                        ...network,
                        definition: newDefinition
                    })
                }
                setEditDialogOpen(false)
            } else {
                console.error('Failed to save network:', result.message)
            }
        } catch (error) {
            console.error('Error saving agent:', error)
        } finally {
            setIsSaving(false)
        }
    }

    if (!network) {
        return (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Create or select a network to visualize
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            // React Flow Controls Override
            '& .react-flow__controls': {
                background: 'rgba(9, 9, 11, 0.6) !important',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px !important',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2) !important',
                padding: '2px !important',
                left: '16px',
                bottom: '16px',
            },
            '& .react-flow__controls-button': {
                background: 'transparent !important',
                border: 'none !important',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05) !important',
                borderRadius: '4px !important',
                width: '20x !important',
                height: '20px !important',
                margin: '2px 0 !important',
                transition: 'all 0.2s',
                '&:last-child': {
                    borderBottom: 'none !important',
                },
                '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1) !important',
                },
                '& svg': {
                    fill: '#94a3b8 !important',
                    maxWidth: '16px !important',
                    maxHeight: '16px !important',
                },
                '&:hover svg': {
                    fill: '#fff !important',
                }
            }
        }}>
            {/* KPI Header */}
            <NetworkKPIHeader
                activeExecutions={executionState.activeAgents.size}
                totalAgents={nodes.length}
                successRate={(() => {
                    const triggeredAgents = executionState.activeAgents.size +
                        executionState.completedAgents.size +
                        executionState.failedAgents.size
                    return triggeredAgents > 0
                        ? Math.round((executionState.completedAgents.size / triggeredAgents) * 100)
                        : 0
                })()}
                alertsCount={executionState.failedAgents.size}
                lastUpdated={new Date()}
            />

            {/* Main Graph Container */}
            <Box sx={{ flex: 1, position: 'relative' }}>
                {/* Top Controls */}
                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 10,
                    display: 'flex',
                    gap: 1,
                    // background: 'rgba(9, 9, 11, 0.8)',
                    backdropFilter: 'blur(16px)',
                    // border: '1px solid rgba(255, 255, 255, 0.10)',
                    borderRadius: '3px',
                    p: 1,
                }}>
                    <Tooltip title="Auto arrange nodes">
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<AutoArrangeIcon sx={{ fontSize: '0.875rem' }} />}
                            onClick={handleAutoArrange}
                            sx={{
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                minWidth: 'auto',
                                px: 2,
                                py: 1,
                                borderRadius: '4px',
                                textTransform: 'none',
                                border: '1px solid rgba(6, 182, 212, 0.4)',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                                    border: '1px solid rgba(6, 182, 212, 0.6)',
                                },
                            }}
                        >
                            Auto Arrange
                        </Button>
                    </Tooltip>
                </Box>

                {/* Network Info */}
                <Paper
                    elevation={0}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        p: 2,
                        background: 'rgba(9, 9, 11, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                        borderRadius: '3px',
                    }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600, // font-semibold from AML-NXT
                            fontSize: '14px', // text-base
                            fontFamily: 'Jost',
                            color: '#ffffffff',
                            display: 'block',
                            mb: 0.5,
                        }}
                    >
                        {formatNetworkName(network.network_name)}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#ffffffff', // text-gray-400
                            fontSize: '12px', // text-sm
                            fontWeight: 400,
                            fontFamily: 'Jost',
                        }}
                    >
                        {nodes.length} agents
                    </Typography>
                    {executionState.isExecuting && (
                        <Typography variant="caption" sx={{ color: '#fbbf24', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                            ⚡ Executing...
                        </Typography>
                    )}
                </Paper>

                {/* ReactFlow */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    onNodeMouseEnter={(_, node) => {
                        setHoveredNodeId(node.id)
                        // Find all connected nodes and edges
                        const connected = new Set<string>()
                        const connectedEdges = new Set<string>()

                        // Add the hovered node
                        connected.add(node.id)

                        // Find all edges connected to this node
                        edges.forEach(edge => {
                            if (edge.source === node.id || edge.target === node.id) {
                                connectedEdges.add(edge.id)
                                connected.add(edge.source)
                                connected.add(edge.target)
                            }
                        })

                        setHighlightedNodes(connected)
                        setHighlightedEdges(connectedEdges)
                    }}
                    onNodeMouseLeave={() => {
                        setHoveredNodeId(null)
                        setHighlightedNodes(new Set())
                        setHighlightedEdges(new Set())
                    }}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                >
                    <Background
                        color="#475569"
                        gap={24}
                        size={1}
                        variant={BackgroundVariant.Dots}
                        style={{ opacity: 0.2 }}
                    />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            // Match node colors to execution state
                            const state = node.data.executionState || 'idle'
                            if (state === 'executing') return '#00D4FF'  // Electric Blue
                            if (state === 'completed') return '#66BB6A'  // Muted Green
                            if (state === 'failed') return '#FF4444'  // Crimson
                            return '#94a3b8'  // Slate gray
                        }}
                        maskColor="rgba(10, 14, 39, 0.7)"  // Dark overlay
                        style={{
                            background: 'rgba(9, 9, 11, 0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                        }}
                    />
                </ReactFlow>

                {/* Edit Dialog */}
                {selectedAgent && (
                    <EditAgentDialog
                        open={editDialogOpen}
                        onClose={() => setEditDialogOpen(false)}
                        onSave={handleSaveAgent}
                        agentName={selectedAgent.name}
                        agentData={selectedAgent.data}
                        availableTools={Object.keys(network.definition)}
                        isSaving={isSaving}
                    />
                )}
            </Box>

            {/* Detail Panel */}
            {selectedNodeForDetail && (
                <NodeDetailPanel
                    isOpen={detailPanelOpen}
                    onClose={() => setDetailPanelOpen(false)}
                    agentName={selectedNodeForDetail.name}
                    agentData={selectedNodeForDetail.data}
                    executionState={selectedNodeForDetail.state}
                />
            )}
        </Box>
    )
}
