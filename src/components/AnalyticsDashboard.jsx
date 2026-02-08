
import React from 'react';
import {
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    TrendingUp,
    BarChart2,
    PieChart,
    MapPin,
    AlertCircle
} from 'lucide-react';
import qaData from '../QA.json';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ dbInfo, onQuestionSelect }) => {
    // Mock Data for Dashboard
    const keyMetrics = [
        { label: "Total Revenue", value: "$12.5M", delta: "+8%", trend: "up" },
        { label: "Total Orders", value: "45,230", delta: "+12%", trend: "up" },
        { label: "Avg. Order Value", value: "$276", delta: "-3%", trend: "down" },
        { label: "Active Customers", value: "2,340", delta: "+15%", trend: "up" }
    ];

    // Use questions from QA.json
    const curatedQuestions = qaData.slice(0, 8).map((q, idx) => ({
        category: ["Sales", "Inventory", "Operations", "Marketing", "Growth"][idx % 5],
        text: q.Question
    }));

    const dashboardContent = `
        Dashboard Summary Request:
        - Total Revenue: ${keyMetrics[0].value} (${keyMetrics[0].delta})
        - Total Orders: ${keyMetrics[1].value} (${keyMetrics[1].delta})
        - Avg Order Value: ${keyMetrics[2].value} (${keyMetrics[2].delta})
        - Active Customers: ${keyMetrics[3].value} (${keyMetrics[3].delta})
        - Regional Sales Distribution: 
          * North America: 35%
          * Europe: 28%
          * Asia Pacific: 22%
          * Latin America: 15%
        
        Please provide a concise executive summary and identify any key trends or concerns.
    `;

    return (
        <div className="analytics-dashboard fade-in">
            {/* Context Bar */}
            <div className="ad-context-bar">
                <div className="db-title-group">
                    <div className="ad-breadcrumbs">Home &gt; User Portal &gt; Analytics</div>
                    <h2>{dbInfo?.name || "Sales Data Warehouse"}</h2>
                </div>
                <div className="ad-controls">
                    <button className="date-picker-btn">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="btn btn-primary" onClick={() => onQuestionSelect(dashboardContent)}>
                        <TrendingUp size={16} /> Summarize Insights
                    </button>
                </div>
            </div>

            <div className="ad-main-layout">
                {/* Left Sidebar: Curated Questions */}
                <aside className="ad-sidebar-left">
                    <div className="sidebar-title">Top Questions</div>
                    <div className="question-list">
                        {curatedQuestions.map((q, idx) => (
                            <div key={idx} className="q-card" onClick={() => onQuestionSelect(q.text)}>
                                <span className="q-category">{q.category}</span>
                                <span className="q-text">{q.text}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Center Panel: Visual Insights */}
                <main className="ad-center-panel">
                    {/* KPI Row */}
                    <div className="insights-grid">
                        {keyMetrics.map((kpi, idx) => (
                            <div key={idx} className="i-card kpi-mini">
                                <div className="c-label">{kpi.label}</div>
                                <div className="kpi-value-row" style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.value}</span>
                                    <span style={{
                                        color: kpi.trend === 'up' ? 'var(--success)' : 'var(--error)',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {kpi.delta}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Big Chart: Revenue Trend */}
                        <div className="i-card insight-card-lg">
                            <div className="i-card-header">
                                <h3>Revenue Trend (Last 30 Days)</h3>
                                <TrendingUp size={18} className="text-accent" />
                            </div>
                            <div className="i-chart-area">
                                {/* Simple CSS Bar Chart Mockup */}
                                {[40, 55, 45, 60, 75, 65, 80, 70, 85, 90, 60, 50].map((h, i) => (
                                    <div key={i} style={{
                                        height: `${h}%`,
                                        width: '6%',
                                        background: 'linear-gradient(to top, var(--accent), transparent)',
                                        borderRadius: '4px',
                                        opacity: 0.7
                                    }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Chart: Product Mix */}
                        <div className="i-card">
                            <div className="i-card-header">
                                <h3>Top Products</h3>
                                <PieChart size={18} className="text-secondary" />
                            </div>
                            <div className="i-chart-area" style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
                                {[
                                    { label: "Product A", val: 80 },
                                    { label: "Product B", val: 65 },
                                    { label: "Product C", val: 45 }
                                ].map((p, i) => (
                                    <div key={i} style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                            <span>{p.label}</span>
                                            <span>{p.val}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                            <div style={{ height: '100%', width: `${p.val}%`, background: 'var(--purple)', borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chart: Regional Map Placeholder */}
                        <div className="i-card">
                            <div className="i-card-header">
                                <h3>Regional Sales</h3>
                                <MapPin size={18} className="text-secondary" />
                            </div>
                            <div className="i-chart-area" style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', padding: '0 10px' }}>
                                {[
                                    { label: "North America", val: 35, color: "#3b82f6" }, // Blue
                                    { label: "Europe", val: 28, color: "#10b981" },        // Green
                                    { label: "Asia Pacific", val: 22, color: "#8b5cf6" },  // Purple
                                    { label: "Latin America", val: 15, color: "#f59e0b" }  // Amber
                                ].map((r, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', color: '#bbb' }}>
                                            <span style={{ fontWeight: 500 }}>{r.label}</span>
                                            <span style={{ fontWeight: 600, color: '#fff' }}>{r.val}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${r.val}%`,
                                                    background: r.color,
                                                    borderRadius: '3px',
                                                    boxShadow: `0 0 8px ${r.color}40` // Subtle glow
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar: AI Context */}
                <aside className="ad-sidebar-right">
                    <div className="context-section">
                        <div className="sidebar-title">AI Narrative</div>
                        <div className="ai-narrative">
                            <div className="ai-badge">Generated by GPT-5.2</div>
                            <p style={{ marginBottom: '1rem' }}>
                                Overall performance is strong this month with revenue up <strong>8%</strong>.
                            </p>
                            <p>
                                However, <strong>average order value</strong> has declined slightly, suggesting customers are purchasing more frequently but with smaller basket sizes.
                            </p>
                        </div>
                    </div>

                    <div className="context-section">
                        <div className="sidebar-title">Anomalies Detected</div>
                        <div className="i-card" style={{ padding: '1rem', border: '1px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--warning)' }}>Inventory Alert</span>
                                    <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                                        Northeast region stocks are 30% below safety levels for Product A.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
