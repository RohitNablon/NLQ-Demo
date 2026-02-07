import React, { useState } from 'react';

const KPIDefinition = () => {
    const [kpis, setKpis] = useState([
        { id: 1, name: 'Total Revenue', logic: 'SUM(Fact_Sales.Amount)', description: 'Total sales revenue across all stores.' },
        { id: 2, name: 'Units Sold', logic: 'SUM(Fact_Sales.Quantity)', description: 'Total number of units sold.' },
        { id: 3, name: 'Footfall', logic: 'COUNT(Dim_Store.Visits)', description: 'Number of customers visiting stores.' },
    ]);

    return (
        <div className="kpi-container">
            <h3 className="section-title">Business Metrics</h3>
            <div className="table-wrapper">
                <table className="kpi-table">
                    <thead>
                        <tr>
                            <th>KPI Name</th>
                            <th>SQL Logic</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.map((kpi) => (
                            <tr key={kpi.id}>
                                <td>{kpi.name}</td>
                                <td className="code-font">{kpi.logic}</td>
                                <td>{kpi.description}</td>
                            </tr>
                        ))}
                        <tr className="add-row">
                            <td colSpan="3" className="add-btn-cell">+ Add New KPI</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KPIDefinition;
