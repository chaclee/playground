import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { FundingRateDisplay } from '../types/okx';
import { formatPercentage, formatCountdown, formatPrice } from '../utils/calculations';
import clsx from 'clsx';

interface FundingRateTableProps {
    data: FundingRateDisplay[];
    onCoinClick: (coin: FundingRateDisplay) => void;
}

type SortField = keyof FundingRateDisplay;
type SortDirection = 'asc' | 'desc' | null;

/**
 * 资金费率表格组件
 */
export function FundingRateTable({ data, onCoinClick }: FundingRateTableProps) {
    const [sortField, setSortField] = useState<SortField>('annualizedReturn');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // 排序处理
    const sortedData = useMemo(() => {
        if (!sortDirection) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            let comparison = 0;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortField, sortDirection]);

    // 处理列排序
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // 切换排序方向：desc -> asc -> null -> desc
            if (sortDirection === 'desc') {
                setSortDirection('asc');
            } else if (sortDirection === 'asc') {
                setSortDirection(null);
            } else {
                setSortDirection('desc');
            }
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // 获取排序图标
    const getSortIcon = (field: SortField) => {
        if (sortField !== field || !sortDirection) {
            return <ArrowUpDown size={14} className="opacity-50" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={14} className="text-blue-400" />
            : <ArrowDown size={14} className="text-blue-400" />;
    };

    // 表头配置
    const columns: { field: SortField; label: string; className?: string }[] = [
        { field: 'baseCcy', label: '币种' },
        { field: 'markPrice', label: '当前价格' },
        { field: 'currentRate', label: '当前费率' },
        { field: 'nextRate', label: '预测费率' },
        { field: 'annualizedReturn', label: '年化收益' },
        { field: 'countdown', label: '下次结算' },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
                <thead>
                    <tr className="bg-gray-800/50 border-b border-gray-700">
                        {columns.map(({ field, label }) => (
                            <th
                                key={field}
                                onClick={() => handleSort(field)}
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-300 
                           cursor-pointer hover:bg-gray-700/50 transition-colors select-none"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>{label}</span>
                                    {getSortIcon(field)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item) => {
                        const countdown = formatCountdown(item.nextFundingTime);
                        const isHighYield = item.annualizedReturn > 50;
                        const isSuperHighYield = item.annualizedReturn > 100;

                        return (
                            <tr
                                key={item.instId}
                                onClick={() => onCoinClick(item)}
                                className="border-b border-gray-800 hover:bg-gray-700/50 transition-colors cursor-pointer group"
                            >
                                {/* 币种 */}
                                <td className="px-4 py-3">
                                    <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                                        {item.baseCcy}
                                    </span>
                                </td>

                                {/* 当前价格 */}
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm text-gray-100">
                                        ${formatPrice(item.markPrice)}
                                    </span>
                                </td>

                                {/* 当前费率 */}
                                <td className="px-4 py-3">
                                    <span
                                        className={clsx(
                                            'font-medium',
                                            item.currentRate > 0 ? 'text-green-400' : 'text-red-400'
                                        )}
                                    >
                                        {formatPercentage(item.currentRate, 4)}
                                    </span>
                                </td>

                                {/* 下次费率 */}
                                <td className="px-4 py-3">
                                    <span
                                        className={clsx(
                                            'font-medium',
                                            item.nextRate > 0 ? 'text-green-400' : 'text-red-400'
                                        )}
                                    >
                                        {formatPercentage(item.nextRate, 4)}
                                    </span>
                                </td>

                                {/* 年化收益 */}
                                <td className="px-4 py-3">
                                    <span
                                        className={clsx(
                                            'font-semibold',
                                            isSuperHighYield && 'text-red-400 font-bold',
                                            isHighYield && !isSuperHighYield && 'text-orange-400'
                                        )}
                                    >
                                        {formatPercentage(item.annualizedReturn, 2)}
                                    </span>
                                </td>

                                {/* 下次结算倒计时 */}
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm text-gray-300">{countdown}</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
