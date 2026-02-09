import React, { useState, useEffect } from 'react';
import { getExecutiveSummary } from '../services/mockDataService';
import { TrendingUp, TrendingDown, Users, Zap, DollarSign, Target, Award, Shield, Rocket, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Hero KPI Card Component with Gradient
function HeroKPICard({ data }) {
    const getGradientClass = (id) => {
        const gradients = {
            business_value: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
            decision_velocity: 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10',
            platform_adoption: 'bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10',
            ai_accuracy: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-teal-500/10'
        };
        return gradients[id] || 'bg-gradient-to-br from-gray-500/10 to-gray-600/5';
    };

    return (
        <div className={`${getGradientClass(data.id)} border border-white/20 rounded-2xl p-6 backdrop-blur-sm shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{data.icon}</div>
                {data.change && (
                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                        <TrendingUp size={12} />
                        {data.change}
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{data.title}</h3>

            {/* Main Value */}
            <div className="text-5xl font-bold text-white mb-1 tracking-tight">{data.mainValue}</div>
            <p className="text-sm text-gray-400 mb-4">{data.subtitle}</p>

            {/* Breakdown or Metrics */}
            {data.breakdown && (
                <div className="space-y-2">
                    {data.breakdown.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-300">{item.label}</span>
                                <span className="text-white font-bold">{item.value} ({item.percentage}%)</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${item.color === 'emerald' ? 'from-emerald-500 to-teal-400' :
                                        item.color === 'cyan' ? 'from-cyan-500 to-blue-400' :
                                            'from-violet-500 to-purple-400'
                                        } rounded-full`}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.metrics && (
                <div className="space-y-2 mt-4">
                    {data.metrics.map((metric, idx) => (
                        <div
                            key={idx}
                            className={`flex justify-between items-center p-2 rounded-lg ${metric.status === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                                metric.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                                    'bg-white/5 border border-white/10'
                                }`}
                        >
                            <span className="text-xs text-gray-300">{metric.label}</span>
                            <span className={`text-xs font-bold ${metric.status === 'success' ? 'text-emerald-400' :
                                metric.status === 'warning' ? 'text-amber-400' :
                                    'text-white'
                                }`}>{metric.value || `${metric.percentage}%`}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// AI Narrative Section
function AIGeneratedNarrative({ data }) {
    return (
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{data.title}</h3>
                    <p className="text-xs text-gray-400">{data.generated}</p>
                </div>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.summary.replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400 font-bold">$1</span>') }} />

            {/* Achievements */}
            <div className="mb-4">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                    🎯 KEY ACHIEVEMENTS
                </h4>
                <ul className="space-y-2">
                    {data.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-sm text-gray-300 pl-4 border-l-2 border-emerald-500/30" dangerouslySetInnerHTML={{ __html: achievement.replace(/\*\*(.*?)\*\*/g, '<span class="text-emerald-400 font-bold">$1</span>') }} />
                    ))}
                </ul>
            </div>

            {/* Attention Areas */}
            <div className="mb-4">
                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                    ⚠ ATTENTION AREAS
                </h4>
                <ul className="space-y-2">
                    {data.attentionAreas.map((area, idx) => (
                        <li key={idx} className="text-sm text-gray-300 pl-4 border-l-2 border-amber-500/30">{area}</li>
                    ))}
                </ul>
            </div>

            {/* Opportunities */}
            <div>
                <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    📈 STRATEGIC OPPORTUNITIES
                </h4>
                <ul className="space-y-2">
                    {data.opportunities.map((opp, idx) => (
                        <li key={idx} className="text-sm text-gray-300 pl-4 border-l-2 border-cyan-500/30" dangerouslySetInnerHTML={{ __html: opp.replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400 font-bold">$1</span>') }} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

// Expandable Strategic Insight Card
function StrategicInsightCard({ data, icon, colorScheme = 'cyan' }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const colors = {
        cyan: { bg: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', accent: 'bg-cyan-500/20' },
        emerald: { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: 'bg-emerald-500/20' },
        violet: { bg: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-500/30', text: 'text-violet-400', accent: 'bg-violet-500/20' }
    };

    const scheme = colors[colorScheme];

    return (
        <div className={`bg-gradient-to-br ${scheme.bg} border ${scheme.border} rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full p-4 flex items-center justify-between hover:${scheme.accent} transition-colors`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <h3 className={`text-sm font-bold ${scheme.text}`}>{data.title}</h3>
                </div>
                {isExpanded ? <ChevronDown size={16} className={scheme.text} /> : <ChevronRight size={16} className={scheme.text} />}
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top duration-300">
                    {data.benchmarks && (
                        <div className="space-y-2">
                            {data.benchmarks.map((b, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-300">{b.metric}</span>
                                    <div className="flex gap-2 text-xs">
                                        <span className="text-emerald-400 font-bold">{b.yours}</span>
                                        <span className="text-gray-500">vs</span>
                                        <span className="text-gray-400">{b.industryAvg}</span>
                                    </div>
                                </div>
                            ))}
                            <p className="text-xs text-gray-400 mt-2">Source: {data.sources}</p>
                            <p className="text-xs text-gray-300 italic mt-2" dangerouslySetInnerHTML={{ __html: data.insight?.replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400 font-bold">$1</span>') }} />
                        </div>
                    )}

                    {data.categories && data.categories.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-2">
                            <h4 className={`text-xs font-bold ${scheme.text} uppercase tracking-wider`}>{cat.name}</h4>
                            <div className="space-y-1">
                                {cat.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex justify-between text-xs bg-white/5 rounded p-2">
                                        <span className="text-gray-300">{item.label}</span>
                                        <span className={`font-medium ${item.status === 'success' ? 'text-emerald-400' :
                                            item.status === 'warning' ? 'text-amber-400' :
                                                'text-gray-400'
                                            }`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {data.currentState && (
                        <div className="space-y-3">
                            <div>
                                <h4 className={`text-xs font-bold ${scheme.text} mb-2`}>CURRENT STATE</h4>
                                <ul className="space-y-1">
                                    {data.currentState.map((item, idx) => (
                                        <li key={idx} className="text-xs text-gray-300 pl-3 border-l-2 border-cyan-500/30">{item}</li>
                                    ))}
                                </ul>
                            </div>
                            {data.nearTerm && (
                                <div>
                                    <h4 className={`text-xs font-bold ${scheme.text} mb-2`}>NEAR-TERM ({data.nearTerm.timeline})</h4>
                                    <ul className="space-y-1">
                                        {data.nearTerm.goals.map((item, idx) => (
                                            <li key={idx} className="text-xs text-gray-300 pl-3 border-l-2 border-emerald-500/30">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {data.investment && (
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-xs text-gray-300 mb-2"><span className="font-bold text-white">Total Investment:</span> {data.investment.total}</p>
                                    <p className="text-xs text-emerald-400 font-bold">Expected ROI: {data.investment.expectedROI}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ExecutiveDashboard({ onNavigate }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await getExecutiveSummary();
            setData(result);
        } catch (error) {
            console.error('Failed to load executive summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="animate-pulse p-8"><div className="h-12 w-full bg-white/5 rounded"></div></div>;
    }

    return (
        <div className="space-y-8 p-6 pb-20 bg-[#09090b] min-h-screen font-inter">
            {/* HERO SECTION with Gradient Background */}
            <div className="bg-gradient-to-br from-indigo-900/15 via-purple-900/10 to-pink-900/15 border border-purple-500/15 rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">
                            Envoy Agentic Analytics
                        </h1>
                        <p className="text-gray-400">Enterprise Intelligence Dashboard</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-sm text-cyan-400 font-mono">{data.lastUpdated}</p>
                    </div>
                </div>

                {/* PRIMARY KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.heroKPIs.map((kpi, idx) => (
                        <HeroKPICard key={idx} data={kpi} />
                    ))}
                </div>
            </div>

            {/* AI NARRATIVE */}
            <div className="bg-gradient-to-br from-indigo-500/5 via-purple-500/3 to-pink-500/5 border border-purple-500/10 rounded-2xl p-6 backdrop-blur-sm">
                <AIGeneratedNarrative data={data.aiNarrative} />
            </div>

            {/* IMPACT VISUALIZATIONS (3-Column Grid) */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50" />
                    Impact Visualizations
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Adoption Momentum */}
                    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">Adoption Momentum</h3>

                        {/* User Growth Chart */}
                        <div className="mb-6">
                            <h4 className="text-xs text-gray-400 mb-3">User Growth Trajectory</h4>
                            <ResponsiveContainer width="100%" height={150}>
                                <AreaChart data={data.impactVisualizations.adoptionMomentum.userGrowth}>
                                    <defs>
                                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#userGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Department Adoption */}
                        <div>
                            <h4 className="text-xs text-gray-400 mb-3">Department Penetration</h4>
                            <div className="space-y-2">
                                {data.impactVisualizations.adoptionMomentum.departmentAdoption.slice(0, 4).map((dept, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300">{dept.dept}</span>
                                            <span className={`font-bold ${dept.status === 'exceeding' ? 'text-emerald-400' :
                                                dept.status === 'on-target' ? 'text-cyan-400' :
                                                    'text-amber-400'
                                                }`}>{dept.adoption}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${dept.status === 'exceeding' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                                    dept.status === 'on-target' ? 'bg-gradient-to-r from-cyan-500 to-blue-400' :
                                                        'bg-gradient-to-r from-amber-500 to-orange-400'
                                                    } rounded-full`}
                                                style={{ width: `${dept.adoption}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Business Outcomes */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">Business Outcomes</h3>

                        {/* Value Waterfall */}
                        <div className="mb-6">
                            <h4 className="text-xs text-gray-400 mb-3">YTD Value Breakdown ($2.4M)</h4>
                            <div className="space-y-2">
                                {data.impactVisualizations.businessOutcomes.valueWaterfall.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-gray-300">{item.category}</span>
                                            <span className="text-xs text-emerald-400 font-bold">${(item.value / 1000).toFixed(0)}K</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500">{item.calculation}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-4">
                            <p className="text-xs text-gray-300 italic mb-2">"{data.impactVisualizations.businessOutcomes.testimonial.quote}"</p>
                            <p className="text-[10px] text-emerald-400 font-bold">— {data.impactVisualizations.businessOutcomes.testimonial.author}</p>
                            <p className="text-[10px] text-gray-500">{data.impactVisualizations.businessOutcomes.testimonial.title}</p>
                        </div>
                    </div>

                    {/* Column 3: Data Quality */}
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Data & AI Quality</h3>

                        {/* Accuracy Trend */}
                        <div className="mb-6">
                            <h4 className="text-xs text-gray-400 mb-3">AI Accuracy Trend</h4>
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={data.impactVisualizations.dataQuality.accuracyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <YAxis domain={[85, 95]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Knowledge Coverage */}
                        <div>
                            <h4 className="text-xs text-gray-400 mb-3">Semantic Layer Coverage</h4>
                            <div className="space-y-2">
                                {data.impactVisualizations.dataQuality.knowledgeCoverage.slice(0, 4).map((domain, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-white/5 rounded p-2">
                                        <span className="text-gray-300">{domain.domain}</span>
                                        <span className="text-cyan-400 font-bold">{domain.coverage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STRATEGIC INSIGHTS PANEL */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50" />
                    Strategic Insights
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <StrategicInsightCard
                        data={data.strategicInsights.competitive}
                        icon={data.strategicInsights.competitive.icon}
                        colorScheme="cyan"
                    />
                    <StrategicInsightCard
                        data={data.strategicInsights.governance}
                        icon={data.strategicInsights.governance.icon}
                        colorScheme="emerald"
                    />
                    <StrategicInsightCard
                        data={data.strategicInsights.scalability}
                        icon={data.strategicInsights.scalability.icon}
                        colorScheme="violet"
                    />
                </div>
            </div>
        </div>
    );
}
