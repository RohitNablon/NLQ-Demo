import React, { useState } from 'react';
import './HomePage.css';

const HomePage = ({ onConnect }) => {
  const [activeFlow, setActiveFlow] = useState(null); // 'custom' or 'sample'
  const [connectionString, setConnectionString] = useState('');
  const [databaseType, setDatabaseType] = useState('postgresql');

  // If no flow selected, show the selection cards
  const renderSelection = () => (
    <div className="flow-selection">
      <div className="nablon-card" onClick={() => setActiveFlow('custom')}>
        <div className="card-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20" />
            <path d="M22 2L2 22" />
          </svg>
        </div>
        <h3 className="card-title">Greenfield: Custom Connection</h3>
        <p className="card-description">
          Connect to your own PostgreSQL, MySQL, or SQL Server database. Define your schema and start querying your data instantly.
        </p>
        <div className="card-action">Initialize Flow &rarr;</div>
      </div>

      <div
        className="nablon-card"
        onClick={() => onConnect({ connectionString: 'mock://store_sample', databaseType: 'Sample Dataset' })}
      >
        <div className="card-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h3 className="card-title">Brownfield: Sample Dataset</h3>
        <p className="card-description">
          Import and explore the Iowa Liquor Sales dataset. Visualize the pre-configured Star Schema and test agent capabilities immediately.
        </p>
        <div className="card-action">Initialize Flow &rarr;</div>
      </div>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (connectionString.trim()) {
      onConnect({ connectionString, databaseType });
    }
  };

  return (
    <div className="home-page">
      <div className="background-grid"></div>
      <div className="home-content">
        <header className="nablon-header">
          <div className="nablon-logo">Nablon</div>
          <button className="header-action-btn">What is Agentic NLQ?</button>
        </header>

        <div className="hero-section">
          <h1 className="hero-title">Nablon Agentic NLQ Catalyst</h1>
          <p className="hero-subtitle">
            Select your data trajectory to initialize the autonomous query swarm.
          </p>
        </div>

        {activeFlow === 'custom' ? (
          <div className="connect-card fade-in">
            <div className="card-back-btn" onClick={() => setActiveFlow(null)}>&larr; Back to Selection</div>
            <h2 className="form-title">Establish Connection</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Database Type</label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={databaseType}
                    onChange={(e) => setDatabaseType(e.target.value)}
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlserver">SQL Server</option>
                    <option value="oracle">Oracle</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Connection String</label>
                <input
                  type="text"
                  className="input"
                  placeholder="postgresql://user:pass@localhost:5432/mydb"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="connect-btn">
                Initialize Agent &rarr;
              </button>
            </form>
          </div>
        ) : (
          renderSelection()
        )}
      </div>
    </div>
  );
};

export default HomePage;
