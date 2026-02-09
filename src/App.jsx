import React, { useState, useEffect } from 'react';
import { Sidebar } from './lego-components/Sidebar';
import TopBrandingBar from './lego-components/TopBrandingBar';
import AdminView from './components/AdminView';
import LoaderScreen from './components/LoaderScreen';
import EndUserLanding from './components/EndUserLanding';
import ExecutiveDashboardContainer from './components/ExecutiveDashboardContainer';
import InsightsContainer from './components/InsightsContainer';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  const handleNavigate = (view) => {
    // Special handling for Insights - show database selection first
    if (view === 'insights' && !dbInfo) {
      setCurrentView('insights-select-db');
    } else {
      setCurrentView(view);
    }
  };

  const connectionSteps = [
    { id: 1, text: 'Fetching DB Credentials...' },
    { id: 2, text: 'Connecting to DB...' },
    { id: 3, text: 'Fetching Semantic details from Knowledge DB...' },
    { id: 4, text: 'Synthesizing Insights...' },
  ];

  const handleDatabaseSelect = (database) => {
    console.log('✅ Database selected:', database);
    setDbInfo(database);

    // Show loader before going to insights
    setShowLoader(true);
    setCurrentView('loading');
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setCurrentView('insights');
  };

  const handleDisconnect = () => {
    setDbInfo(null);
    setCurrentView('insights-select-db');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'executive':
        return <ExecutiveDashboardContainer onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminView onConnect={handleDatabaseSelect} />;
      case 'insights':
        // Show tabbed insights container only after database is selected
        return dbInfo ? (
          <InsightsContainer dbInfo={dbInfo} onNavigate={handleNavigate} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Please select a database first</p>
          </div>
        );

      case 'loading':
        return (
          <LoaderScreen
            customSteps={connectionSteps}
            duration={6000}
            onComplete={handleLoaderComplete}
          />
        );

      case 'insights-select-db':
        return (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Select Database</h2>
              <p className="text-gray-400 text-sm mt-1">Choose a database to start analyzing insights</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EndUserLanding onSelect={handleDatabaseSelect} />
            </div>
          </div>
        );

      default:
        return <EndUserLanding onSelect={handleDatabaseSelect} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden flex-col">
      {/* Top Branding Bar - Always visible */}
      <TopBrandingBar />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar
          onNavigate={handleNavigate}
          currentView={currentView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} min-w-0`}>
          {/* Content Area */}
          <main className={`flex-1 flex flex-col ${currentView === 'insights' ? 'overflow-hidden' : 'overflow-y-auto'} w-full`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
