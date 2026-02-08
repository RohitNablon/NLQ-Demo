import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const SchemaVisualizer = ({ metadata }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const fgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Tuning for ER Diagram - more static, spread out
        const timer = setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.d3Force('charge').strength(-800); // Strong repulsion
                fgRef.current.d3Force('link').distance(200).strength(0.8); // Specific distance
                fgRef.current.d3Force('center').strength(0.5);
                // Warmup to stabilize
                fgRef.current.d3ReheatSimulation();
            }
        }, 100);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timer);
        };
    }, []);

    const graphData = useMemo(() => {
        if (!metadata || !metadata.tables) return { nodes: [], links: [] };

        const nodes = metadata.tables.map(table => ({
            id: table.table_name,
            group: 'table',
            label: table.table_name,
            width: 180,
            fullData: table
        }));

        const links = [];
        const factTables = metadata.tables.filter(t => t.table_name.toLowerCase().startsWith('fact'));
        const dimTables = metadata.tables.filter(t => t.table_name.toLowerCase().startsWith('dim'));

        factTables.forEach(fact => {
            dimTables.forEach(dim => {
                const dimPk = dim.columns?.find(c => c.is_primary_key);
                if (dimPk) {
                    const matchCol = fact.columns?.find(c => c.name === dimPk.name);
                    if (matchCol) {
                        links.push({
                            source: fact.table_name,
                            target: dim.table_name,
                            label: 'FK',
                            color: '#555', // Darker, cleaner lines
                            width: 1.5
                        });
                    }
                }
            });
        });

        return { nodes, links };
    }, [metadata]);

    const renderNode = (node, ctx, globalScale) => {
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

        const w = node.width;
        const headerHeight = 28;
        const rowHeight = 14;
        const columns = node.fullData.columns || [];
        const contentHeight = (columns.length * rowHeight) + 8; // padding
        const h = headerHeight + contentHeight;

        const x = node.x - w / 2;
        const y = node.y - h / 2;
        const r = 4;

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Background (Body)
        ctx.fillStyle = '#1e1e1e'; // Dark grey
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();

        // Reset shadow for text
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Header Background
        const isFact = node.fullData.table_name.toLowerCase().startsWith('fact');
        ctx.fillStyle = isFact ? '#0056b3' : '#6f42c1'; // Blue for Fact, Purple for Dim

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + headerHeight);
        ctx.lineTo(x, y + headerHeight);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();

        // Header Text
        ctx.font = `bold 12px Inter, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, x + w / 2, y + headerHeight / 2);

        // Columns
        ctx.textAlign = 'left';
        ctx.font = `10px Consolas, monospace`;

        let rowY = y + headerHeight + 10;
        columns.forEach(col => {
            // Icon / Key indicator
            const keyInd = col.is_primary_key ? '🔑' : (col.is_foreign_key ? '🔗' : '  ');

            // Name
            ctx.fillStyle = col.is_primary_key ? '#ffca2c' : '#e0e0e0';
            ctx.fillText(`${keyInd} ${col.name}`, x + 8, rowY);

            // Type (Right aligned)
            ctx.fillStyle = '#888';
            const typeWidth = ctx.measureText(col.data_type).width;
            ctx.fillText(col.data_type, x + w - typeWidth - 8, rowY);

            rowY += rowHeight;
        });

        // Border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
    };

    if (!metadata || !metadata.tables) return <div>Loading Schema...</div>;

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '600px',
                background: '#121212', // Dark background for contrast
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #333'
            }}
        >
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeCanvasObject={renderNode}
                linkColor={link => link.color}
                linkWidth={1.5}
                d3VelocityDecay={0.2}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current.zoomToFit(400, 50)}
            />
            <div style={{ position: 'absolute', bottom: 10, right: 10, color: '#666', fontSize: '10px' }}>
                Schema Visualization
            </div>
        </div>
    );
};

export default SchemaVisualizer;
