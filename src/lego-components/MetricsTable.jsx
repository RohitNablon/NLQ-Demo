import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { ArrowUpDown } from 'lucide-react';

/**
 * Enhanced table with sorting and filtering capabilities
 * Used for technical data displays
 */
export function MetricsTable({
    columns,
    data,
    className,
    rowClassName
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (columnKey) => {
        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnKey, direction });
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [data, sortConfig]);

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider',
                                    column.sortable && 'cursor-pointer hover:text-gray-300'
                                )}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {column.label}
                                    {column.sortable && <ArrowUpDown className="w-3 h-3" />}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {sortedData.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className={cn(
                                'hover:bg-white/5 transition-colors',
                                rowClassName
                            )}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap"
                                >
                                    {column.render
                                        ? column.render(row[column.key], row)
                                        : row[column.key]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
