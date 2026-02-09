import { Box, Typography, Collapse } from '@mui/material'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    TrendingUp,
    AlertTriangle,
    Package,
    Database,
    FileText,
    Target,
    AlertCircle,
    Shield,
    ShieldCheck,
    ArrowUpRight,
    DollarSign,
    BarChart3,
    PieChart
} from 'lucide-react'

interface ExecutiveMessageProps {
    content: string
}

export default function ExecutiveMessage({ content }: ExecutiveMessageProps) {
    const [thinkingExpanded, setThinkingExpanded] = useState(false)

    console.log('📝 Markdown content received:', content?.substring(0, 150) || 'EMPTY')

    // Detect icon based on header text with enhanced mappings
    const getIconForHeader = (text: string) => {
        const lower = text.toLowerCase()
        if (lower.includes('security') || lower.includes('compliance')) return ShieldCheck
        if (lower.includes('growth') || lower.includes('success') || lower.includes('improvement')) return TrendingUp
        if (lower.includes('alert') || lower.includes('critical') || lower.includes('warning')) return AlertTriangle
        if (lower.includes('financial') || lower.includes('revenue') || lower.includes('money')) return DollarSign
        if (lower.includes('analytic') || lower.includes('metric') || lower.includes('kpi')) return BarChart3
        if (lower.includes('overview') || lower.includes('risk')) return PieChart
        if (lower.includes('product') || lower.includes('category')) return Package
        if (lower.includes('data') || lower.includes('intelligence')) return Database
        if (lower.includes('output') || lower.includes('format') || lower.includes('narrative')) return FileText
        if (lower.includes('indicator') || lower.includes('submission')) return Target
        if (lower.includes('audit')) return AlertCircle
        return FileText
    }

    // Detect semantic color based on content markers
    const getSemanticColor = (text: string): string | null => {
        const lower = text.toLowerCase()

        // Red indicators (critical, high-risk, failure)
        if (text.includes('🔴') ||
            lower.includes('critical') ||
            lower.includes('high risk') ||
            lower.includes('alert') ||
            lower.includes('failure') ||
            lower.includes('⚠️ critical')) {
            return '#FF4444'
        }

        // Green indicators (success, low-risk, approved)
        if (text.includes('🟢') ||
            text.includes('✅') ||
            lower.includes('success') ||
            lower.includes('approved') ||
            lower.includes('low risk')) {
            return '#66BB6A'
        }

        // Amber/Yellow indicators (pending, medium-risk, warning)
        if (text.includes('🟡') ||
            text.includes('⚠️') ||
            lower.includes('pending') ||
            lower.includes('medium risk') ||
            lower.includes('warning')) {
            return '#FFB74D'
        }

        return null
    }

    return (
        <Box sx={{
            maxWidth: '100%',
            bgcolor: 'rgba(26, 31, 58, 0.6)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 212, 255, 0.15)',
        }}>
            {/* Thinking Process Header */}
            <Box
                onClick={() => setThinkingExpanded(!thinkingExpanded)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: 'rgba(255, 105, 180, 0.08)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    '&:hover': { bgcolor: 'rgba(255, 105, 180, 0.12)' }
                }}
            >
                {thinkingExpanded ? <ChevronUp size={14} color="rgba(255, 105, 180, 0.8)" /> : <ChevronDown size={14} color="rgba(255, 105, 180, 0.8)" />}
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF69B4' }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                    Thinking Process (4 steps)
                </Typography>
            </Box>

            <Collapse in={thinkingExpanded}>
                <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    {['Analyzed query context', 'Executed agent workflow', 'Aggregated results', 'Formatted response'].map((step, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <CheckCircle2 size={12} color="#66BB6A" />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem' }}>
                                {step}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Collapse>

            {/* Markdown Content with Custom Styling */}
            <Box sx={{
                borderLeft: '3px solid #00D4FF',
                pl: 2.5,
                pr: 2.5,
                py: 2.5,
                color: '#e5e7eb', // Ensure default text is light
                '& h1, & h3, & h4, & h5, & h6': {
                    color: '#e5e7eb',
                    fontWeight: 600,
                    mt: 2,
                    mb: 1
                }
            }}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // H2 Headers with Icons
                        h2: ({ children }) => {
                            const text = String(children)
                            const Icon = getIconForHeader(text)
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                                    <Icon size={18} color="#00D4FF" />
                                    <Typography sx={{
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        color: '#00D4FF',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {children}
                                    </Typography>
                                </Box>
                            )
                        },

                        // Ordered Lists (Numbered) - Card Style
                        ol: ({ children }) => (
                            <Box component="ol" sx={{
                                listStyle: 'none',
                                p: 0,
                                m: 0,
                                mb: 3,
                                counterReset: 'item'
                            }}>
                                {children}
                            </Box>
                        ),

                        // List Items - Card Design
                        li: ({ children, ordered }) => {
                            if (ordered) {
                                return (
                                    <Box component="li" sx={{
                                        display: 'flex',
                                        gap: 1.5,
                                        mb: 1.5,
                                        p: 1.5,
                                        bgcolor: 'rgba(0, 212, 255, 0.04)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 212, 255, 0.12)',
                                        counterIncrement: 'item',
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 212, 255, 0.08)',
                                            borderColor: 'rgba(0, 212, 255, 0.25)',
                                        },
                                        '&::before': {
                                            content: 'counter(item)',
                                            minWidth: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(0, 212, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            color: '#00D4FF',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            marginTop: '2px'
                                        }
                                    }}>
                                        <Box sx={{
                                            flex: 1,
                                            '& > p': { margin: 0 },
                                            '& strong:first-of-type': {
                                                color: '#00D4FF',
                                                fontWeight: 600
                                            }
                                        }}>
                                            {children}
                                        </Box>
                                    </Box>
                                )
                            }
                            // Unordered list items with semantic coloring
                            const text = String(children)
                            const semanticColor = getSemanticColor(text)
                            const bulletColor = semanticColor || '#00D4FF'

                            return (
                                <Box component="li" sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'flex-start',
                                    mb: 0.5,
                                    '&::before': {
                                        content: '""',
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: bulletColor,
                                        marginTop: '8px',
                                        flexShrink: 0
                                    }
                                }}>
                                    <Typography component="span" sx={{
                                        color: semanticColor || '#cbd5e1',
                                        fontSize: '0.82rem',
                                        lineHeight: 1.6,
                                        '& strong': {
                                            color: semanticColor || '#00D4FF',
                                            fontWeight: 600
                                        }
                                    }}>
                                        {children}
                                    </Typography>
                                </Box>
                            )
                        },

                        // Unordered Lists
                        ul: ({ children }) => (
                            <Box component="ul" sx={{
                                listStyle: 'none',
                                p: 0,
                                m: 0,
                                ml: 1,
                                mb: 2
                            }}>
                                {children}
                            </Box>
                        ),

                        // Tables - CXO Style
                        table: ({ children }) => (
                            <Box sx={{ mb: 3, overflowX: 'auto' }}>
                                <Box component="table" sx={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '6px',
                                    overflow: 'hidden'
                                }}>
                                    {children}
                                </Box>
                            </Box>
                        ),

                        thead: ({ children }) => (
                            <Box component="thead" sx={{ bgcolor: 'rgba(0, 212, 255, 0.08)' }}>
                                {children}
                            </Box>
                        ),

                        th: ({ children }) => (
                            <Box component="th" sx={{
                                p: 1.2,
                                borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
                                textAlign: 'left'
                            }}>
                                <Typography sx={{
                                    color: '#00D4FF',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {children}
                                </Typography>
                            </Box>
                        ),

                        td: ({ children }) => {
                            const text = String(children)
                            const isStatus = text.match(/high|medium|low/i)
                            const statusColor = text.toLowerCase().includes('high') ? '#FF4444' :
                                text.toLowerCase().includes('medium') ? '#FFB74D' : '#66BB6A'

                            return (
                                <Box component="td" sx={{
                                    p: 1.2,
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        {isStatus && (
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: statusColor,
                                                flexShrink: 0
                                            }} />
                                        )}
                                        <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>
                                            {children}
                                        </Typography>
                                    </Box>
                                </Box>
                            )
                        },

                        // Paragraphs with semantic color support
                        p: ({ children }) => {
                            const text = String(children)
                            const semanticColor = getSemanticColor(text)

                            return (
                                <Typography sx={{
                                    color: semanticColor || '#e5e7eb',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.7,
                                    mb: 1.5,
                                    '& strong': {
                                        color: semanticColor || '#00D4FF',
                                        fontWeight: 600
                                    }
                                }}>
                                    {children}
                                </Typography>
                            )
                        },

                        // Code blocks
                        code: ({ inline, children }) => (
                            inline ? (
                                <Box component="code" sx={{
                                    bgcolor: 'rgba(0, 212, 255, 0.1)',
                                    color: '#00D4FF',
                                    px: 0.8,
                                    py: 0.3,
                                    borderRadius: '4px',
                                    fontSize: '0.85em',
                                    fontFamily: 'monospace'
                                }}>
                                    {children}
                                </Box>
                            ) : (
                                <Box component="pre" sx={{
                                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                                    p: 2,
                                    borderRadius: '6px',
                                    overflow: 'auto',
                                    mb: 2
                                }}>
                                    <Box component="code" sx={{
                                        color: '#e5e7eb',
                                        fontSize: '0.85rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {children}
                                    </Box>
                                </Box>
                            )
                        ),

                        // Strong (Bold) - Electric Blue for labels
                        strong: ({ children }) => (
                            <Box component="strong" sx={{
                                color: '#00D4FF',
                                fontWeight: 600
                            }}>
                                {children}
                            </Box>
                        ),

                        // Blockquotes
                        blockquote: ({ children }) => (
                            <Box sx={{
                                borderLeft: '3px solid #00D4FF',
                                pl: 2,
                                py: 0.5,
                                mb: 2,
                                fontStyle: 'italic',
                                color: '#cbd5e1'
                            }}>
                                {children}
                            </Box>
                        )
                    }}
                >
                    {content || 'No content available'}
                </ReactMarkdown>
            </Box>
        </Box>
    )
}
