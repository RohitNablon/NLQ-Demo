import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import OntologyGraph from './OntologyGraph';
import LoaderScreen from './LoaderScreen';
import './AdminView.css';
import {
    Database, FolderOpen, ArrowRight, Table, FileText, CheckCircle,
    List, Activity, Tag, Link, Plus, Code, Settings, Cpu, Play, Terminal,
    BarChart, ShoppingCart, Truck, Users, Box, Trash2
} from 'lucide-react';
import metadata from '../store_metadata.json'; // Importing local metadata

const AdminView = ({ onConnect, setShowPersonaSwitcher }) => {
    const fileInputRef = useRef(null);
    const dbFileInputRef = useRef(null);
    const [step, setStep] = useState(0);
    const [selectionStage, setSelectionStage] = useState('selection');
    const [selectedDbType, setSelectedDbType] = useState('PostgreSQL');
    const [selectedDb, setSelectedDb] = useState(null);
    const [selectedReviewTable, setSelectedReviewTable] = useState(null);
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    // New States
    const [selectedUseCase, setSelectedUseCase] = useState(null);
    const [modelConfig, setModelConfig] = useState({
        model: 'Claude 3.5 Sonnet',
        temperature: 0.2,
        contextWindow: '128k',
        reasoningEffort: 'High'
    });
    const [testQuery, setTestQuery] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [isRunningTest, setIsRunningTest] = useState(false);

    // Auto-redirect after ingestion success & Manage Persona Switcher
    useEffect(() => {
        if (setShowPersonaSwitcher) {
            const shouldHide = step > 0 && step < 9; // Hide for all steps except start/end
            setShowPersonaSwitcher(!shouldHide);
        }

        if (step === 9) { // Completion Step
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
        setTimeout(() => {
            setIsTestingConnection(false);
            setConnectionStatus('success');
            setTimeout(() => setConnectionStatus(null), 3000);
        }, 1500);
    };

    const handleRunTest = () => {
        if (!testQuery) return;
        setIsRunningTest(true);
        // Mock execution
        setTimeout(() => {
            setIsRunningTest(false);
            setTestResult({
                sql: "SELECT p.product_name, SUM(s.amount) as total_sales \nFROM sales s \nJOIN products p ON s.product_id = p.id \nGROUP BY p.product_name \nORDER BY total_sales DESC \nLIMIT 5;",
                result: [
                    { product_name: "Premium Widget", total_sales: 54000 },
                    { product_name: "Standard Gadget", total_sales: 32500 },
                    { product_name: "Basic Tool", total_sales: 18200 }
                ],
                status: 'success'
            });
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

    const handleGlossaryChange = (index, field, value) => {
        const newTerms = [...glossaryTerms];
        newTerms[index][field] = value;
        setGlossaryTerms(newTerms);
    };

    const handleAddTerm = () => {
        setGlossaryTerms([...glossaryTerms, { term: '', mapping: '', description: '' }]);
    };

    const handleDeleteTerm = (index) => {
        const newTerms = glossaryTerms.filter((_, i) => i !== index);
        setGlossaryTerms(newTerms);
    };

    // Updated Steps configuration
    const steps = [
        { id: 0, label: 'Use Case' },
        { id: 1, label: 'Connect Source' },
        { id: 2, label: 'Analyze Data' },
        { id: 3, label: 'Review Schema' },
        { id: 4, label: 'Data Glossary' },
        { id: 5, label: 'Vectorize' },
        { id: 6, label: 'Knowledge Graph' },
        { id: 7, label: 'AI Config' },
        { id: 8, label: 'Testing' },
        { id: 9, label: 'Completion' }
    ];

    const useCases = [
        { id: 'sales', title: 'Sales Analytics', icon: BarChart, desc: 'Revenue, growth, and performance metrics.' },
        { id: 'inventory', title: 'Inventory Management', icon: Box, desc: 'Stock levels, turnover, and supply risks.' },
        { id: 'supply', title: 'Supply Chain', icon: Truck, desc: 'Logistics, delivery times, and vendor perf.' },
        { id: 'customer', title: 'Customer 360', icon: Users, desc: 'Segmentation, churn, and LTV analysis.' },
        { id: 'retail', title: 'Retail Operations', icon: ShoppingCart, desc: 'Store performance and foot traffic.' },
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

    const handleConnectDb = (type) => {
        setSelectedDb(type || selectedDbType);
        setStep(2); // Go to Processing
    };

    const handleProcessingComplete = () => {
        setStep(3); // Go to Schema Review
    };

    const handleVectorizationComplete = () => {
        setStep(6); // Go to Knowledge Graph
    };

    const [dbFile, setDbFile] = useState(null);

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
                // Map fields: Name -> term, Description -> description, Mapping -> "User Uploaded"
                const newTerms = json.map(row => ({
                    term: row['Name'] || row['Term'] || '',
                    mapping: 'User Uploaded',
                    description: row['Description'] || ''
                })).filter(t => t.term); // Filter out empty rows

                if (newTerms.length > 0) {
                    setGlossaryTerms(prev => [...prev, ...newTerms]);
                }
            } catch (error) {
                console.error("Error parsing Excel file:", error);
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const handleDbFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDbFile(file);
            // In a real app, you'd upload this file or read it
            console.log("DB File selected:", file.name);
        }
        e.target.value = '';
    };

    const triggerUpload = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const triggerDbUpload = () => {
        if (dbFileInputRef.current) dbFileInputRef.current.click();
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Use Case Selection
                return (
                    <div className="use-case-step fade-in">
                        <div className="onboarding-header">
                            <h2 className="section-title">Select Business Use Case</h2>
                            <p className="section-subtitle">Choose a template to pre-configure agents and semantics.</p>
                        </div>
                        <div className="use-case-grid">
                            {useCases.map(uc => (
                                <div
                                    key={uc.id}
                                    className={`use-case-card ${selectedUseCase === uc.id ? 'active' : ''}`}
                                    onClick={() => setSelectedUseCase(uc.id)}
                                >
                                    <div className="uc-icon-box">
                                        <uc.icon size={24} />
                                    </div>
                                    <div className="uc-info">
                                        <h3>{uc.title}</h3>
                                        <p>{uc.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="step-actions" style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button
                                className="btn btn-primary"
                                disabled={!selectedUseCase}
                                onClick={() => setStep(1)}
                            >
                                Next: Connect Source <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                );

            case 1: // Connect Source
                if (selectionStage === 'selection') {
                    return (
                        <div className="db-onboarding fade-in">
                            <div className="onboarding-header">
                                <h2 className="section-title">Select Data Source</h2>
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
                                    <select className="form-select" value={selectedDbType} onChange={(e) => setSelectedDbType(e.target.value)}>
                                        <option value="PostgreSQL">PostgreSQL</option>
                                        <option value="MySQL">MySQL</option>
                                        <option value="SQLite">SQLite</option>
                                        <option value="SQL Server">SQL Server</option>
                                    </select>
                                </div>

                                {selectedDbType === 'SQLite' ? (
                                    <div className="form-content fade-in">
                                        <input type="file" ref={dbFileInputRef} onChange={handleDbFileUpload} accept=".db,.sqlite,.sqlite3" className="hidden-input" />
                                        <div className="upload-area" onClick={triggerDbUpload} style={{
                                            border: '2px dashed var(--border)',
                                            borderRadius: '12px',
                                            padding: '40px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: 'rgba(255,255,255,0.02)',
                                            marginBottom: '20px',
                                            transition: 'all 0.3s'
                                        }}>
                                            <Database size={48} style={{ color: 'var(--accent)', marginBottom: '16px', opacity: 0.7 }} />
                                            {dbFile ? (
                                                <div>
                                                    <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>File Selected</h3>
                                                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{dbFile.name}</p>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{(dbFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Upload SQLite Database</h3>
                                                    <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Click to browse local files</p>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(.db, .sqlite, .sqlite3)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-content fade-in">
                                        <div className="form-row" style={{ gridTemplateColumns: '3fr 1fr' }}>
                                            <div className="form-group">
                                                <label>Host</label>
                                                <input type="text" defaultValue="db.internal.prod.aws" placeholder="e.g., localhost or IP" />
                                            </div>
                                            <div className="form-group">
                                                <label>Port</label>
                                                <input type="text" defaultValue="5432" />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Username</label>
                                                <input type="text" defaultValue="admin_readonly" />
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <input type="password" defaultValue="••••••••••••" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Database Name</label>
                                            <input type="text" defaultValue="production_analytics" />
                                        </div>
                                    </div>
                                )}
                                <div className="form-actions">
                                    <button className={`btn btn-outline test-conn-btn ${connectionStatus === 'success' ? 'success' : ''}`} onClick={handleTestConnection} disabled={isTestingConnection}>
                                        {isTestingConnection ? 'Testing...' : connectionStatus === 'success' ? 'Verified' : 'Test Connection'}
                                    </button>
                                    <button className="btn btn-primary btn-lg" onClick={() => handleConnectDb(selectedDbType)}>
                                        Connect & Initialize <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="connection-help fade-in">
                                <h3>Connection Guide</h3>
                                {selectedDbType === 'SQLite' ? (
                                    <>
                                        <p>SQLite is ideal for local testing and lightweight analytics.</p>
                                        <ul>
                                            <li>Supports .db, .sqlite, .sqlite3 files</li>
                                            <li>File is processed locally in browser</li>
                                            <li>Ensure database is not locked</li>
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <p>Ensure the following settings are enabled in your database configuration:</p>
                                        <ul>
                                            <li>Allow remote connections</li>
                                            <li>Read-only permissions for the user</li>
                                            <li>SSL required (recommended)</li>
                                        </ul>
                                    </>
                                )}
                                <div className="help-box">
                                    <FileText size={16} />
                                    <span>Need help? Check our <a href="#">Documentation</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Analyze Data (Loader)
                return (
                    <div className="processing-step fade-in">
                        <LoaderScreen onComplete={handleProcessingComplete} />
                    </div>
                );

            case 3: // Review Schema
                return (
                    <div className="schema-step fade-in split-layout">
                        <div className="schema-main-content">
                            <div className="step-header-actions">
                                <h2 className="section-title">Review Discovered Schema</h2>
                                <button className="btn btn-primary" onClick={() => setStep(4)}>Next: Data Glossary <ArrowRight size={16} /></button>
                            </div>
                            <div className="schema-container">
                                {metadata.tables.map((table) => (
                                    <div
                                        className={`schema-card ${selectedReviewTable?.table_id === table.table_id ? 'active' : ''}`}
                                        key={table.table_id}
                                        onClick={() => setSelectedReviewTable(table)}
                                    >
                                        <div className="schema-card-header">
                                            <Table size={18} className="text-accent" />
                                            <span className="schema-table-name">{table.table_name}</span>
                                            <span className="schema-row-count">{Number(table.row_count).toLocaleString()} rows</span>
                                        </div>
                                        <p className="schema-desc">{table.description.description?.substring(0, 80)}...</p>
                                        <div className="schema-columns">
                                            {table.columns.slice(0, 3).map(col => (
                                                <span key={col.name} className="schema-col-badge">{col.name}</span>
                                            ))}
                                            {table.columns.length > 3 && <span className="schema-col-badge muted">+{table.columns.length - 3}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedReviewTable && (
                            <div className="schema-side-panel fade-in-right">
                                <div className="side-panel-header">
                                    <h3>{selectedReviewTable.table_name} Details</h3>
                                    <button className="close-panel-btn" onClick={() => setSelectedReviewTable(null)}>×</button>
                                </div>
                                <div className="side-panel-body">
                                    <div className="panel-section">
                                        <h4 className="panel-label">Description</h4>
                                        <p className="panel-text">{selectedReviewTable.description.description}</p>
                                    </div>
                                    <div className="panel-section">
                                        <div className="stat-grid">
                                            <div className="stat-item">
                                                <span className="stat-label">Total Rows</span>
                                                <span className="stat-value">{Number(selectedReviewTable.row_count).toLocaleString()}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Columns</span>
                                                <span className="stat-value">{selectedReviewTable.columns.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-section">
                                        <h4 className="panel-label">Columns</h4>
                                        <div className="column-list-header">
                                            <span>Column</span>
                                            <span>Type</span>
                                            <span>Keys</span>
                                        </div>
                                        <div className="column-list">
                                            {selectedReviewTable.columns.map(col => (
                                                <div key={col.name} className="column-item">
                                                    <span className="col-name">{col.name}</span>
                                                    <span className="col-type">{col.data_type}</span>
                                                    <div className="col-keys">
                                                        {col.is_primary_key && <span className="key-badge pk">PK</span>}
                                                        {col.is_foreign_key && <span className="key-badge fk">FK</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4: // Data Glossary
                return (
                    <div className="glossary-step fade-in">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .csv" className="hidden-input" />
                        <div className="step-header-actions">
                            <h2 className="section-title">Business Glossary</h2>
                            <div className="header-actions">
                                <button className="btn btn-outline" onClick={triggerUpload}><Plus size={16} /> Upload</button>
                                <button className="btn btn-primary" onClick={() => setStep(5)}>Next: Vectorize <ArrowRight size={16} /></button>
                            </div>
                        </div>
                        <div className="glossary-table-wrapper">
                            <table className="kpi-table">
                                <thead>
                                    <tr>
                                        <th>Term</th>
                                        <th>Mapping</th>
                                        <th>Description</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {glossaryTerms.map((term, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <input
                                                    className="glossary-input"
                                                    value={term.term}
                                                    onChange={(e) => handleGlossaryChange(idx, 'term', e.target.value)}
                                                    placeholder="Enter term..."
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="glossary-input"
                                                    value={term.mapping}
                                                    onChange={(e) => handleGlossaryChange(idx, 'mapping', e.target.value)}
                                                    placeholder="Table.Column"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="glossary-input full-width"
                                                    value={term.description}
                                                    onChange={(e) => handleGlossaryChange(idx, 'description', e.target.value)}
                                                    placeholder="Description..."
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-icon-danger"
                                                    onClick={() => handleDeleteTerm(idx)}
                                                    title="Remove Term"
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error, #ef4444)', padding: '4px', display: 'flex' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="glossary-actions" style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                                <button className="btn btn-outline btn-sm" onClick={handleAddTerm}>
                                    <Plus size={16} /> Add Term
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Vectorize (Loader)
                return (
                    <div className="processing-step fade-in">
                        <LoaderScreen
                            title="Building Knowledge Graph"
                            customSteps={[{ id: 1, text: 'Generating embeddings...' }, { id: 2, text: 'Linking entities...' }, { id: 3, text: 'Verifying ontology...' }]}
                            onComplete={handleVectorizationComplete}
                        />
                    </div>
                );

            case 6: // Knowledge Graph
                return (
                    <div className="ontology-step fade-in">
                        <div className="step-header-actions">
                            <h2 className="section-title">Strategic Knowledge Graph</h2>
                            <button className="btn btn-primary" onClick={() => setStep(7)}>Next: AI Config <ArrowRight size={16} /></button>
                        </div>
                        <OntologyGraph metadata={metadata} glossaryTerms={glossaryTerms} />
                    </div>
                );

            case 7: // AI Config (NEW)
                return (
                    <div className="ai-config-step fade-in">
                        <div className="step-header-actions">
                            <h2 className="section-title">AI Model Configuration</h2>
                            <button className="btn btn-primary" onClick={() => setStep(8)}>Next: Testing <ArrowRight size={16} /></button>
                        </div>
                        <div className="model-config-container">
                            <div className="config-section">
                                <h3>Model Selection</h3>
                                <div className="form-group">
                                    <label>Primary LLM</label>
                                    <select className="form-select" value={modelConfig.model} onChange={e => setModelConfig({ ...modelConfig, model: e.target.value })}>
                                        <option>GPT-5.2</option>
                                        <option>Gemini-3-Pro</option>
                                        <option>Claude-Sonnet-4.5</option>
                                        <option>Claude Opus 4.5</option>
                                    </select>
                                </div>
                            </div>
                            <div className="config-section">
                                <h3>Parameters</h3>
                                <div className="form-group">
                                    <label>Temperature (Creativity): {modelConfig.temperature}</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={modelConfig.temperature}
                                        onChange={e => setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                                        className="form-range"
                                    />
                                    <div className="slider-labels"><span>Precise</span><span>Creative</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 8: // Testing (NEW)
                return (
                    <div className="testing-step fade-in">
                        <div className="step-header-actions">
                            <h2 className="section-title">Validation Console</h2>
                            <button className="btn btn-success" onClick={() => setStep(9)}>Deploy to Production <CheckCircle size={16} /></button>
                        </div>
                        <div className="testing-console">
                            <div className="test-panel">
                                <div className="panel-header">Result Output</div>
                                <div className="test-output">
                                    {isRunningTest ? <span className="blinking-cursor">Running query...</span> :
                                        testResult ? (
                                            <div>
                                                <div className="sql-output">{testResult.sql}</div>
                                                <br />
                                                <div style={{ color: '#fff' }}>{JSON.stringify(testResult.result, null, 2)}</div>
                                                <br />
                                                <span className="status-badge pass">PASSED</span>
                                            </div>
                                        ) : <span className="text-muted">// Run a test query to validate</span>}
                                </div>
                            </div>
                            <div className="test-panel">
                                <div className="panel-header">Test Input</div>
                                <div className="test-output">
                                    <div className="user-query-mock">
                                        <span className="text-accent">User:</span> {testQuery || "..."}
                                    </div>
                                </div>
                                <div className="test-input-area">
                                    <input
                                        type="text"
                                        className="test-input"
                                        placeholder="Enter a test question..."
                                        value={testQuery}
                                        onChange={e => setTestQuery(e.target.value)}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={handleRunTest} disabled={!testQuery || isRunningTest}>
                                        <Play size={14} /> Run
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 9: // Completion
                return (
                    <div className="completion-step fade-in">
                        <div className="completion-card">
                            <div className="success-icon-wrapper">
                                <CheckCircle size={64} className="text-success" />
                            </div>
                            <h2 className="success-title">Deployment Successful</h2>
                            <p className="success-desc">
                                Your Agentic NLQ solution is now live. Redirecting to workspace...
                            </p>
                            <button className="btn btn-primary btn-lg" onClick={() => onConnect({ databaseType: selectedDb, connectionString: 'mock' })}>
                                Go to Workspace <ArrowRight size={20} />
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
            <div className="wizard-progress">
                {steps.map((s, idx) => (
                    <div key={s.id} className={`wizard-step-dot ${step >= idx ? 'active' : ''}`} title={s.label}></div>
                ))}
            </div>
            <div className="step-content-wrapper">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default AdminView;
