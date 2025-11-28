import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Wifi } from 'lucide-react';
import { useFundingRatesWebSocket } from './hooks/useFundingRatesWebSocket';
import { FundingRateTable } from './components/FundingRateTable';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import { CoinChartModal } from './components/CoinChartModal';
import type { FundingRateDisplay } from './types/okx';

function App() {
    const { data, isLoading, error, refetch, getHistoricalData } = useFundingRatesWebSocket();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState<FundingRateDisplay | null>(null);

    // 处理深色模式
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // 监听数据变化（调试用，可移除）
    /*
    useEffect(() => {
        console.log('App 收到数据更新:', {
            dataLength: data?.length || 0,
            isLoading,
            hasError: !!error,
            first3: data?.slice(0, 3).map(d => ({ instId: d.instId, baseCcy: d.baseCcy })),
        });
    }, [data, isLoading, error]);
    */

    // 手动刷新（WebSocket 模式下实际不需要）
    const handleRefresh = () => {
        refetch();
    };

    // 处理币种点击
    const handleCoinClick = (coin: FundingRateDisplay) => {
        setSelectedCoin(coin);
    };

    // 关闭模态框
    const handleCloseModal = () => {
        setSelectedCoin(null);
    };

    // 获取当前选中币种的最新数据（如果 data 更新了，selectedCoin 也应该更新显示）
    const currentSelectedCoin = selectedCoin
        ? data?.find(d => d.instId === selectedCoin.instId) || selectedCoin
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-8 max-w-[1600px]">
                {/* 头部 */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* 标题 */}
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
                               bg-clip-text text-transparent">
                                    OKX 资金费率监控
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    实时追踪 USDT 永续合约套利机会
                                </p>
                            </div>
                        </div>

                        {/* 控制按钮 */}
                        <div className="flex items-center space-x-4">
                            {/* WebSocket 状态 */}
                            <div className="flex items-center space-x-2 text-sm">
                                <Wifi size={16} className="text-green-400" />
                                <span className="text-gray-300">实时连接</span>
                            </div>

                            {/* 手动刷新按钮 */}
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                           disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg 
                           transition-colors duration-200 font-medium"
                            >
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                <span>重连</span>
                            </button>
                        </div>
                    </div>

                    {/* 统计信息 */}
                    {data && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="text-sm text-gray-400 mb-1">总合约数</div>
                                <div className="text-2xl font-bold text-blue-400">{data.length}</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="text-sm text-gray-400 mb-1">高收益 (&gt;50%)</div>
                                <div className="text-2xl font-bold text-orange-400">
                                    {data.filter(d => d.annualizedReturn > 50).length}
                                </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="text-sm text-gray-400 mb-1">超高收益 (&gt;100%)</div>
                                <div className="text-2xl font-bold text-red-400">
                                    {data.filter(d => d.annualizedReturn > 100).length}
                                </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="text-sm text-gray-400 mb-1">最高年化</div>
                                <div className="text-2xl font-bold text-green-400">
                                    {data.length > 0 ? Math.max(...data.map(d => d.annualizedReturn)).toFixed(2) : '0.00'}%
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* 主内容 */}
                <main className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
                    {isLoading && !data && <LoadingSkeleton />}

                    {error && (
                        <ErrorMessage
                            message={error.message || '获取数据失败，请稍后重试'}
                            onRetry={handleRefresh}
                        />
                    )}

                    {data && data.length > 0 && (
                        <FundingRateTable
                            data={data}
                            onCoinClick={handleCoinClick}
                        />
                    )}

                    {data && data.length === 0 && (
                        <div className="text-center text-gray-400 py-12">
                            暂无数据
                        </div>
                    )}
                </main>

                {/* 页脚说明 */}
                <footer className="mt-8 text-center text-sm text-gray-500">
                    <p>数据来源: OKX WebSocket API（实时推送）</p>
                    <p className="mt-2">
                        <span className="text-orange-400">橙色</span> = 年化 &gt; 50% |
                        <span className="text-red-400 ml-2">红色加粗</span> = 年化 &gt; 100% |
                        <span className="text-green-400 ml-2">绿色</span> = 正费率 |
                        <span className="text-red-400 ml-2">红色</span> = 负费率
                    </p>
                </footer>
            </div>

            {/* 图表模态框 */}
            {currentSelectedCoin && (
                <CoinChartModal
                    instId={currentSelectedCoin.instId}
                    baseCcy={currentSelectedCoin.baseCcy}
                    currentPrice={currentSelectedCoin.markPrice}
                    currentRate={currentSelectedCoin.currentRate}
                    historicalData={getHistoricalData(currentSelectedCoin.instId)}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default App;
