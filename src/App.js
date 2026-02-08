import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AdminView from './components/AdminView';
import LoaderScreen from './components/LoaderScreen';
import ChatInterface from './components/ChatInterface';
import EndUserLanding from './components/EndUserLanding';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './index.css';

function App() {
  const [activePersona, setActivePersona] = useState(null); // 'admin' | 'user' | null (dashboard)
  const [appState, setAppState] = useState('dashboard'); // 'dashboard' | 'admin-setup' | 'user-selection' | 'loading' | 'analytics' | 'chat'
  const [dbInfo, setDbInfo] = useState(null);
  const [initialQuestion, setInitialQuestion] = useState('');
  const [showPersonaSwitcher, setShowPersonaSwitcher] = useState(false);

  const handleNavigate = (destination) => {
    setActivePersona(destination);
    if (destination === 'admin') {
      setAppState('admin-setup');
    } else {
      setAppState('user-selection');
    }
    setShowPersonaSwitcher(true);
  };

  const handlePersonaChange = (persona) => {
    handleNavigate(persona);
  };

  const handleConnect = (connectionInfo) => {
    setDbInfo(connectionInfo);
    setAppState('loading');
  };

  const handleLoadComplete = () => {
    // Determine where to go based on persona
    if (activePersona === 'admin') {
      // Build complete -> maybe go to a summary? But AdminView handles its own completion.
      // If AdminView calls onConnect, it means "Go to Workspace".
      // Let's treat it as entering User Mode with that DB.
      setActivePersona('user');
      setAppState('analytics');
    } else {
      setAppState('analytics');
    }
    setShowPersonaSwitcher(false);
  };

  const handleQuestionSelect = (question) => {
    setInitialQuestion(question);
    setAppState('chat');
  };

  const handleDisconnect = () => {
    setDbInfo(null);
    setAppState('dashboard'); // Go back to main landing
    setActivePersona(null);
    setShowPersonaSwitcher(false);
    setInitialQuestion('');
  };

  const renderContent = () => {
    if (appState === 'dashboard') {
      return <ExecutiveDashboard onNavigate={handleNavigate} />;
    }

    if (appState === 'loading') {
      const isUser = activePersona === 'user';
      const loaderProps = {
        title: isUser ? "Initializing Workspace" : "Launching Application",
        customSteps: isUser ? [
          { id: 1, text: 'Verifying session...' },
          { id: 2, text: 'Connecting to Knowledge Graph...' },
          { id: 3, text: 'Loading agent configuration...' },
          { id: 4, text: 'Preparing dashboards...' }
        ] : [
          { id: 1, text: 'Finalizing setup...' },
          { id: 2, text: 'Loading interface...' },
          { id: 3, text: 'Switching to user mode...' }
        ]
      };

      return <LoaderScreen onComplete={handleLoadComplete} {...loaderProps} />;
    }

    if (activePersona === 'admin' && appState === 'admin-setup') {
      return <AdminView onConnect={handleConnect} setShowPersonaSwitcher={setShowPersonaSwitcher} />;
    } else {
      // User Persona Flow
      if (appState === 'user-selection' || !dbInfo) {
        return <EndUserLanding onSelect={handleConnect} />;
      }

      if (appState === 'analytics') {
        return <AnalyticsDashboard dbInfo={dbInfo} onQuestionSelect={handleQuestionSelect} />;
      }

      return <ChatInterface dbInfo={dbInfo} initialQuestion={initialQuestion} onDisconnect={handleDisconnect} />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar activePersona={activePersona} onPersonaChange={handlePersonaChange} showSwitcher={showPersonaSwitcher} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
