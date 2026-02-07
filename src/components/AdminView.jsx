import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import OntologyGraph from './OntologyGraph';
import LoaderScreen from './LoaderScreen';
import './AdminView.css';
import { Database, FolderOpen, ArrowRight, Table, FileText, CheckCircle, List, Activity, Tag, Link, Plus, Code } from 'lucide-react';
import metadata from '../store_metadata.json'; // Importing local metadata

const AdminView = ({ onConnect, setShowPersonaSwitcher }) => {
    const fileInputRef = useRef(null);
    const dbFileInputRef = useRef(null);
    const [step, setStep] = useState(0); // 0-7
    const [selectionStage, setSelectionStage] = useState('selection'); // 'selection' or 'details'
    const [selectedDbType, setSelectedDbType] = useState('PostgreSQL');
    const [selectedDb, setSelectedDb] = useState(null);
    const [selectedReviewTable, setSelectedReviewTable] = useState(null);
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null); // 'success' | 'error' | null
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

    // Auto-redirect after ingestion success & Manage Persona Switcher
    useEffect(() => {
        if (setShowPersonaSwitcher) {
            const shouldHide = step > 0 || selectionStage === 'details';
            setShowPersonaSwitcher(!shouldHide);
        }

        if (step === 7) {
            const timer = setTimeout(() => {
                onConnect({ databaseType: selectedDb, connectionString: 'mock' });
            }, 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            if (setShowPersonaSwitcher) setShowPersonaSwitcher(true);
        };
    }, [step, selectionStage, onConnect, selectedDb, setShowPersonaSwitcher]);

    const handleTestConnection = () => {
        setIsTestingConnection(true);
        setConnectionStatus(null);

        // Simulate network request
        setTimeout(() => {
            setIsTestingConnection(false);
            setConnectionStatus('success');

            // Revert status after 3 seconds
            setTimeout(() => {
                setConnectionStatus(null);
            }, 3000);
        }, 1500);
    };

    const [glossaryTerms, setGlossaryTerms] = useState([
        { term: 'Revenue', mapping: 'Fact_Sales.sale_amount', description: 'Total sales amount from invoices.' },
        { term: 'Total Volume (Liters)', mapping: 'Fact_Sales (Calculated)', description: '(Bottle_Volume_ML * Units_Sold) / 1000' },
        { term: 'Case Equivalent Sales', mapping: 'Fact_Sales (Calculated)', description: 'Units_Sold / Pack_Size' },
        { term: 'Bottles Sold', mapping: 'Fact_Sales.bottles_sold', description: 'Number of individual units/bottles sold.' },
        { term: 'State Cost', mapping: 'Fact_Sales.state_bottle_cost', description: 'Wholesale cost per bottle set by the state.' },
        { term: 'Retail Price', mapping: 'Fact_Sales.state_bottle_retail', description: 'Shelf price per bottle.' },
        { term: 'Vendor', mapping: 'Dim_Vendor.vendor_name', description: 'Supplier name.' },
        { term: 'Store', mapping: 'Dim_Store.store_name', description: 'Name of the retail location.' },
        { term: 'Category', mapping: 'Dim_Product.category_name', description: 'Product category (e.g., VAP, Whiskies).' }
    ]);

    // Steps configuration
    const steps = [
        { id: 0, label: 'Connect Source' },
        { id: 1, label: 'Analyze Data' },
        { id: 2, label: 'Review Schema' },
        { id: 3, label: 'Relationships' },
        { id: 4, label: 'Data Glossary' },
        { id: 5, label: 'Vectorize' },
        { id: 6, label: 'Knowledge Graph' },
        { id: 7, label: 'Completion' }
    ];

    const handleDbSelect = (type) => {
        setSelectedDbType(type);
        setSelectionStage('details');
        if (setShowPersonaSwitcher) setShowPersonaSwitcher(false);
    };

    const handleBackToSelection = () => {
        setSelectionStage('selection');
        setSelectedDbType(null);
        if (setShowPersonaSwitcher) setShowPersonaSwitcher(true);
    };

    const handleConnect = (type) => {
        setSelectedDb(type || selectedDbType);
        setStep(1); // Go to Processing
    };

    const handleProcessingComplete = () => {
        setStep(2); // Go to Schema Review
    };

    const handleVectorizationComplete = () => {
        setStep(6); // Go to Knowledge Graph
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const newTerms = json
                    .map(row => {
                        // Find keys case-insensitively
                        const keys = Object.keys(row);
                        const nameKey = keys.find(k => k.toLowerCase() === 'name' || k.toLowerCase() === 'term');
                        const descKey = keys.find(k => k.toLowerCase() === 'description' || k.toLowerCase() === 'desc');

                        if (nameKey && row[nameKey]) {
                            return {
                                term: row[nameKey],
                                mapping: 'Fact_Sales (Calculated)',
                                description: descKey ? row[descKey] : 'No description provided'
                            };
                        }
                        return null;
                    })
                    .filter(item => item !== null);

                if (newTerms.length > 0) {
                    setGlossaryTerms(prev => [...newTerms, ...prev]);
                }
            } catch (error) {
                console.error("Error parsing Excel file:", error);
            }
        };
        reader.readAsArrayBuffer(file);
        // Reset input to allow re-uploading the same file
        e.target.value = '';
    };

    const triggerUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDbFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // In a real app, we might upload this to a server. 
        // For UI, we'll just show the filename in the input.
        const pathInput = document.getElementById('db-path-input');
        if (pathInput) pathInput.value = `./data/${file.name}`;
    };

    const triggerDbUpload = () => {
        if (dbFileInputRef.current) {
            dbFileInputRef.current.click();
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Connect
                if (selectionStage === 'selection') {
                    return (
                        <div className="db-onboarding fade-in">
                            <div className="onboarding-header">
                                <h2 className="section-title">Select Data Source</h2>
                                <button className="btn btn-outline agent-info-btn" onClick={() => setShowAgentModal(true)}>
                                    <Activity size={16} /> NLQ Agent
                                </button>
                            </div>
                            <div className="db-selection-grid single-card">
                                <div className="db-card central-card" onClick={() => setSelectionStage('details')}>
                                    <div className="db-card-icon-wrapper">
                                        <Database className="db-icon" size={32} />
                                    </div>
                                    <div className="db-card-info">
                                        <h3 className="db-title">Connect Database</h3>
                                        <p className="db-desc">PostgreSQL, MySQL, SQLite, SQL Server, etc.</p>
                                    </div>
                                    <ArrowRight size={24} className="db-card-arrow" />
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="db-details fade-in-right">
                        <div className="step-header-actions">
                            <button className="back-btn" onClick={handleBackToSelection}>
                                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Selection
                            </button>
                            <h2 className="section-title">Connection Details</h2>
                        </div>

                        <div className="connection-form-container">
                            <div className="connection-form">
                                <div className="form-group">
                                    <label>Database Type</label>
                                    <select
                                        className="form-select"
                                        value={selectedDbType}
                                        onChange={(e) => setSelectedDbType(e.target.value)}
                                    >
                                        <option value="PostgreSQL">PostgreSQL</option>
                                        <option value="MySQL">MySQL</option>
                                        <option value="SQLite">SQLite</option>
                                        <option value="SQL Server">SQL Server</option>
                                    </select>
                                </div>

                                {selectedDbType === 'SQLite' ? (
                                    <div className="form-group fade-in">
                                        <label>Database File Path</label>
                                        <div className="input-with-action">
                                            <div className="input-with-icon" style={{ flex: 1 }}>
                                                <FolderOpen size={18} className="input-icon" />
                                                <input
                                                    id="db-path-input"
                                                    type="text"
                                                    placeholder="/path/to/database.db"
                                                    defaultValue="./data/store.sqlite"
                                                />
                                            </div>
                                            <button className="btn btn-outline btn-sm action-btn" onClick={triggerDbUpload}>
                                                <Plus size={14} /> Upload
                                            </button>
                                            <input
                                                type="file"
                                                ref={dbFileInputRef}
                                                onChange={handleDbFileUpload}
                                                accept=".sqlite, .db, .duckdb"
                                                className="hidden-input"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-content fade-in">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Host</label>
                                                <input type="text" placeholder="localhost" defaultValue="db.enterprise.internal" />
                                            </div>
                                            <div className="form-group port">
                                                <label>Port</label>
                                                <input type="text" placeholder="5432" defaultValue={selectedDbType === 'MySQL' ? '3306' : '5432'} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Database Name</label>
                                            <input type="text" placeholder="my_database" defaultValue="production_analytics" />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Username</label>
                                                <input type="text" placeholder="admin" defaultValue="readonly_service" />
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <input type="password" placeholder="••••••••" defaultValue="password123" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        className={`btn btn-outline test-conn-btn ${connectionStatus === 'success' ? 'success' : ''}`}
                                        onClick={handleTestConnection}
                                        disabled={isTestingConnection}
                                    >
                                        {isTestingConnection ? (
                                            <>
                                                <div className="btn-spinner"></div> Testing...
                                            </>
                                        ) : connectionStatus === 'success' ? (
                                            <>
                                                <CheckCircle size={16} /> Verified
                                            </>
                                        ) : (
                                            <>
                                                <Activity size={16} /> Test Connection
                                            </>
                                        )}
                                    </button>
                                    <button className="btn btn-primary btn-lg" onClick={() => handleConnect(selectedDbType)}>
                                        Connect & Initialize <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="connection-help">
                                <h3>Connection Guide</h3>
                                <p>Ensure the following settings are enabled in your {selectedDbType} configuration:</p>
                                <ul>
                                    {selectedDbType === 'SQLite' ? (
                                        <>
                                            <li>File readable and writable permissions</li>
                                            <li>Correct path relative to service root</li>
                                            <li>Journal mode set to WAL (recommended)</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Allow remote connections</li>
                                            <li>Read-only permissions for the user</li>
                                            <li>SSL required (recommended)</li>
                                        </>
                                    )}
                                </ul>
                                <div className="help-box">
                                    <FileText size={16} />
                                    <span>Need help? Check our <a href="#">Documentation</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 1: // Processing Loader
                return (
                    <div className="processing-step fade-in">
                        <LoaderScreen onComplete={handleProcessingComplete} />
                    </div>
                );
            case 2: // Schema Review
                return (
                    <div className={`schema-step fade-in ${selectedReviewTable && viewMode === 'table' ? 'split-layout' : ''} ${viewMode === 'json' ? 'json-layout' : ''}`}>

                        {/* JSON View Layout */}
                        {viewMode === 'json' ? (
                            <div className="json-view-container">
                                <div className="json-sidebar">
                                    <div className="json-sidebar-header">
                                        <h3>Tables</h3>
                                    </div>
                                    <div className="json-table-list">
                                        {metadata.tables.map(table => (
                                            <div
                                                key={table.table_id}
                                                className={`json-table-item ${selectedReviewTable?.table_id === table.table_id ? 'active' : ''}`}
                                                onClick={() => setSelectedReviewTable(table)}
                                            >
                                                <Table size={14} />
                                                <span>{table.table_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="json-content-area">
                                    <div className="step-header-actions">
                                        <h2 className="section-title">
                                            {selectedReviewTable ? `${selectedReviewTable.table_name} Schema` : 'Review Schema'}
                                        </h2>
                                        <div className="header-actions-group">
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => setViewMode('table')}
                                            >
                                                <Table size={16} /> Table View
                                            </button>
                                            <button className="btn btn-primary" onClick={() => setStep(3)}>
                                                Next: Relationships <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="json-code-wrapper">
                                        {selectedReviewTable ? (
                                            <pre className="json-code-block">
                                                {JSON.stringify(selectedReviewTable, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="empty-json-state">
                                                <Code size={48} className="text-muted" />
                                                <p>Select a table to view its JSON definition</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Table Grid Layout */
                            <>
                                <div className="schema-main-content">
                                    <div className="step-header-actions">
                                        <h2 className="section-title">Review Schema</h2>
                                        <div className="header-actions-group">
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => {
                                                    setViewMode('json');
                                                    if (!selectedReviewTable) setSelectedReviewTable(metadata.tables[0]);
                                                }}
                                            >
                                                <Code size={16} /> JSON View
                                            </button>
                                            <button className="btn btn-primary" onClick={() => setStep(3)}>
                                                Next: Relationships <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="schema-container">
                                        {metadata.tables.slice(0, 4).map((table) => (
                                            <div
                                                className={`schema-card ${selectedReviewTable?.table_id === table.table_id ? 'active' : ''}`}
                                                key={table.table_id}
                                                onClick={() => setSelectedReviewTable(table)}
                                            >
                                                <div className="schema-card-header">
                                                    <Table size={18} className="text-accent" />
                                                    <span className="schema-table-name">{table.table_name}</span>
                                                    <span className="schema-row-count">{table.row_count.toLocaleString()} rows</span>
                                                </div>
                                                <p className="schema-desc">{table.description.description.substring(0, 100)}...</p>
                                                <div className="schema-columns">
                                                    {table.columns.slice(0, 3).map(col => (
                                                        <span key={col.column_id} className="schema-col-badge">{col.name}</span>
                                                    ))}
                                                    {table.columns.length > 3 && <span className="schema-col-badge muted">+{table.columns.length - 3} more</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedReviewTable && (
                                    <div className="schema-side-panel fade-in-right">
                                        <div className="side-panel-header">
                                            <h3>{selectedReviewTable.table_name} Details</h3>
                                            <button className="close-panel-btn" onClick={() => setSelectedReviewTable(null)}>&times;</button>
                                        </div>
                                        <div className="side-panel-body">
                                            <div className="stats-grid">
                                                <div className="stat-item">
                                                    <span className="stat-label">Total Rows</span>
                                                    <span className="stat-value">{selectedReviewTable.row_count.toLocaleString()}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-label">Columns</span>
                                                    <span className="stat-value">{selectedReviewTable.columns.length}</span>
                                                </div>
                                            </div>
                                            <p className="side-panel-desc">{selectedReviewTable.description.description}</p>
                                            <div className="details-table-wrapper">
                                                <table className="details-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Column</th>
                                                            <th>Type</th>
                                                            <th>Keys</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedReviewTable.columns.map(col => (
                                                            <tr key={col.column_id}>
                                                                <td>{col.name}</td>
                                                                <td className="type-col">{col.data_type}</td>
                                                                <td>
                                                                    <div className="key-badges">
                                                                        {col.is_primary_key && <span className="k-badge pk">PK</span>}
                                                                        {col.is_foreign_key && <span className="k-badge fk">FK</span>}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case 3: // Relationships
                return (
                    <div className="relationships-step fade-in">
                        <div className="step-header-actions">
                            <h2 className="section-title">Entity Relationships</h2>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>
                                Next: Data Glossary <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="er-diagram-placeholder">
                            {/* Simple visual representation of FKs found in metadata */}
                            <div className="er-visual-center">
                                <div className="er-node central">Fact_Sales</div>
                                <div className="er-lines">
                                    <div className="er-line top"></div>
                                    <div className="er-line right"></div>
                                    <div className="er-line bottom"></div>
                                    <div className="er-line left"></div>
                                </div>
                                <div className="er-node top">Dim_Vendor</div>
                                <div className="er-node right">Dim_Item</div>
                                <div className="er-node bottom">Dim_Store</div>
                                <div className="er-node left">Date</div>
                            </div>
                            <p className="text-center text-muted mt-4">Detected Star Schema Architecture</p>
                        </div>
                    </div>
                );
            case 4: // Glossary
                return (
                    <div className="glossary-step fade-in">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".xlsx, .xls, .csv"
                            className="hidden-input"
                        />
                        <div className="step-header-actions">
                            <h2 className="section-title">Data Glossary</h2>
                            <div className="header-actions">
                                <button className="btn btn-outline" onClick={triggerUpload}>
                                    <Plus size={16} /> Upload File
                                </button>
                                <button className="btn btn-primary" onClick={() => setStep(5)}>
                                    Next: Vectorize <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="upload-disclaimer">
                            <Activity size={18} className="disclaimer-icon" />
                            <div className="disclaimer-text">
                                Maximize performance by uploading your business glossary.
                            </div>
                        </div>

                        <p className="step-desc">Define business terminology to help the agent understand your specific lingo.</p>

                        <div className="glossary-table-wrapper">
                            <table className="kpi-table">
                                <thead>
                                    <tr>
                                        <th>Business Term</th>
                                        <th>Mapping</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {glossaryTerms.map((term, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="term-cell">
                                                    {term.term}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="mapping-pill">
                                                    <Link size={14} />
                                                    {term.mapping}
                                                </div>
                                            </td>
                                            <td className="desc-cell">{term.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 5: // Vectorization
                return (
                    <div className="processing-step fade-in">
                        <LoaderScreen
                            title="Initializing Knowledge Graph"
                            customSteps={[
                                { id: 1, text: 'Generating embeddings...' },
                                { id: 2, text: 'Indexing columns...' },
                                { id: 3, text: 'Storing vectors...' }
                            ]}
                            onComplete={handleVectorizationComplete}
                        />
                    </div>
                );
            case 6: // Knowledge Graph
                return (
                    <div className="ontology-step fade-in">
                        <div className="step-header-actions">
                            <h2 className="section-title">Knowledge Graph</h2>
                            <button className="btn btn-success" onClick={() => setStep(7)}>
                                Complete Ingestion <CheckCircle size={16} />
                            </button>
                        </div>
                        <OntologyGraph metadata={metadata} glossaryTerms={glossaryTerms} />
                    </div>
                );
            case 7: // Completion
                return (
                    <div className="completion-step fade-in">
                        <div className="completion-card">
                            <div className="success-icon-wrapper">
                                <CheckCircle size={64} className="text-success" />
                            </div>
                            <h2 className="success-title">Ingestion Successful</h2>
                            <p className="success-desc">
                                Your data has been successfully ingested and indexed. Redirecting to workspace...
                            </p>
                            <button className="btn btn-primary btn-lg" onClick={() => onConnect({ databaseType: selectedDb, connectionString: 'mock' })}>
                                Go to Chat Interface <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-view">
            {/* Minimal Header for Wizard */}
            <div className="wizard-progress">
                {steps.map((s, idx) => (
                    <div key={s.id} className={`wizard-step-dot ${step >= idx ? 'active' : ''}`} title={s.label}></div>
                ))}
            </div>

            <div className="step-content-wrapper">
                {renderStepContent()}
            </div>

            {showAgentModal && (
                <div className="agent-modal-overlay fade-in" onClick={() => setShowAgentModal(false)}>
                    <div className="agent-modal" onClick={e => e.stopPropagation()}>
                        <div className="agent-modal-header">
                            <h2>Thinking with Nablon Agent</h2>
                            <button className="close-btn" onClick={() => setShowAgentModal(false)}>&times;</button>
                        </div>
                        <div className="agent-modal-body">
                            <p className="agent-desc">
                                Nablon.AI uses a multi-agent architecture to decompose your questions, query your database accurately, and visualize the results.
                            </p>

                            <div className="agent-flow-steps">
                                <div className="flow-step">
                                    <div className="flow-icon">1</div>
                                    <h3>User Intent</h3>
                                    <p>The agent analyzes your natural language question to understand the core intent.</p>
                                </div>
                                <div className="flow-connector">→</div>
                                <div className="flow-step">
                                    <div className="flow-icon">2</div>
                                    <h3>Plan Execution</h3>
                                    <p>It creates a step-by-step plan, querying the DB and applying business logic.</p>
                                </div>
                                <div className="flow-connector">→</div>
                                <div className="flow-step">
                                    <div className="flow-icon">3</div>
                                    <h3>Visual Answer</h3>
                                    <p>Results are formulated into a clear answer with relevant charts and graphs.</p>
                                </div>
                            </div>
                        </div>
                        <div className="agent-modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowAgentModal(false)}>
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
