import React from 'react';
import {
    Bot,
    Database,
    Search,
    PenTool,
    Code,
    BarChart,
    MessageSquare,
    Globe,
    FileText,
    User,
    Cpu,
    Eye,
    Wrench,
    Lightbulb,
    Download
} from 'lucide-react';

// Map of icon names to Lucide components
const ICON_MAP = {
    Bot,
    Database,
    Search,
    PenTool,
    Code,
    BarChart,
    MessageSquare,
    Globe,
    FileText,
    User,
    Cpu,
    Eye,
    Wrench,
    Lightbulb,
    Download,
    // Add aliases/fallbacks
    "SmartToy": Bot,
    "Functions": Wrench
};

// Wrapper to make Lucide icons compatible with MUI SvgIcon usage patterns if needed,
// or just use them directly.
export const IconMapper = ({ iconName, size = 20, ...props }) => {
    const IconComponent = ICON_MAP[iconName] || Bot; // Default to Bot

    return <IconComponent size={size} {...props} />;
};

export default IconMapper;
