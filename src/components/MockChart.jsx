import React from 'react';

const MockChart = ({ type = 'default' }) => {
    // 1. Trend Line Chart (Year Wise Volume)
    // 1. Trend Line Chart (Year Wise Volume)
    if (type === 'trend_line') {
        const data = [
            { year: '2012', value: 18.73 },
            { year: '2013', value: 18.55 },
            { year: '2014', value: 19.14 },
            { year: '2015', value: 19.60 },
            { year: '2016', value: 13.95 },
            { year: '2017', value: 3.67 }
        ];

        // SVG dimensions
        const width = 500;
        const height = 250;
        const padding = { top: 40, right: 30, bottom: 40, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Scaling
        const maxVal = 20;
        const minVal = 0;

        const getX = (index) => padding.left + (index * (chartWidth / (data.length - 1)));
        const getY = (val) => padding.top + chartHeight - ((val / maxVal) * chartHeight);

        // Generate Path
        const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

        return (
            <div style={{ width: '100%', height: 'auto', padding: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#e0e0e0' }}>Total Volume Sold (Millions of Liters)</h4>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '400px', maxWidth: '600px', height: 'auto' }}>
                        {/* Grid Lines (Background) */}
                        {[0, 5, 10, 15, 20].map((val, i) => (
                            <g key={i}>
                                <line
                                    x1={padding.left}
                                    y1={getY(val)}
                                    x2={width - padding.right}
                                    y2={getY(val)}
                                    stroke="#333"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding.left - 10}
                                    y={getY(val) + 4}
                                    fill="#888"
                                    fontSize="10"
                                    textAnchor="end"
                                >{val}M</text>
                            </g>
                        ))}

                        {/* Trend Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Area Gradient (Optional - makes it look premium) */}
                        <path
                            d={`M${getX(0)},${getY(data[0].value)} ${points.split(' ').map(p => `L${p}`).join(' ')} L${getX(data.length - 1)},${height - padding.bottom} L${getX(0)},${height - padding.bottom} Z`}
                            fill="url(#trendGradient)"
                            opacity="0.2"
                        />
                        <defs>
                            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Data Points & Labels */}
                        {data.map((d, i) => (
                            <g key={i}>
                                {/* Circle Point */}
                                <circle
                                    cx={getX(i)}
                                    cy={getY(d.value)}
                                    r="5"
                                    fill="#10b981"
                                    stroke="#1e293b"
                                    strokeWidth="2"
                                />
                                {/* Value Label */}
                                <text
                                    x={getX(i)}
                                    y={getY(d.value) - 12}
                                    fill="#fff"
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {d.value}
                                </text>
                                {/* Year Label at Bottom */}
                                <text
                                    x={getX(i)}
                                    y={height - padding.bottom + 20}
                                    fill="#aaa"
                                    fontSize="11"
                                    textAnchor="middle"
                                >
                                    {d.year}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        );
    }

    // 2. Horizontal Bar Chart (Bottom 5 Categories)
    if (type === 'bar_horizontal_bottom_5') {
        const data = [
            { label: 'Triple Sec', value: 26.01, display: '$26' },
            { label: 'Cocktails / RTD', value: 39.06, display: '$39' },
            { label: 'Neutral Grain Spirits', value: 165.06, display: '$165' },
            { label: 'Temp. & Specialty', value: 1221.00, display: '$1.2K' },
            { label: 'Single Barrel Bourbon', value: 1808.28, display: '$1.8K' }
        ];
        // Scale simplified for visibility
        const maxVal = 2000;

        return (
            <div style={{ width: '100%', padding: '10px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#e0e0e0' }}>Bottom 5 Categories (Sales $)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '140px', fontSize: '0.85rem', color: '#bbb', textAlign: 'right' }}>{d.label}</div>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.max((d.value / maxVal) * 100, 2)}%`,
                                    height: '100%',
                                    background: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '8px'
                                }} />
                            </div>
                            <div style={{ width: '40px', fontSize: '0.8rem', color: '#fff' }}>{d.display}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 3. Vertical Bar Chart (Top 5 Stores)
    if (type === 'bar_vertical_top_5') {
        const data = [
            { label: 'Hy-Vee #3', value: 47.1 },
            { label: 'Central City 2', value: 34.4 },
            { label: 'Hy-Vee Iowa City', value: 19.5 },
            { label: 'Sam\'s Club CR', value: 19.1 },
            { label: 'Sam\'s Club WH', value: 18.6 },
        ];
        const maxValue = 50;

        return (
            <div style={{ width: '100%', height: '250px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>Top 5 Stores (Millions $)</h4>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '30px', borderBottom: '1px solid var(--border)' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '100%',
                                    height: `${(item.value / maxValue) * 100}%`,
                                    background: '#10b981',
                                    borderRadius: '4px 4px 0 0',
                                    opacity: 0.9,
                                    position: 'relative',
                                    minHeight: '4px' // Ensure even small values are visible
                                }}
                            >
                                <span style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.75rem',
                                    color: '#fff',
                                    fontWeight: '500'
                                }}>${item.value}M</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.2' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default Fallback
    return null;
};

export default MockChart;
