import React from 'react';
import { ArrowUpRight, TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';

const insights = [
    { id: 1, question: "Show me the top 5 performing plants by efficiency", icon: <TrendingUp size={24} />, category: "Performance" },
    { id: 2, question: "Compare revenue across all regions for Q3", icon: <BarChart2 size={24} />, category: "Sales" },
    { id: 3, question: "Identify stores with declining footfall", icon: <Activity size={24} />, category: "Operations" },
    { id: 4, question: "What is the average transaction value by customer segment?", icon: <PieChart size={24} />, category: "Customer" },
    { id: 5, question: "List products with inventory turnover < 4", icon: <ArrowUpRight size={24} />, category: "Inventory" },
    { id: 6, question: "Forecast sales for the next month based on historical data", icon: <TrendingUp size={24} />, category: "Forecast" },
    { id: 7, question: "Which marketing campaign had the highest ROI?", icon: <BarChart2 size={24} />, category: "Marketing" },
    { id: 8, question: "Show employee retention rates by department", icon: <Activity size={24} />, category: "HR" },
    { id: 9, question: "Analyze maintenance costs per equipment type", icon: <PieChart size={24} />, category: "Maintenance" },
    { id: 10, question: "Who are the top 10 suppliers by spend?", icon: <ArrowUpRight size={24} />, category: "Supply Chain" },
];

const InsightGrid = ({ onSelect, questions }) => {
    // Map JSON questions to valid insight objects
    const displayInsights = questions && questions.length > 0
        ? questions.map((q, index) => ({
            id: index,
            question: q.Question,
            // Cycle through icons/categories for variety
            icon: [
                <TrendingUp size={24} />,
                <BarChart2 size={24} />,
                <PieChart size={24} />,
                <Activity size={24} />,
                <ArrowUpRight size={24} />
            ][index % 5],
            category: ["Sales", "Performance", "Inventory", "Operations", "Analysis"][index % 5]
        }))
        : insights; // Fallback to hardcoded if no data

    return (
        <div className="insight-grid-container">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Synthesized Insights</h2>
            <div className="insight-grid">
                {displayInsights.map((item) => (
                    <div className="insight-card" key={item.id} onClick={() => onSelect(item.question)}>
                        <div className="insight-icon">{item.icon}</div>
                        <p className="insight-question">{item.question}</p>
                        <div className="card-hover-effect"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InsightGrid;
