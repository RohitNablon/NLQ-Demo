import React, { useState, useEffect } from 'react';
import {
    Activity,
    Database,
    Search,
    Clock,
    Users,
    TrendingUp,
    ArrowRight,
    BarChart2,
    PieChart,
    ShieldCheck
} from 'lucide-react';
import './ExecutiveDashboard.css';

const ExecutiveDashboard = ({ onNavigate }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const kpis = [
        {
            id: 1,
            label: "Total Connected Databases",
            value: "12",
            delta: "+3 new",
            trend: "positive",
            icon: Database
        },
        {
            id: 2,
            label: "Total Queries Executed",
            value: "8,540",
            delta: "+12% mo/mo",
            trend: "positive",
            icon: Search
        },
        {
            id: 3,
            label: "Avg. Response Time",
            value: "1.2s",
            delta: "-0.3s imp",
            trend: "positive",
            icon: Clock
        },
        {
            id: 4,
            label: "Active Data Users",
            value: "450",
            delta: "+8% user growth",
            trend: "positive",
            icon: Users
        }
    ];

    const utilizationData = [
        { name: "Sales Data Warehouse", value: 85, queries: "3.2k" },
        { name: "Inventory Management", value: 65, queries: "2.1k" },
        { name: "Customer 360", value: 45, queries: "1.5k" },
        { name: "Supply Chain Logistics", value: 30, queries: "900" },
        { name: "HR & People Ops", value: 15, queries: "450" }
    ];

    // Mock data for the bar chart
    const queryVolumeData = [45, 60, 55, 70, 85, 80, 95];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className={`executive-dashboard ${mounted ? 'fade-in' : ''}`}>

            {/* Header */}
            <header className="exec-header-section">
                <div className="title-group">
                    <h1>Enterprise Intelligence Hub</h1>
                    <p>Real-time overview of agentic analytics adoption and impact</p>
                </div>
                <div className="date-display" style={{ color: 'var(--text-muted)' }}>
                    Last updated: Just now
                </div>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {kpis.map(kpi => (
                    <div key={kpi.id} className="kpi-card">
                        <div className="kpi-top">
                            <div className="kpi-icon-wrapper">
                                <kpi.icon size={24} />
                            </div>
                            <div className={`kpi-trend ${kpi.trend}`}>
                                {kpi.trend === 'positive' ? <TrendingUp size={14} /> : <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />}
                                {kpi.delta}
                            </div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className="kpi-label">{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Analysis Area */}
            <div className="analysis-grid">
                {/* Chart 1: Query Volume Trend */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Activity size={20} className="text-accent" />
                            <span>Query Volume Trend (Last 7 Days)</span>
                        </div>
                        {/* <button className="btn btn-sm btn-secondary">View Report</button> */}
                    </div>
                    <div className="chart-body">
                        {queryVolumeData.map((val, idx) => (
                            <div key={idx} className="bar-column">
                                <div className="bar-tooltip">{val}%</div>
                                <div className="bar-visual" style={{ height: `${val}%` }}></div>
                                <span className="bar-label">{days[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart 2: Database Utilization */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Database size={20} className="text-accent" />
                            <span>Top Active Databases</span>
                        </div>
                    </div>
                    <div className="utilization-list">
                        {utilizationData.map((db, idx) => (
                            <div key={idx} className="util-item">
                                <div className="util-info">
                                    <div className="util-header">
                                        <span className="util-name">{db.name}</span>
                                        <span className="util-val">{db.queries} queries</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-bar" style={{ width: `${db.value}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation / Action Areas */}
            <div className="nav-grid">
                <div className="nav-tile" onClick={() => onNavigate('admin')}>
                    <div className="nav-tile-content">
                        <h2>Product Owner Portal</h2>
                        <p>Configure data sources, manage semantics, and monitor agent performance.</p>
                        <ul style={{ marginTop: '1rem', color: 'var(--text-muted)', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <ShieldCheck size={16} color="var(--success)" /> Enterprise Governance
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart2 size={16} color="var(--success)" /> Schema Management
                            </li>
                        </ul>
                    </div>
                    <div className="nav-icon-box">
                        <ArrowRight size={32} />
                    </div>
                </div>

                <div className="nav-tile" onClick={() => onNavigate('user')}>
                    <div className="nav-tile-content">
                        <h2>Business User Portal</h2>
                        <p>Explore insights, ask natural language questions, and view dashboards.</p>
                        <ul style={{ marginTop: '1rem', color: 'var(--text-muted)', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <PieChart size={16} color="var(--accent)" /> Self-Service Analytics
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} color="var(--accent)" /> AI Agent Chat
                            </li>
                        </ul>
                    </div>
                    <div className="nav-icon-box">
                        <ArrowRight size={32} />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ExecutiveDashboard;
