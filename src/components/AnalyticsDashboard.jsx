import React, { useState, useEffect } from 'react';
import { KPICard } from '../lego-components/KPICard';
import { GlassPanel } from '../lego-components/GlassPanel';
import { Button } from '../lego-components/Button';
import { Badge } from '../lego-components/Badge';
import { getInsights, getCuratedQuestions, getDatabases } from '../services/mockDataService';
import { TrendingUp, DollarSign, Package, Users, BarChart3, Sparkles, Database, Clock, RefreshCw, Download, AlertTriangle, ChevronRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

function AnalyticsDashboard({ dbInfo, onQuestionSelect, onNavigate }) {
    const [insights, setInsights] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (dbInfo?.id) {
            loadDashboard();
        } else {
            setLoading(false);
        }
    }, [dbInfo]);

    const loadDashboard = async () => {
        try {
            const [insightsData, questionsData] = await Promise.all([
                getInsights(dbInfo?.id),
                getCuratedQuestions(dbInfo?.id)
            ]);
            setInsights(insightsData);
            setQuestions(questionsData || []);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#09090b]">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!dbInfo) {
        return (
            <div className="flex items-center justify-center h-screen p-8 bg-[#09090b]">
                <GlassPanel className="text-center max-w-2xl">
                    <Database className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-white mb-3">Select a Database First</h2>
                    <p className="text-gray-400 mb-6">
                        Please select a data source to view insights and analytics
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => onNavigate('databases')}
                    >
                        Go to Data Explorer
                    </Button>
                </GlassPanel>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="min-h-screen p-8 bg-[#09090b]">
                <GlassPanel className="text-center py-12">
                    <p className="text-gray-400">No insights available for {dbInfo.name}</p>
                </GlassPanel>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-[#09090b]">
            {/* Context Bar */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <span onClick={() => onNavigate('executive')} className="cursor-pointer hover:text-cyan-400">Home</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{dbInfo.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="secondary" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">{dbInfo.name}</h1>
                <p className="text-gray-400">{dbInfo.description}</p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {insights.keyMetrics?.map((metric, index) => {
                    const icons = [TrendingUp, DollarSign, Package, Users];
                    const colors = ['cyan', 'green', 'purple', 'yellow'];
                    const Icon = icons[index % icons.length];

                    return (
                        <KPICard
                            key={index}
                            title={metric.label}
                            value={metric.value}
                            change={metric.change}
                            trend={metric.change >= 0 ? 'up' : 'down'}
                            icon={Icon}
                            color={colors[index % colors.length]}
                        />
                    );
                })}
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN (25%) - Curated Questions */}
                <div className="lg:col-span-3 space-y-4">
                    <GlassPanel>
                        <h3 className="text-lg font-semibold text-white mb-4">📝 Top Questions</h3>
                        <div className="space-y-3">
                            {questions.slice(0, 10).map((q, idx) => (
                                <div
                                    key={q.id}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all group"
                                    onClick={() => onQuestionSelect(q.question)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant={q.category === 'Sales' ? 'cyan' : 'purple'} size="xs">
                                            {q.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{q.complexity}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors leading-snug">
                                        {q.question}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>

                {/* CENTER COLUMN (50%) - Visualizations */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Card 1: AI Narrative with Key Findings */}
                    {insights.narratives?.executive && (
                        <GlassPanel>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-lg font-semibold text-white">AI-Generated Summary</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-4">{insights.narratives.executive}</p>
                            {insights.narratives.keyFindings && (
                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    {insights.narratives.keyFindings.map((finding, idx) => {
                                        const icon = finding.startsWith('✓') ? '✓' : finding.startsWith('⚠') ? '⚠' : '📈';
                                        const color = icon === '✓' ? 'text-green-400' : icon === '⚠' ? 'text-yellow-400' : 'text-cyan-400';
                                        return (
                                            <p key={idx} className={`text-sm flex items-start gap-2 ${color}`}>
                                                <span className="mt-0.5">{icon}</span>
                                                <span className="text-gray-300">{finding.replace(/^[✓⚠📈]\s*/, '')}</span>
                                            </p>
                                        );
                                    })}
                                </div>
                            )}
                        </GlassPanel>
                    )}

                    {/* Card 2: Revenue Trend */}
                    {insights.revenueTrend && (
                        <GlassPanel>
                            <h3 className="text-lg font-semibold text-white mb-4">{insights.revenueTrend.title}</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={insights.revenueTrend.data}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </GlassPanel>
                    )}

                    {/* Card 3: Top Products */}
                    {insights.topProducts && (
                        <GlassPanel>
                            <h3 className="text-lg font-semibold text-white mb-4">Top 10 Products by Revenue</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={insights.topProducts.data} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="revenue" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </GlassPanel>
                    )}

                    {/* Card 4: Regional Sales */}
                    {insights.regionalSales && (
                        <GlassPanel>
                            <h3 className="text-lg font-semibold text-white mb-4">Sales by Region</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={insights.regionalSales.data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                    >
                                        {insights.regionalSales.data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </GlassPanel>
                    )}

                    {/* Card 5: Customer Segments */}
                    {insights.customerSegments && (
                        <GlassPanel>
                            <h3 className="text-lg font-semibold text-white mb-4">Revenue by Customer Segment</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={insights.customerSegments.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="segment" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </GlassPanel>
                    )}

                    {/* Card 6: Anomaly Highlights */}
                    {insights.anomalies?.alerts && insights.anomalies.alerts.length > 0 && (
                        <GlassPanel className="bg-yellow-500/5 border-yellow-500/20">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">Anomaly Alerts</h3>
                            </div>
                            <div className="space-y-4">
                                {insights.anomalies.alerts.slice(0, 3).map((alert, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <p className="text-gray-200 font-medium mb-1">{alert.message}</p>
                                        <p className="text-sm text-yellow-400 mb-2">Impact: {alert.impact}</p>
                                        <p className="text-xs text-gray-400">{alert.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                    )}
                </div>

                {/* RIGHT COLUMN (25%) - Context Information */}
                <div className="lg:col-span-3 space-y-4">
                    {/* About This Database */}
                    <GlassPanel>
                        <h3 className="text-lg font-semibold text-white mb-4">About This Database</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Data Sources</p>
                                <p className="text-gray-300">{dbInfo.schema || 'SAP ERP, POS System'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Update Frequency</p>
                                <p className="text-gray-300">Real-time</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Last Updated</p>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Clock className="w-4 h-4" />
                                    <span>{dbInfo.lastUpdated || '2 hours ago'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Data Quality</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: '98%' }}></div>
                                    </div>
                                    <span className="text-green-400 font-medium">98%</span>
                                </div>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Quick Stats */}
                    <GlassPanel>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Queries Today</span>
                                <span className="text-white font-semibold">47</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Active Users</span>
                                <span className="text-white font-semibold">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Most Popular</span>
                                <span className="text-cyan-400 font-medium text-xs">Revenue trends</span>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Related Dashboards */}
                    <GlassPanel>
                        <h3 className="text-lg font-semibold text-white mb-4">Related Dashboards</h3>
                        <div className="space-y-2">
                            <div className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all text-sm text-gray-300 hover:text-cyan-400">
                                → Inventory Management
                            </div>
                            <div className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all text-sm text-gray-300 hover:text-cyan-400">
                                → Customer Analytics
                            </div>
                            <div className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all text-sm text-gray-300 hover:text-cyan-400">
                                → Employee Database
                            </div>
                        </div>
                    </GlassPanel>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-8 flex justify-center">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onQuestionSelect('')}
                >
                    Start Custom Analysis in Chat
                </Button>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
