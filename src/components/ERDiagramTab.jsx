import React, { useEffect, useRef, useState } from 'react';
import './ERDiagramTab.css';

const entities = [
    {
        id: 'dim_product',
        name: 'Dim_Product',
        attributes: [
            { name: 'item_number', type: 'INT', key: 'PK' },
            { name: 'item_description', type: 'TEXT' },
            { name: 'category', type: 'INT' },
            { name: 'category_name', type: 'TEXT' },
            { name: 'pack', type: 'INT' },
            { name: 'bottle_volume_ml', type: 'INT' },
        ],
    },
    {
        id: 'dim_store',
        name: 'Dim_Store',
        attributes: [
            { name: 'store_number', type: 'INT', key: 'PK' },
            { name: 'store_name', type: 'TEXT' },
            { name: 'address', type: 'TEXT' },
            { name: 'city', type: 'TEXT' },
            { name: 'zip_code', type: 'INT' },
            { name: 'store_location', type: 'TEXT' },
            { name: 'county_number', type: 'INT' },
            { name: 'county', type: 'TEXT' },
        ],
    },
    {
        id: 'dim_vendor',
        name: 'Dim_Vendor',
        attributes: [
            { name: 'vendor_number', type: 'INT', key: 'PK' },
            { name: 'vendor_name', type: 'TEXT' },
        ],
    },
    {
        id: 'fact_sales',
        name: 'Fact_Sales',
        attributes: [
            { name: 'invoice_number', type: 'TEXT', key: 'PK' },
            { name: 'store_number', type: 'INT', key: 'FK' },
            { name: 'item_number', type: 'INT', key: 'FK' },
            { name: 'vendor_number', type: 'INT', key: 'FK' },
            { name: 'Date', type: 'TEXT' },
            { name: 'state_bottle_cost', type: 'TEXT' },
            { name: 'state_bottle_retail', type: 'TEXT' },
            { name: 'bottles_sold', type: 'INT' },
            { name: 'sale_amount', type: 'TEXT' },
            { name: 'volume_sold_liters', type: 'FLOAT' },
            { name: 'volume_sold_gallons', type: 'FLOAT' },
        ],
    },
];

const relationships = [
    { from: 'fact_sales', fromAttr: 'item_number', to: 'dim_product', toAttr: 'item_number' },
    { from: 'fact_sales', fromAttr: 'store_number', to: 'dim_store', toAttr: 'store_number' },
    { from: 'fact_sales', fromAttr: 'vendor_number', to: 'dim_vendor', toAttr: 'vendor_number' },
];

const ERDiagramTab = () => {
    const containerRef = useRef(null);
    const [lines, setLines] = useState([]);

    const calculateLines = () => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;

        const newLines = relationships.map(rel => {
            const fromEl = document.getElementById(`${rel.from}-${rel.fromAttr}`);
            const toEl = document.getElementById(`${rel.to}-${rel.toAttr}`);
            const fromCard = document.getElementById(`entity-${rel.from}`);
            const toCard = document.getElementById(`entity-${rel.to}`);

            if (fromEl && toEl && fromCard && toCard) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                const fromCardRect = fromCard.getBoundingClientRect();
                const toCardRect = toCard.getBoundingClientRect();

                // Determine relative positions
                const isRightOf = fromCardRect.left > toCardRect.left;
                const isLeftOf = fromCardRect.left < toCardRect.left;
                // Treat as vertical stack if they share horizontal overlap or are in same column
                const isVerticalStack = Math.abs(fromCardRect.left - toCardRect.left) < 50;

                let x1, y1, x2, y2;
                let path = '';

                // Calculate Anchor Points

                // Vertical Stack (e.g. Fact -> Vendor)
                // Connect Right Edge to Right Edge with a "C" bracket
                if (isVerticalStack) {
                    x1 = fromRect.right - containerRect.left + scrollLeft;
                    y1 = fromRect.top + (fromRect.height / 2) - containerRect.top + scrollTop;

                    x2 = toRect.right - containerRect.left + scrollLeft;
                    y2 = toRect.top + (toRect.height / 2) - containerRect.top + scrollTop;

                    // Offset for the bracket
                    const bracketOffset = 40;
                    const midX = Math.max(x1, x2) + bracketOffset;

                    path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                }
                // Horizontal (Side by Side)
                else {
                    if (isRightOf) {
                        // From (Right) -> To (Left)
                        // Start Left edge -> End Right edge
                        x1 = fromRect.left - containerRect.left + scrollLeft;
                        y1 = fromRect.top + (fromRect.height / 2) - containerRect.top + scrollTop;

                        x2 = toRect.right - containerRect.left + scrollLeft;
                        y2 = toRect.top + (toRect.height / 2) - containerRect.top + scrollTop;
                    } else {
                        // From (Left) -> To (Right)
                        // Start Right edge -> End Left edge
                        x1 = fromRect.right - containerRect.left + scrollLeft;
                        y1 = fromRect.top + (fromRect.height / 2) - containerRect.top + scrollTop;

                        x2 = toRect.left - containerRect.left + scrollLeft;
                        y2 = toRect.top + (toRect.height / 2) - containerRect.top + scrollTop;
                    }

                    // "Z" Step
                    const midX = (x1 + x2) / 2;
                    path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                }

                return { path, id: `${rel.from}-${rel.to}` };
            }
            return null;
        }).filter(Boolean);

        setLines(newLines);
    };

    useEffect(() => {
        calculateLines();

        const resizeObserver = new ResizeObserver(calculateLines);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        window.addEventListener('resize', calculateLines);

        const timer = setTimeout(calculateLines, 100);
        const timer2 = setTimeout(calculateLines, 500);

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
            window.removeEventListener('resize', calculateLines);
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="er-diagram-tab">
            <div className="er-header">
                <h2 className="er-title">Entity Relationship Diagram</h2>
                <div className="er-controls">
                    <button className="er-control-btn" title="Zoom In">+</button>
                    <button className="er-control-btn" title="Zoom Out">−</button>
                    <button className="er-control-btn" title="Reset View" onClick={calculateLines}>⟲</button>
                    <button className="er-control-btn" title="Fullscreen">⛶</button>
                </div>
            </div>

            <div className="er-canvas" ref={containerRef} onScroll={calculateLines}>
                <svg className="er-svg-layer">
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
                        </marker>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {lines.map(line => (
                        <g key={line.id}>
                            <path
                                d={line.path}
                                className="er-line"
                                markerEnd="url(#arrowhead)"
                            />
                        </g>
                    ))}
                </svg>

                <div className="er-diagram-content">
                    <div className="er-entities-grid">
                        <div className="er-column">
                            <EntityCard entity={entities[0]} />
                        </div>
                        <div className="er-column">
                            <EntityCard entity={entities[3]} />
                            <EntityCard entity={entities[2]} />
                        </div>
                        <div className="er-column">
                            <EntityCard entity={entities[1]} />
                        </div>
                    </div>
                </div>

                <div className="er-legend">
                    <div className="legend-item">
                        <span className="legend-color pk"></span>
                        <span>Primary Key</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color fk"></span>
                        <span>Foreign Key</span>
                    </div>
                    <div className="legend-item">
                        <span className="relationship-line-sample"></span>
                        <span>Relationship</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EntityCard = ({ entity }) => (
    <div id={`entity-${entity.id}`} className="entity-card">
        <div className="entity-header">{entity.name}</div>
        <div className="entity-attributes">
            {entity.attributes.map((attr) => (
                <div key={attr.name} id={`${entity.id}-${attr.name}`} className="entity-attribute">
                    {attr.key && (
                        <span className={`attr-key ${attr.key.toLowerCase()}`}>
                            {attr.key}
                        </span>
                    )}
                    <span className="attr-name">{attr.name}</span>
                    <span className="attr-type">{attr.type}</span>
                </div>
            ))}
        </div>
    </div>
);

export default ERDiagramTab;
