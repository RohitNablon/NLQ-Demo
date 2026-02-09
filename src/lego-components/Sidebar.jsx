import React from 'react';
import { cn } from '../lib/utils';
import { Database, LayoutGrid, MessageSquare, TrendingUp, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar({ onNavigate, currentView = 'databases', collapsed = false, onToggle }) {
    const navItems = [
        { id: 'executive', name: 'Executive Dashboard', icon: TrendingUp, badge: null },
        { id: 'databases', name: 'Data Explorer', icon: Database, badge: '3 connected' },
        { id: 'insights', name: 'Insights', icon: LayoutGrid, badge: 'New' },
        { id: 'admin', name: 'Onboard Console', icon: Settings },
    ];

    return (
        <div className={cn(
            'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#09090b] border-r border-white/10 transition-all duration-300 z-40',
            collapsed ? 'w-20' : 'w-64'
        )}>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute top-6 -right-3 bg-cyan-500/10 border border-cyan-500/20 rounded-full p-1.5 hover:bg-cyan-500/20 transition-colors z-50"
            >
                {collapsed ? <ChevronRight className="w-4 h-4 text-cyan-400" /> : <ChevronLeft className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <Icon className={cn('w-5 h-5', collapsed ? 'mx-auto' : '')} />
                            {!collapsed && (
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-sm">{item.name}</div>
                                    {item.badge && (
                                        <div className="text-xs text-cyan-400/70 mt-0.5">{item.badge}</div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer - User */}
            {!collapsed && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">R Patil</p>
                            <p className="text-gray-400 text-xs">Analyst</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
