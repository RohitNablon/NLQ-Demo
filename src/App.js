import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AdminView from './components/AdminView';
import LoaderScreen from './components/LoaderScreen';
import ChatInterface from './components/ChatInterface';
import EndUserLanding from './components/EndUserLanding';
import './index.css';

function App() {
  const [activePersona, setActivePersona] = useState('admin'); // 'admin' | 'user'
  const [appState, setAppState] = useState('home'); // 'home' | 'loading' | 'chat'
  const [dbInfo, setDbInfo] = useState(null);
  const [showPersonaSwitcher, setShowPersonaSwitcher] = useState(true);

  const handlePersonaChange = (persona) => {
    setActivePersona(persona);
    setShowPersonaSwitcher(true); // Ensure it's shown when switching
  };

  const handleConnect = (connectionInfo) => {
    setDbInfo(connectionInfo);
    setAppState('loading');
    // Auto-switch to user view after loading
  };

  const handleLoadComplete = () => {
    setAppState('chat');
    setActivePersona('user');
    setShowPersonaSwitcher(false);
  };

  const handleDisconnect = () => {
    setDbInfo(null);
    setAppState('home');
    setActivePersona('admin');
    setShowPersonaSwitcher(true);
  };

  const renderContent = () => {
    if (appState === 'loading') {
      const isUser = activePersona === 'user';
      const loaderProps = {
        title: isUser ? "Initializing Workspace" : "Launching Application",
        customSteps: isUser ? [
          { id: 1, text: 'Verifying session...' },
          { id: 2, text: 'Connecting to Knowledge Graph...' },
          { id: 3, text: 'Loading agent configuration...' },
          { id: 4, text: 'Preparing chat interface...' }
        ] : [
          { id: 1, text: 'Finalizing setup...' },
          { id: 2, text: 'Loading interface...' },
          { id: 3, text: 'Switching to user mode...' }
        ]
      };

      return <LoaderScreen onComplete={handleLoadComplete} {...loaderProps} />;
    }

    if (activePersona === 'admin') {
      return <AdminView onConnect={handleConnect} setShowPersonaSwitcher={setShowPersonaSwitcher} />;
    } else {
      if (!dbInfo) {
        return <EndUserLanding onSelect={handleConnect} />;
      }
      return <ChatInterface dbInfo={dbInfo} onDisconnect={handleDisconnect} />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar activePersona={activePersona} onPersonaChange={handlePersonaChange} showSwitcher={showPersonaSwitcher} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
