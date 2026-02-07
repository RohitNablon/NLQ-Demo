import React, { useState } from 'react';
import './MetadataTab.css';

const mockTables = [
    {
        name: 'Dim_Product',
        rows: 7263,
        columns: [
            { name: 'item_number', type: 'INTEGER', nullable: false, key: 'PK', default: '-' },
            { name: 'item_description', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'category', type: 'INTEGER', nullable: false, key: '', default: '-' },
            { name: 'category_name', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'pack', type: 'INTEGER', nullable: false, key: '', default: '-' },
            { name: 'bottle_volume_ml', type: 'INTEGER', nullable: false, key: '', default: '-' },
        ],
    },
    {
        name: 'Dim_Store',
        rows: 1882,
        columns: [
            { name: 'store_number', type: 'INTEGER', nullable: false, key: 'PK', default: '-' },
            { name: 'store_name', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'address', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'city', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'zip_code', type: 'INTEGER', nullable: false, key: '', default: '-' },
            { name: 'store_location', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'county_number', type: 'INTEGER', nullable: false, key: '', default: '-' },
            { name: 'county', type: 'TEXT', nullable: false, key: '', default: '-' },
        ],
    },
    {
        name: 'Dim_Vendor',
        rows: 265,
        columns: [
            { name: 'vendor_number', type: 'INTEGER', nullable: false, key: 'PK', default: '-' },
            { name: 'vendor_name', type: 'TEXT', nullable: false, key: '', default: '-' },
        ],
    },
    {
        name: 'Fact_Sales',
        rows: 12495974,
        columns: [
            { name: 'invoice_number', type: 'TEXT', nullable: false, key: 'PK', default: '-' },
            { name: 'store_number', type: 'INTEGER', nullable: false, key: 'FK', default: '-' },
            { name: 'item_number', type: 'INTEGER', nullable: false, key: 'FK', default: '-' },
            { name: 'vendor_number', type: 'INTEGER', nullable: false, key: 'FK', default: '-' },
            { name: 'Date', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'state_bottle_cost', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'state_bottle_retail', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'bottles_sold', type: 'INTEGER', nullable: false, key: '', default: '-' },
            { name: 'sale_amount', type: 'TEXT', nullable: false, key: '', default: '-' },
            { name: 'volume_sold_liters', type: 'FLOAT', nullable: false, key: '', default: '-' },
            { name: 'volume_sold_gallons', type: 'FLOAT', nullable: false, key: '', default: '-' },
        ],
    },
];

const MetadataTab = () => {
    const [expandedTables, setExpandedTables] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleTable = (tableName) => {
        setExpandedTables((prev) => ({
            ...prev,
            [tableName]: !prev[tableName],
        }));
    };

    const filteredTables = mockTables.filter((table) =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="metadata-tab">
            <div className="metadata-header">
                <h2 className="metadata-title">Database Schema</h2>
                <div className="metadata-search">
                    <input
                        type="text"
                        className="input"
                        placeholder="Search tables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="tables-list">
                {filteredTables.map((table) => (
                    <div
                        key={table.name}
                        className={`table-card ${expandedTables[table.name] ? 'expanded' : ''}`}
                    >
                        <div className="table-header" onClick={() => toggleTable(table.name)}>
                            <div className="table-info">
                                <div className="table-icon">T</div>
                                <div>
                                    <div className="table-name">{table.name}</div>
                                    <div className="table-stats">
                                        <span className="table-stat">{table.columns.length} columns</span>
                                        <span className="table-stat">{table.rows.toLocaleString()} rows</span>
                                    </div>
                                </div>
                            </div>
                            <span className="expand-icon">▼</span>
                        </div>

                        {expandedTables[table.name] && (
                            <div className="table-columns">
                                <div className="columns-header">
                                    <span className="column-header">Column</span>
                                    <span className="column-header">Type</span>
                                    <span className="column-header">Nullable</span>
                                    <span className="column-header">Default</span>
                                </div>
                                {table.columns.map((column) => (
                                    <div key={column.name} className="column-row">
                                        <div className="column-name">
                                            {column.name}
                                            {column.key === 'PK' && <span className="column-key">PK</span>}
                                            {column.key === 'FK' && <span className="column-key column-fk">FK</span>}
                                        </div>
                                        <div className="column-type">{column.type}</div>
                                        <div className="column-nullable">{column.nullable ? 'Yes' : 'No'}</div>
                                        <div className="column-default">{column.default}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MetadataTab;
