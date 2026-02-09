import { Node, Edge } from 'reactflow'
import dagre from 'dagre'

/**
 * Enterprise hierarchical layout using Dagre
 * Optimized for networks with 30+ agents
 * Provides better spacing, collision avoidance, and visual hierarchy
 */
export function hierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
    const dagreGraph = new dagre.graphlib.Graph()

    // Configure graph layout
    dagreGraph.setGraph({
        rankdir: 'TB',        // Top to bottom
        nodesep: 100,         // Horizontal spacing between nodes (increased for clarity)
        ranksep: 150,         // Vertical spacing between ranks/levels
        marginx: 50,
        marginy: 50,
        acyclicer: 'greedy',  // Handle cycles intelligently
    })

    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const nodeWidth = 220
    const nodeHeight = 80

    // Add nodes to dagre graph
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    // Add edges to dagre graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    // Calculate layout
    dagre.layout(dagreGraph)

    // Apply positions to nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        }
    })

    return layoutedNodes
}
