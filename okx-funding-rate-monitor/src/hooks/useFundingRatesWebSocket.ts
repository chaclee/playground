import { useState, useEffect, useCallback, useRef } from 'react';
import { getSwapInstruments } from '../services/okx-api';
import { wsManager, MessageHandler } from '../services/okx-websocket';
import { calculateAnnualizedReturn, calculatePremium, formatCountdown } from '../utils/calculations';
import type { FundingRateDisplay, Instrument, FundingRate, MarkPrice, HistoricalDataPoint } from '../types/okx';

interface DataCache {
    instruments: Map<string, Instrument>;
    fundingRates: Map<string, FundingRate>;
    markPrices: Map<string, MarkPrice>;
    historicalData: Map<string, HistoricalDataPoint[]>;  // 历史数据
}

const MAX_HISTORY_POINTS = 100; // 每个币种最多保存100个历史点

/**
 * 使用 WebSocket 实时获取资金费率数据
 */
export function useFundingRatesWebSocket() {
    const [data, setData] = useState<FundingRateDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const cacheRef = useRef<DataCache>({
        instruments: new Map(),
        fundingRates: new Map(),
        markPrices: new Map(),
        historicalData: new Map(),
    });

    /**
     * 合并数据并计算显示值
     */
    const mergeAndCalculate = useCallback((): FundingRateDisplay[] => {
        const cache = cacheRef.current;
        const results: FundingRateDisplay[] = [];

        console.log('mergeAndCalculate 调用 - 缓存状态:', {
            instruments: cache.instruments.size,
            fundingRates: cache.fundingRates.size,
            markPrices: cache.markPrices.size,
        });

        cache.instruments.forEach((inst, instId) => {
            const fundingRate = cache.fundingRates.get(instId);
            const markPrice = cache.markPrices.get(instId);

            // 即使没有 fundingRate，也显示合约（使用默认值）
            // 解析资金费率数据
            const currentRateValue = fundingRate ? parseFloat(fundingRate.fundingRate || '0') : 0;
            const currentRate = currentRateValue * 100; // 转为百分比

            // 解析下次资金费率
            const nextRateValue = fundingRate
                ? parseFloat(fundingRate.nextFundingRate || fundingRate.fundingRate || '0')
                : 0;
            const nextRate = nextRateValue * 100;

            const nextFundingTime = fundingRate ? parseInt(fundingRate.fundingTime || '0') : 0;

            // 解析标记价格和指数价格
            const markPriceValue = markPrice ? parseFloat(markPrice.markPx || '0') : 0;
            const indexPriceValue = markPrice ? parseFloat(markPrice.idxPx || '0') : 0;

            // 计算年化收益率
            const annualizedReturn = calculateAnnualizedReturn(currentRateValue);

            // 计算溢价率
            const premium = markPrice ? calculatePremium(markPriceValue, indexPriceValue) : 0;

            const countdown = formatCountdown(nextFundingTime);

            results.push({
                instId: inst.instId,
                baseCcy: inst.ctValCcy || inst.baseCcy, // 使用 ctValCcy 作为币种
                currentRate,
                nextRate,
                annualizedReturn,
                premium,
                nextFundingTime,
                countdown,
                markPrice: markPriceValue,
                indexPrice: indexPriceValue,
            });
        });

        return results;
    }, []);

    /**
     * WebSocket 消息处理器
     */
    const handleWebSocketMessage: MessageHandler = useCallback((type, instId, data) => {
        const cache = cacheRef.current;

        if (type === 'funding-rate') {
            cache.fundingRates.set(instId, data);
        } else if (type === 'mark-price') {
            cache.markPrices.set(instId, data);
        }

        // 记录历史数据点
        const fundingRate = cache.fundingRates.get(instId);
        const markPrice = cache.markPrices.get(instId);

        if (fundingRate && markPrice) {
            const dataPoint: HistoricalDataPoint = {
                timestamp: Date.now(),
                markPrice: parseFloat(markPrice.markPx || '0'),
                currentRate: parseFloat(fundingRate.fundingRate || '0') * 100,
                nextRate: parseFloat(fundingRate.nextFundingRate || fundingRate.fundingRate || '0') * 100,
            };

            // 获取或创建该币种的历史数据数组
            const history = cache.historicalData.get(instId) || [];
            history.push(dataPoint);

            // 限制数组长度
            if (history.length > MAX_HISTORY_POINTS) {
                history.shift(); // 移除最旧的数据点
            }

            cache.historicalData.set(instId, history);
        }

        // 更新显示数据
        const newData = mergeAndCalculate();
        setData(newData);
    }, [mergeAndCalculate]);

    /**
     * 初始化和订阅
     */
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                setIsLoading(true);
                setError(null);

                // 1. 获取合约列表
                console.log('正在获取合约列表...');
                const instruments = await getSwapInstruments();

                if (!mounted) return;

                console.log(`获取到 ${instruments.length} 个 USDT 保证金永续合约`);

                // 打印前几个合约的完整数据，检查字段
                console.log('前 3 个合约的完整数据:', instruments.slice(0, 3));

                // 2. 缓存合约信息
                const cache = cacheRef.current;
                instruments.forEach(inst => {
                    cache.instruments.set(inst.instId, inst);
                });

                console.log(`已缓存 ${cache.instruments.size} 个合约信息`);
                console.log('前 3 个合约示例:', Array.from(cache.instruments.entries()).slice(0, 3).map(([id, inst]) => ({
                    instId: id,
                    baseCcy: inst.baseCcy,
                    ctType: inst.ctType,
                    settleCcy: inst.settleCcy,
                })));

                // 3. 连接 WebSocket
                console.log('正在连接 WebSocket...');
                await wsManager.connect();

                if (!mounted) return;

                // 4. 订阅资金费率和标记价格
                console.log('正在订阅频道...');
                const subscriptions = instruments.flatMap(inst => [
                    { channel: 'funding-rate' as const, instId: inst.instId },
                    { channel: 'mark-price' as const, instId: inst.instId },
                ]);

                // 分批订阅，避免一次订阅太多
                const batchSize = 100;
                for (let i = 0; i < subscriptions.length; i += batchSize) {
                    const batch = subscriptions.slice(i, i + batchSize);
                    await wsManager.subscribe(batch);

                    if (!mounted) return;

                    // 批次间延迟
                    if (i + batchSize < subscriptions.length) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }

                // 5. 添加消息处理器
                wsManager.addMessageHandler(handleWebSocketMessage);

                console.log('WebSocket 订阅完成');

                // 6. 生成初始显示数据（即使 WebSocket 数据还没到达）
                const initialData = mergeAndCalculate();
                console.log(`初始显示 ${initialData.length} 个合约`);
                console.log('前 3 条数据示例:', initialData.slice(0, 3));
                setData(initialData);

                setIsLoading(false);

            } catch (err) {
                if (!mounted) return;

                console.error('初始化失败:', err);
                setError(err instanceof Error ? err : new Error('初始化失败'));
                setIsLoading(false);
            }
        }

        init();

        // 清理
        return () => {
            mounted = false;
            wsManager.removeMessageHandler(handleWebSocketMessage);
            // 注意：不断开 WebSocket，允许其他组件复用
        };
    }, [handleWebSocketMessage]);

    return {
        data,
        isLoading,
        error,
        refetch: () => {
            // WebSocket 模式下，数据是实时的，不需要手动刷新
            console.log('WebSocket 模式下数据自动更新');
        },
        getHistoricalData: (instId: string): HistoricalDataPoint[] => {
            return cacheRef.current.historicalData.get(instId) || [];
        },
    };
}
