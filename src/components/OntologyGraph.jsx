import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Maximize, X, Database, FileText, Layers, ZoomIn, ZoomOut, ArrowRight } from 'lucide-react';

const OntologyGraph = ({ metadata, glossaryTerms = [] }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const fgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, fact, dim, term

    // --- Resize Handler ---
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        const timer = setTimeout(updateDimensions, 100);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timer);
        };
    }, []);

    // --- Helper: Text Wrap ---
    const wrapText = (ctx, text, maxWidth) => {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    // --- Graph Data Prep & Layout ---
    const graphData = useMemo(() => {
        if (!metadata || !metadata.tables) return { nodes: [], links: [] };

        const nodes = [];
        const links = [];
        const nodesMap = new Map();

        // 1. Separate Entities
        const facts = [];
        const dims = [];
        const terms = [];

        // Identify Tables
        metadata.tables.forEach(table => {
            const isFact = table.table_name.startsWith('Fact');
            if (isFact) facts.push(table);
            else dims.push(table);
        });

        // Identify Terms
        glossaryTerms.forEach(term => terms.push(term));

        // 2. CONCENTRIC LAYOUT CALCULATION
        // Center (0,0) -> Facts
        // Ring 1 (R=250) -> Dims
        // Ring 2 (R=450) -> Terms

        const centerX = 0;
        const centerY = 0;

        // --- Facts (Center Grid or Circle) ---
        const factRadius = facts.length > 1 ? 100 : 0;
        facts.forEach((active, i) => {
            const angle = (i / facts.length) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * factRadius;
            const y = centerY + Math.sin(angle) * factRadius;

            const node = {
                id: active.table_name,
                group: 'fact',
                label: active.table_name,
                fullData: active,
                fx: x, fy: y, // LOCK POSITION
                color: '#3b82f6', bg: '#1f1f23', borderColor: '#2563eb'
            };
            nodes.push(node);
            nodesMap.set(active.table_name, node);
        });

        // --- Dims (Middle Ring) ---
        const dimRadius = 300;
        dims.forEach((active, i) => {
            // Distribute evenly
            const angle = (i / dims.length) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * dimRadius;
            const y = centerY + Math.sin(angle) * dimRadius;

            const node = {
                id: active.table_name,
                group: 'dim',
                label: active.table_name,
                fullData: active,
                fx: x, fy: y,
                color: '#06b6d4', bg: '#1f1f23', borderColor: '#0891b2'
            };
            nodes.push(node);
            nodesMap.set(active.table_name, node);
        });

        // --- Terms (Outer Ring or clustered) ---
        // Basic outer ring for now, can be improved to cluster near mapped table
        const termRadius = 550;
        terms.forEach((active, i) => {
            const angle = (i / terms.length) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * termRadius;
            const y = centerY + Math.sin(angle) * termRadius;

            const nodeId = `Term: ${active.term}`;
            const node = {
                id: nodeId,
                group: 'term',
                label: active.term,
                fullData: active,
                fx: x, fy: y,
                color: '#22c55e', bg: '#1f1f23', borderColor: '#16a34a'
            };
            nodes.push(node);
            nodesMap.set(nodeId, node);
        });

        // 3. Links
        // Fact -> Dim
        facts.forEach(fact => {
            dims.forEach(dim => {
                const commonCol = fact.columns.find(sc =>
                    dim.columns.some(tc => tc.name === sc.name && tc.is_primary_key)
                );
                if (commonCol) {
                    links.push({
                        source: fact.table_name,
                        target: dim.table_name,
                        type: 'HAS',
                        color: '#52525b', // Zinc-600
                        width: 2
                    });
                }
            });
        });

        // Term -> Table
        terms.forEach(term => {
            if (term.mapping) {
                const targetTable = term.mapping.split('.')[0];
                const nodeId = `Term: ${term.term}`;
                if (nodesMap.has(targetTable)) {
                    links.push({
                        source: nodeId,
                        target: targetTable,
                        type: 'MAPS_TO',
                        color: '#22c55e',
                        width: 1,
                        dashed: [4, 4]
                    });
                }
            }
        });

        // Filter nodes based on state
        const filteredNodes = nodes.filter(n => {
            if (filterType === 'all') return true;
            return n.group === filterType;
        });

        // Filter links: only if both source and target are in filteredNodes
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredLinks = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

        return { nodes: filteredNodes, links: filteredLinks };

    }, [metadata, glossaryTerms, filterType]);

    // --- Enterprise Card Renderer ---
    const drawCard = (node, ctx, globalScale) => {
        // Dynamic Sizing based on Label
        const baseWidth = node.group === 'fact' ? 160 : (node.group === 'dim' ? 140 : 120);
        // Estimate width needed: approx 7px per char at font size 12
        const estimatedTextWidth = node.label.length * 7;
        const width = Math.max(baseWidth, estimatedTextWidth + 20); // Expand if needed
        const height = node.group === 'fact' ? 80 : 50;

        node.width = width; // Update node props for interaction
        node.height = height;

        const x = node.x;
        const y = node.y;
        const fontSize = 12 / globalScale;
        const padding = 6 / globalScale;
        const cornerRadius = 4 / globalScale;

        // Shadow
        if (selectedNode?.id === node.id) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 20;
        } else {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 6;
        }
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Background
        ctx.fillStyle = node.bg;
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y - height / 2, width, height, cornerRadius);
        ctx.fill();

        // Border
        ctx.strokeStyle = node.borderColor;
        ctx.lineWidth = (selectedNode?.id === node.id ? 2.5 : 1) / globalScale;
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset

        // Header Band (Fact/Dim only)
        if (node.group !== 'term') {
            ctx.fillStyle = node.group === 'fact' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)';
            ctx.beginPath();
            ctx.roundRect(x - width / 2, y - height / 2, width, height * 0.4, [cornerRadius, cornerRadius, 0, 0]);
            ctx.fill();
        }

        // Text
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Full text, no truncation, scale down if massive? 
        // We already expanded box width, so just draw it.
        ctx.fillText(node.label, x, y - height * 0.15);

        // Badge / Subtitle
        const badgeSize = 9 / globalScale;
        ctx.font = `${badgeSize}px Inter, sans-serif`;
        ctx.fillStyle = '#a1a1aa';

        if (node.group === 'fact') {
            ctx.fillText("FACT TABLE", x, y + height * 0.25);
        } else if (node.group === 'dim') {
            ctx.fillText("DIMENSION", x, y + height * 0.25);
        } else {
            ctx.fillText("TERM", x, y + height * 0.25);
        }
    };

    return (
        <div style={{ position: 'relative', height: '700px', width: '100%', background: '#09090b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden', display: 'flex' }}>
            <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
                <ForceGraph2D
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    backgroundColor="#09090b"
                    nodeCanvasObject={drawCard}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        ctx.fillStyle = color;
                        ctx.fillRect(node.x - node.width / 2, node.y - node.height / 2, node.width, node.height);
                    }}
                    linkColor={link => link.color}
                    linkWidth={link => link.width}
                    linkLineDash={link => link.dashed}
                    // Disable forces since we are using fixed layout, but keep zoom/pan
                    d3AlphaDecay={1}
                    d3VelocityDecay={1}
                />

                {/* Overlays (Search, Legend, etc - Same as before) */}
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['all', 'fact', 'dim', 'term'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: filterType === type ? '#3b82f6' : '#3f3f46',
                                    background: filterType === type ? 'rgba(59, 130, 246, 0.2)' : 'rgba(39, 39, 42, 0.9)',
                                    color: filterType === type ? '#60a5fa' : '#a1a1aa',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(8px)'
                                }}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, background: 'rgba(39, 39, 42, 0.9)', padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', backdropFilter: 'blur(8px)', minWidth: '180px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Topology Legend</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 14, height: 8, borderRadius: '2px', border: '1px solid #3b82f6', background: '#1e3a8a' }}></div>
                            <span style={{ color: '#d4d4d8', fontSize: '11px' }}>Fact Table (Center)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 14, height: 8, borderRadius: '2px', border: '1px solid #06b6d4', background: '#164e63' }}></div>
                            <span style={{ color: '#d4d4d8', fontSize: '11px' }}>Dimension (Layer 1)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 14, height: 8, borderRadius: '2px', border: '1px solid #22c55e', background: '#14532d' }}></div>
                            <span style={{ color: '#d4d4d8', fontSize: '11px' }}>Business Term (Layer 2)</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Sidebar Details Panel (Preserved functionality) */}
            {selectedNode && (
                <div
                    className="slide-in-right"
                    style={{
                        width: '30%',
                        minWidth: '350px',
                        height: '100%',
                        background: '#18181b',
                        borderLeft: '1px solid #27272a',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 20
                    }}
                >
                    <div style={{ padding: '20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#27272a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {selectedNode.group === 'term' ? <FileText size={20} color="#22c55e" /> : <Database size={20} color={selectedNode.color} />}
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 600 }}>{selectedNode.label}</h2>
                        </div>
                        <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ color: '#71717a', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Description</h3>
                            <p style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: '1.6' }}>
                                {selectedNode.fullData?.description?.description || selectedNode.fullData?.definition || 'No description available for this entity.'}
                            </p>
                        </div>
                        {/* Schema or Term details would go here (preserved from previous version) */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OntologyGraph;
