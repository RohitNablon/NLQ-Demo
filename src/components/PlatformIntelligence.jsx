import React, { useState, useEffect } from 'react';
import { GlassPanel } from '../lego-components/GlassPanel';
import { MetricsTable } from '../lego-components/MetricsTable';
import { getPlatformIntelligence } from '../services/mockDataService';
import {
    Activity, Server, Database, Shield, Zap,
    AlertTriangle, CheckCircle, Clock, HardDrive, Network
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function PlatformIntelligence() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await getPlatformIntelligence();
            setData(result);
        } catch (error) {
            console.error('Failed to load platform intelligence:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="animate-pulse flex space-x-4 p-8"><div className="h-12 w-full bg-white/5 rounded"></div></div>;
    }

    return (
        <div className="space-y-8 p-6">
            {/* Section 1: Platform Health Metrics */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Real-Time Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Row 1 */}
                    <HealthCard
                        label="System Uptime"
                        value={data.platformHealth.uptime.value}
                        subValue={data.platformHealth.uptime.detail}
                        icon={Server}
                        status="success"
                    />
                    <HealthCard
                        label="Avg Response Time"
                        value={data.platformHealth.avgResponseTime.value}
                        subValue={data.platformHealth.avgResponseTime.detail}
                        icon={Zap}
                        status="success"
                    />
                    <HealthCard
                        label="Cache Hit Rate"
                        value={data.platformHealth.cacheHitRate.value}
                        subValue={data.platformHealth.cacheHitRate.detail}
                        icon={Database}
                        status="success"
                    />

                    {/* Row 2 */}
                    <HealthCard
                        label="Concurrent Users"
                        value={data.platformHealth.concurrentUsers.value}
                        subValue={`Capacity: ${data.platformHealth.concurrentUsers.capacity}`}
                        icon={Activity}
                        status="neutral"
                    />
                    <HealthCard
                        label="API Request Volume"
                        value={data.platformHealth.apiRequestVolume.value}
                        subValue={data.platformHealth.apiRequestVolume.detail}
                        icon={Network}
                        status="neutral"
                    />
                    <HealthCard
                        label="Error Rate"
                        value={data.platformHealth.errorRate.value}
                        subValue={data.platformHealth.errorRate.detail}
                        icon={AlertTriangle}
                        status="success"
                    />

                    {/* Row 3 */}
                    <HealthCard
                        label="DB Connections"
                        value={data.platformHealth.dbConnections.value}
                        subValue={data.platformHealth.dbConnections.detail}
                        icon={Database}
                        status="success"
                    />
                    <HealthCard
                        label="Model Inference"
                        value={data.platformHealth.modelInfo.value}
                        subValue={data.platformHealth.modelInfo.detail}
                        icon={Zap}
                        status="neutral"
                    />
                    <HealthCard
                        label="Storage Used"
                        value={data.platformHealth.storageUsed.value}
                        subValue={data.platformHealth.storageUsed.detail}
                        icon={HardDrive}
                        status="neutral"
                    />
                </div>
            </div>

            {/* Section 2: Database & Semantic Layer */}
            <GlassPanel>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    Connected Data Sources
                </h2>
                <MetricsTable
                    columns={[
                        { key: 'name', label: 'Database Name', sortable: true },
                        { key: 'type', label: 'Type', sortable: true },
                        {
                            key: 'status', label: 'Status', render: (val) => (
                                <span className={`px-2 py-1 rounded text-xs ${val === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                        val === 'config' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                                    }`}>{val.toUpperCase()}</span>
                            )
                        },
                        { key: 'queriesPerDay', label: 'Queries/Day', sortable: true },
                        { key: 'avgResponse', label: 'Avg Response', sortable: true },
                        {
                            key: 'coverage', label: 'Coverage', render: (val) => (
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500" style={{ width: `${val}%` }} />
                                    </div>
                                    <span>{val}%</span>
                                </div>
                            )
                        },
                        {
                            key: 'actions', label: 'Actions', render: () => (
                                <div className="flex gap-2">
                                    <button className="text-xs text-cyan-400 hover:text-cyan-300">View</button>
                                    <button className="text-xs text-gray-400 hover:text-white">Edit</button>
                                </div>
                            )
                        }
                    ]}
                    data={data.databases}
                />

                {/* Semantic Layer Health Visualization */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{data.semanticLayer.entitiesMapped.current}/{data.semanticLayer.entitiesMapped.total}</div>
                        <div className="text-xs text-gray-400">Entities Mapped ({data.semanticLayer.entitiesMapped.percentage}%)</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{data.semanticLayer.relationships}</div>
                        <div className="text-xs text-gray-400">Relationships</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{data.semanticLayer.businessRules}</div>
                        <div className="text-xs text-gray-400">Business Rules</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{data.semanticLayer.quality.autoDescriptions}%</div>
                        <div className="text-xs text-gray-400">Auto-Descriptions</div>
                    </div>
                </div>
            </GlassPanel>

            {/* Section 3: AI Model Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel>
                    <h2 className="text-lg font-bold text-white mb-4">Query Processing Funnel</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.queryProcessing.funnel} margin={{ left: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" fontSize={10} />
                                <YAxis dataKey="stage" type="category" stroke="#9ca3af" fontSize={10} width={120} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20' }}
                                />
                                <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassPanel>

                <GlassPanel>
                    <h2 className="text-lg font-bold text-white mb-4">Common Failure Patterns</h2>
                    <div className="space-y-4">
                        {data.queryProcessing.failurePatterns.map((pattern, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
                                    {pattern.percentage}%
                                </div>
                                <div>
                                    <div className="text-white text-sm font-medium">{pattern.type}</div>
                                    <div className="text-gray-400 text-xs">{pattern.example}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            </div>

            {/* Section 4: Governance & Audit */}
            <GlassPanel>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Recent Audit Events
                </h2>
                <MetricsTable
                    columns={[
                        { key: 'timestamp', label: 'Time', sortable: true },
                        { key: 'user', label: 'User', sortable: true },
                        { key: 'eventType', label: 'Event', sortable: true },
                        { key: 'details', label: 'Details' },
                        {
                            key: 'severity', label: 'Severity', render: (val) => (
                                <span className={`px-2 py-1 rounded text-xs ${val === 'Info' ? 'bg-blue-500/20 text-blue-400' :
                                        val === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                    }`}>{val}</span>
                            )
                        }
                    ]}
                    data={data.auditLog}
                />
            </GlassPanel>

            {/* Section 5: Optimization Recommendations */}
            <div className="grid grid-cols-1 gap-4">
                <h2 className="text-xl font-bold text-white">AI-Generated Optimizations</h2>
                {data.optimizations.slice(0, 3).map((opt, idx) => (
                    <GlassPanel key={idx} className="border-l-4 border-l-cyan-500">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${opt.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>{opt.priority} PRIORITY</span>
                                <h3 className="text-lg font-bold text-white mt-1">{opt.title}</h3>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-cyan-400 font-bold">ROI: {opt.roi}</div>
                                <div className="text-xs text-gray-400">Effort: {opt.effort}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="p-3 bg-red-500/5 rounded border border-red-500/10">
                                <div className="text-xs text-red-400 font-bold uppercase mb-1">Issue</div>
                                <div className="text-sm text-gray-300">{opt.issue}</div>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/10">
                                <div className="text-xs text-emerald-400 font-bold uppercase mb-1">Recommendation</div>
                                <div className="text-sm text-gray-300">{opt.recommendation}</div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded hover:bg-cyan-500/30">Approve</button>
                            <button className="px-3 py-1.5 bg-white/5 text-white text-sm font-medium rounded hover:bg-white/10">Schedule</button>
                            <button className="px-3 py-1.5 bg-transparent text-gray-500 text-sm hover:text-gray-400">Dismiss</button>
                        </div>
                    </GlassPanel>
                ))}
            </div>
        </div>
    );
}

function HealthCard({ label, value, subValue, icon: Icon, status }) {
    const statusColor = status === 'success' ? 'text-emerald-400' : status === 'warning' ? 'text-yellow-400' : 'text-gray-400';

    return (
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</div>
                <Icon className={`w-4 h-4 ${statusColor}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500">{subValue}</div>
        </div>
    );
}
