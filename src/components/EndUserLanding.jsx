import React, { useState, useEffect } from 'react';
import { GlassPanel } from '../lego-components/GlassPanel';
import { Button } from '../lego-components/Button';
import { Badge } from '../lego-components/Badge';
import { getDatabases } from '../services/mockDataService';
import { Database, Search, ChevronRight, TrendingUp, Users, Package } from 'lucide-react';

function EndUserLanding({ onSelect }) {
    const [databases, setDatabases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('all');

    useEffect(() => {
        loadDatabases();
    }, []);

    const loadDatabases = async () => {
        try {
            const data = await getDatabases();
            setDatabases(data);
        } catch (error) {
            console.error('Failed to load databases:', error);
        } finally {
            setLoading(false);
        }
    };

    const domains = ['all', 'sales', 'operations', 'hr'];

    const filteredDatabases = databases.filter(db => {
        const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            db.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDomain = selectedDomain === 'all' || db.domain === selectedDomain;
        return matchesSearch && matchesDomain;
    });

    const getStatusColor = (status) => {
        return status === 'live' ? 'green' : status === 'syncing' ? 'yellow' : 'red';
    };

    const getDomainIcon = (domain) => {
        switch (domain) {
            case 'sales': return TrendingUp;
            case 'operations': return Package;
            case 'hr': return Users;
            default: return Database;
        }
    };

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Connected Data Sources</h1>
                <p className="text-gray-400">Select a database to start your analytics journey</p>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-4 mb-8">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search databases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                    />
                </div>

                {/* Domain Filter */}
                <div className="flex gap-2">
                    {domains.map(domain => (
                        <button
                            key={domain}
                            onClick={() => setSelectedDomain(domain)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedDomain === domain
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {domain.charAt(0).toUpperCase() + domain.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Database Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent"></div>
                </div>
            ) : filteredDatabases.length === 0 ? (
                <GlassPanel className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No databases found matching your criteria</p>
                </GlassPanel>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDatabases.map(db => {
                        const DomainIcon = getDomainIcon(db.domain);

                        return (
                            <GlassPanel
                                key={db.id}
                                className="group cursor-pointer hover:border-cyan-500/30 transition-all duration-300"
                                onClick={() => {
                                    console.log('🖱️ Database card clicked:', db);
                                    onSelect(db);
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                            <DomainIcon className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors">
                                                {db.name}
                                            </h3>
                                            <Badge variant={getStatusColor(db.status)} size="sm">
                                                {db.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                </div>

                                {/* Description */}
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {db.description}
                                </p>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-white/10">
                                    <div>
                                        <p className="text-xs text-gray-500">Tables</p>
                                        <p className="text-white font-semibold">{db.metrics.tables}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Records</p>
                                        <p className="text-white font-semibold">{db.metrics.records}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Queries</p>
                                        <p className="text-white font-semibold">{db.metrics.queriesThisMonth}</p>
                                    </div>
                                </div>

                                {/* Footer Tags - Using domains instead of tags */}
                                <div className="flex flex-wrap gap-2">
                                    {(db.domains || []).slice(0, 3).map(domain => (
                                        <span
                                            key={domain}
                                            className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-400"
                                        >
                                            {domain}
                                        </span>
                                    ))}
                                    {(db.domains?.length || 0) > 3 && (
                                        <span className="px-2 py-1 text-xs text-gray-500">
                                            +{db.domains.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </GlassPanel>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default EndUserLanding;
