import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Table } from 'lucide-react';

const OntologyGraph = ({ metadata, glossaryTerms = [] }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const fgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }

            // Tune forces after mount
            if (fgRef.current) {
                fgRef.current.d3Force('charge').strength(-400); // Much stronger repulsion
                fgRef.current.d3Force('link').distance(120).strength(node => node.strength || 0.4); // Longer links
                fgRef.current.d3Force('center').strength(0.5);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const graphData = useMemo(() => {
        if (!metadata || !metadata.tables) return { nodes: [], links: [] };

        const nodesMap = new Map();
        const links = [];

        // 1. Add Table Nodes
        metadata.tables.forEach(table => {
            nodesMap.set(table.table_name, {
                id: table.table_name,
                group: 'table',
                label: table.table_name,
                size: 32, // Larger
                details: `${table.columns?.length || 0} Columns`,
                fullData: table
            });
        });

        // 2. Table-to-Table links (Fact to Dim)
        const factTables = metadata.tables.filter(t => t.table_name.startsWith('Fact'));
        const dimTables = metadata.tables.filter(t => t.table_name.startsWith('Dim'));

        factTables.forEach(fact => {
            dimTables.forEach(dim => {
                const dimPk = dim.columns?.find(c => c.is_primary_key);
                if (dimPk) {
                    const matchCol = fact.columns?.find(c => c.name === dimPk.name);
                    if (matchCol) {
                        links.push({
                            source: fact.table_name,
                            target: dim.table_name,
                            label: 'HAS', // Relationship label
                            color: 'rgba(0, 123, 255, 0.4)',
                            strength: 1
                        });
                    }
                }
            });
        });

        // 3. Add Glossary Nodes (with deduplication)
        glossaryTerms.forEach(term => {
            const nodeId = `Term_${term.term}`;
            if (nodesMap.has(nodeId)) return; // Skip duplicates

            nodesMap.set(nodeId, {
                id: nodeId,
                group: 'term',
                label: term.term,
                size: 20,
                details: term.mapping
            });

            if (term.mapping) {
                // Robust matching: Look for table name in the mapping string
                const cleanMapping = term.mapping.toLowerCase().trim();
                const targetTable = metadata.tables.find(t =>
                    cleanMapping.includes(t.table_name.toLowerCase())
                );

                if (targetTable) {
                    links.push({
                        source: nodeId,
                        target: targetTable.table_name,
                        label: 'MAPS_TO', // Relationship label
                        dashed: true,
                        color: 'rgba(0, 200, 83, 0.7)', // Stronger color
                        strength: 2 // Pull much stronger
                    });
                }
            }
        });

        return { nodes: Array.from(nodesMap.values()), links };
    }, [metadata, glossaryTerms]);

    const getNodeColor = (node) => {
        switch (node.group) {
            case 'table': return '#007BFF';
            case 'term': return '#00C853';
            default: return '#ccc';
        }
    };

    const handleNodeClick = (node) => {
        if (node.group === 'table') {
            setSelectedNode(node.fullData);
        } else if (node.group === 'term' && node.details) {
            // Find mapping table
            const tableName = node.details.split('.')[0];
            const tableData = metadata.tables.find(t => t.table_name === tableName);
            if (tableData) setSelectedNode(tableData);
        }

        // Center view on node
        fgRef.current.centerAt(node.x, node.y, 400);
    };

    if (!metadata || !metadata.tables) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                <p>Establishing Knowledge Graph...</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '600px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex'
            }}
        >
            {/* Graph Side (70%) */}
            <div style={{ flex: 1, position: 'relative' }}>
                <ForceGraph2D
                    ref={fgRef}
                    width={selectedNode ? dimensions.width * 0.65 : dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeColor={getNodeColor}
                    nodeLabel={node => `${node.label} (${node.details || ''})`}
                    linkColor={link => link.color}
                    linkWidth={1.5}
                    linkDash={link => link.dashed ? [4, 2] : null}
                    linkDirectionalParticles={2} // Add particles
                    linkDirectionalParticleSpeed={0.005} // Slow, elegant particles
                    backgroundColor="transparent"
                    nodeRelSize={1}
                    d3VelocityDecay={0.4}
                    onNodeClick={handleNodeClick}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.label;
                        const r = node.size || 10;
                        const x = node.x;
                        const y = node.y;

                        // Safety check: ensure coordinates are finite before drawing
                        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

                        const isSelected = selectedNode && node.fullData && selectedNode.table_name === node.fullData.table_name;
                        const isTable = node.group === 'table';

                        // Glow effect
                        if (isTable || isSelected) {
                            ctx.shadowColor = isSelected ? '#FFD700' : (isTable ? '#007BFF' : '#00C853');
                            ctx.shadowBlur = isSelected ? 30 : 20;
                        }

                        // Gradient Fill
                        const safeR = (Number.isFinite(r) && r > 0) ? r : 10;
                        try {
                            const gradient = ctx.createRadialGradient(x - safeR / 3, y - safeR / 3, 0, x, y, safeR);
                            if (isTable) {
                                gradient.addColorStop(0, '#8ecae6');
                                gradient.addColorStop(0.3, '#2196f3');
                                gradient.addColorStop(1, '#0d47a1');
                            } else {
                                gradient.addColorStop(0, '#b9f6ca');
                                gradient.addColorStop(0.3, '#00e676');
                                gradient.addColorStop(1, '#00c853');
                            }
                            ctx.fillStyle = gradient;
                        } catch (e) {
                            ctx.fillStyle = isTable ? '#007BFF' : '#00C853';
                        }

                        ctx.beginPath();
                        ctx.arc(x, y, safeR / 2, 0, 2 * Math.PI, false);
                        ctx.fill();

                        // Glossy Highlight
                        ctx.beginPath();
                        ctx.ellipse(x - safeR / 6, y - safeR / 6, safeR / 6, safeR / 10, Math.PI / 4, 0, 2 * Math.PI);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.fill();

                        ctx.shadowBlur = 0;
                        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(255,255,255,0.8)';
                        ctx.lineWidth = (isSelected ? 3 : 1) / globalScale;
                        ctx.stroke();

                        // Label Rendering
                        const fontSize = 14 / globalScale;
                        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                        const labelY = y + (safeR / 2) + (8 / globalScale);

                        // Background Box
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);
                        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
                        const bx = x - bckgDimensions[0] / 2;
                        const by = labelY - fontSize / 2 - (fontSize * 0.1);
                        const bw = bckgDimensions[0];
                        const bh = bckgDimensions[1];
                        const radius = 6 / globalScale;
                        ctx.beginPath();
                        ctx.roundRect(bx, by, bw, bh, radius);
                        ctx.fill();

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
                        ctx.fillText(label, x, labelY + (fontSize * 0.1));
                    }}
                    linkCanvasObject={(link, ctx, globalScale) => {
                        const start = link.source;
                        const end = link.target;

                        if (!start || !end || !Number.isFinite(start.x) || !Number.isFinite(start.y) || !Number.isFinite(end.x) || !Number.isFinite(end.y)) return;

                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.strokeStyle = link.color || '#999';
                        ctx.lineWidth = 1.5 / globalScale;
                        if (link.dashed) ctx.setLineDash([4, 2]);
                        else ctx.setLineDash([]);
                        ctx.stroke();

                        if (link.label) {
                            const midX = start.x + (end.x - start.x) * 0.5;
                            const midY = start.y + (end.y - start.y) * 0.5;
                            const fontSize = 10 / globalScale;
                            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                            const textWidth = ctx.measureText(link.label).width;

                            ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
                            ctx.strokeStyle = '#555';
                            ctx.lineWidth = 1 / globalScale;
                            ctx.beginPath();
                            ctx.roundRect(midX - textWidth / 2 - 2, midY - fontSize / 2 - 2, textWidth + 4, fontSize + 4, 3);
                            ctx.fill();
                            ctx.stroke();

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#ccc';
                            ctx.fillText(link.label, midX, midY);
                        }
                    }}
                    nodeCanvasObjectMode={() => 'replace'}
                    linkCanvasObjectMode={() => 'replace'}
                />

                <div style={{ position: 'absolute', bottom: '15px', left: '15px', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => fgRef.current?.zoomToFit(400, 50)}
                        className="control-btn"
                        style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid #444', color: '#fff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backdropFilter: 'blur(4px)' }}
                    >
                        Reset View
                    </button>
                    {selectedNode && (
                        <button
                            onClick={() => setSelectedNode(null)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: '#aaa', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                            Clear Selection
                        </button>
                    )}
                </div>
            </div>

            {/* Details Table Side (Right Side Panel Drawer) */}
            {selectedNode && (
                <div
                    className="fade-in-right"
                    style={{
                        width: '450px',
                        background: 'rgba(15, 15, 15, 0.9)',
                        borderLeft: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100vh',
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        zIndex: 2000,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '-15px 0 50px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ padding: '2rem 1.5rem 1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', background: 'rgba(0, 123, 255, 0.1)', borderRadius: '8px', color: '#007BFF' }}>
                                <Table size={20} />
                            </div>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{selectedNode.table_name}</h3>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="close-panel-btn"
                        >
                            &times;
                        </button>
                    </div>

                    <div style={{ padding: '2rem 1.5rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Rows</span>
                                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{selectedNode.fullData?.row_count?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Columns</span>
                                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{selectedNode.columns.length}</span>
                            </div>
                        </div>

                        <div className="side-panel-desc">
                            {selectedNode.description?.description || 'No description available for this table.'}
                        </div>

                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }}>COLUMN SCHEMA</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <style>{`
                                .kg-details-table th { text-align: left; color: #666; font-size: 11px; text-transform: uppercase; padding: 12px 8px; border-bottom: 2px solid rgba(255,255,255,0.05); letter-spacing: 0.12em; }
                                .kg-details-table td { padding: 18px 8px; border-bottom: 1px solid rgba(255,255,255,0.03); color: #ddd; font-size: 13px; }
                                .type-cell { color: #888; font-family: 'Fira Code', monospace; font-size: 11px; }
                                .kg-badge { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
                                .kg-badge-pk { background: rgba(0, 123, 255, 0.15); color: #4da3ff; border: 1px solid rgba(0, 123, 255, 0.3); }
                                .kg-badge-fk { background: rgba(255, 193, 7, 0.15); color: #ffca2c; border: 1px solid rgba(255, 193, 7, 0.3); }
                            `}</style>
                            <thead className="kg-details-table">
                                <tr>
                                    <th>Column</th>
                                    <th>Type</th>
                                    <th>Keys</th>
                                </tr>
                            </thead>
                            <tbody className="kg-details-table">
                                {selectedNode.columns.map(col => (
                                    <tr key={col.name}>
                                        <td style={{ fontWeight: '600', color: '#fff' }}>{col.name}</td>
                                        <td className="type-cell">{col.data_type}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {col.is_primary_key && <span className="kg-badge kg-badge-pk">PK</span>}
                                                {col.is_foreign_key && <span className="kg-badge kg-badge-fk">FK</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OntologyGraph;
