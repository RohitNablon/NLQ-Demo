/**
 * Enterprise Theme Constants
 * Premium dark theme color palette and design tokens for CXO presentations
 */

export const THEME_COLORS = {
    // Background Colors
    background: {
        primary: '#0A0E27',      // Deep navy - main background
        secondary: '#1A1F3A',    // Lighter navy - panel backgrounds
        tertiary: '#0F1524',     // Slightly lighter than primary
    },

    // Accent Colors
    accent: {
        primary: '#00D4FF',      // Electric blue - active/executing state
        secondary: '#FFB74D',    // Amber - warnings/alerts
        tertiary: '#66BB6A',     // Muted green - success/resolved
        purple: '#8B5CF6',       // Purple accent for variety
    },

    // Status Colors
    status: {
        idle: '#94a3b8',         // Slate gray
        executing: '#00D4FF',    // Electric blue
        completed: '#66BB6A',    // Muted green
        failed: '#FF4444',       // Crimson red
        warning: '#FFB74D',      // Amber
        danger: '#FF4444',       // Red
        success: '#66BB6A',      // Green
    },

    // Text Colors
    text: {
        primary: '#E8EDF7',      // Light blue-white - high contrast
        secondary: '#A0AEC0',    // Muted blue-gray - secondary info
        tertiary: '#64748b',     // Slate - least important
    },

    // Border Colors
    border: {
        default: '#2D3A5C',      // Subtle navy
        light: 'rgba(255, 255, 255, 0.05)',
        medium: 'rgba(255, 255, 255, 0.1)',
        heavy: 'rgba(255, 255, 255, 0.2)',
    },

    // Edge/Connection Colors
    edge: {
        normal: '#94a3b8',       // Default connection
        active: '#f59e0b',       // Active/executing connection
        completed: '#10b981',    // Completed connection
        low: '#66BB6A',          // Low risk
        medium: '#FFB74D',       // Medium risk
        high: '#FF4444',         // High risk
    },
}

export const TYPOGRAPHY = {
    fontFamily: {
        primary: 'Jost, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", "Courier New", monospace',
    },

    fontSize: {
        xs: '0.65rem',      // 10.4px
        sm: '0.75rem',      // 12px
        base: '0.875rem',   // 14px
        md: '0.95rem',      // 15.2px
        lg: '1rem',         // 16px
        xl: '1.125rem',     // 18px
        '2xl': '1.5rem',    // 24px
    },

    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },

    letterSpacing: {
        tight: '-0.5px',
        normal: '0',
        wide: '0.5px',
        wider: '0.08em',
    },
}

export const SPACING = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
}

export const BORDER_RADIUS = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
}

export const SHADOWS = {
    // Elevation system
    sm: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',

    // Glow effects
    glow: {
        blue: '0 0 20px rgba(0, 212, 255, 0.3)',
        blueLarge: '0 0 25px rgba(0, 212, 255, 0.4), 0 10px 20px -5px rgba(0,0,0,0.4)',
        amber: '0 0 20px rgba(255, 183, 77, 0.6)',
        green: '0 0 20px rgba(102, 187, 106, 0.6)',
        red: '0 0 20px rgba(239, 68, 68, 0.6)',
    },

    // Glass morphism
    glass: 'inset 0 0 20px rgba(0, 212, 255, 0.05)',
}

export const ANIMATIONS = {
    // Transition durations
    duration: {
        fast: '150ms',
        normal: '200ms',
        medium: '300ms',
        slow: '400ms',
        viewport: '500ms',
    },

    // Easing functions
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
}

export const GLASSMORPHISM = {
    background: 'rgba(255, 255, 255, 0.08)',
    backgroundDark: 'rgba(9, 9, 11, 0.75)',
    backgroundDarker: 'rgba(9, 9, 11, 0.85)',
    backdropBlur: 'blur(16px)',
    backdropBlurStrong: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

export const NODE_SIZES = {
    default: 60,
    primary: 80,      // For top-level/important agents
    small: 50,        // For tool nodes
}

export const EDGE_WEIGHTS = {
    thin: 1,          // Low activity (<3 connections)
    medium: 2,        // Normal (3-6 connections)
    thick: 4,         // High activity (>6 connections)
}

export const Z_INDEX = {
    background: 0,
    canvas: 1,
    controls: 10,
    panels: 20,
    header: 30,
    modal: 40,
    dropdown: 50,
    tooltip: 60,
}

// Badge icons mapping (for visual consistency)
export const BADGE_ICONS = {
    warning: '!',
    success: '✓',
    clock: '⏱',
    lock: '🔒',
    dollar: '$',
}
