import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricalDataPoint } from '../types/okx';
import { formatPrice } from '../utils/calculations';

interface CoinChartModalProps {
    instId: string;
    baseCcy: string;
    currentPrice: number;
    currentRate: number;
    historicalData: HistoricalDataPoint[];
    onClose: () => void;
}

/**
 * 币种图表模态框
 */
export function CoinChartModal({
    instId,
    baseCcy,
    currentPrice,
    currentRate,
    historicalData,
    onClose,
}: CoinChartModalProps) {
    // 格式化时间显示
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    // 准备图表数据
    const chartData = historicalData.map(point => ({
        time: formatTime(point.timestamp),
        timestamp: point.timestamp,
        价格: point.markPrice,
        当前费率: point.currentRate,
        预测费率: point.nextRate,
    }));

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{baseCcy} 实时数据</h2>
                        <p className="text-sm text-gray-400">{instId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* 当前数据显示 */}
                <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-700 bg-gray-800/30">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">当前价格</div>
                        <div className="text-3xl font-bold text-blue-400">${formatPrice(currentPrice)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 mb-1">当前费率</div>
                        <div className={`text-3xl font-bold ${currentRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {currentRate.toFixed(4)}%
                        </div>
                    </div>
                </div>

                {/* 图表区域 */}
                <div className="p-6">
                    {chartData.length > 0 ? (
                        <>
                            {/* 价格图表 */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-white mb-4">价格走势</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#9CA3AF"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#9CA3AF"
                                            style={{ fontSize: '12px' }}
                                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                color: '#F3F4F6',
                                            }}
                                            formatter={(value: number) => [`$${value.toFixed(4)}`, '价格']}
                                        />
                                        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="价格"
                                            stroke="#60A5FA"
                                            strokeWidth={2}
                                            dot={false}
                                            animationDuration={300}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 费率图表 */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">费率走势</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#9CA3AF"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#9CA3AF"
                                            style={{ fontSize: '12px' }}
                                            tickFormatter={(value) => `${value.toFixed(4)}%`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                color: '#F3F4F6',
                                            }}
                                            formatter={(value: number) => [`${value.toFixed(4)}%`, '']}
                                        />
                                        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="当前费率"
                                            stroke="#34D399"
                                            strokeWidth={2}
                                            dot={false}
                                            animationDuration={300}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="预测费率"
                                            stroke="#FBBF24"
                                            strokeWidth={2}
                                            dot={false}
                                            strokeDasharray="5 5"
                                            animationDuration={300}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg">暂无历史数据</p>
                            <p className="text-sm mt-2">数据收集中，请稍候...</p>
                        </div>
                    )}
                </div>

                {/* 底部说明 */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-gray-500">
                        💡 提示：图表数据每次收到 WebSocket 推送时更新，最多显示最近 100 个数据点
                    </p>
                </div>
            </div>
        </div>
    );
}
