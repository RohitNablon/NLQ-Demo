import React from 'react';
import { Database, ArrowRight, Server, Activity } from 'lucide-react';
import './EndUserLanding.css';

const MOCK_DATABASES = [
    {
        id: 1,
        name: "Sales & Revenue",
        description: "Global sales data, revenue metrics, and customer acquisition channels.",
        status: "active",
        lastUpdated: "2 mins ago"
    },
    {
        id: 2,
        name: "Supply Chain",
        description: "Inventory levels, supplier performance, and logistics tracking.",
        status: "active",
        lastUpdated: "1 hour ago"
    },
    {
        id: 3,
        name: "HR & Analytics",
        description: "Employee demographics, performance reviews, and retention statistics.",
        status: "active",
        lastUpdated: "4 hours ago"
    },
    {
        id: 4,
        name: "Customer Support",
        description: "Ticket volumes, resolution times, and customer satisfaction scores.",
        status: "active",
        lastUpdated: "10 mins ago"
    },
    {
        id: 5,
        name: "Product Development",
        description: "Feature usage, roadmap progress, and user feedback analysis.",
        status: "maintenance",
        lastUpdated: "1 day ago"
    },
    {
        id: 6,
        name: "Marketing Campaigns",
        description: "Campaign ROI, ad spend optimization, and social media engagement.",
        status: "active",
        lastUpdated: "30 mins ago"
    }
];

const EndUserLanding = ({ onSelect }) => {
    return (
        <div className="landing-container">
            <div className="landing-header">
                <h1>Select a Data Domain</h1>
                <p>Choose a database to start analyzing insights with Agentic NLQ</p>
            </div>

            <div className="database-grid">
                {MOCK_DATABASES.map((db) => (
                    <div
                        key={db.id}
                        className="database-card"
                        onClick={() => onSelect(db)}
                    >
                        <div className="card-top">
                            <div className="card-icon-wrapper">
                                <Database size={24} />
                            </div>
                            <h3>{db.name}</h3>
                            <p>{db.description}</p>
                        </div>

                        <div className="card-footer">
                            <div className="status-indicator">
                                <div
                                    className="status-dot"
                                    style={{ backgroundColor: db.status === 'active' ? '#10b981' : '#f59e0b' }}
                                />
                                <span>{db.status === 'active' ? 'Online' : 'Maintenance'}</span>
                            </div>
                            <button className="select-btn">
                                Select <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EndUserLanding;
