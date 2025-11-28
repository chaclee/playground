import { useQuery } from '@tanstack/react-query';
import { getSwapInstruments } from '../services/okx-api';
import { calculateAnnualizedReturn, calculatePremium, formatCountdown } from '../utils/calculations';
import type { FundingRateDisplay, OKXResponse, FundingRate, MarkPrice } from '../types/okx';

const OKX_BASE_URL = 'https://www.okx.com/api/v5';

/**
 * 批量获取资金费率（简化版，只获取资金费率）
 */
async function batchGetAllFundingRates(
    instIds: string[],
    batchSize: number = 50
): Promise<Map<string, FundingRate>> {
    const results = new Map<string, FundingRate>();

    for (let i = 0; i < instIds.length; i += batchSize) {
        const batch = instIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (instId) => {
            try {
                const response = await fetch(`${OKX_BASE_URL}/public/funding-rate?instId=${instId}`);
                if (!response.ok) return null;

                const result: OKXResponse<FundingRate> = await response.json();
                if (result.code !== '0' || !result.data || result.data.length === 0) return null;

                return { instId, data: result.data[0] };
            } catch (error) {
                console.error(`获取 ${instId} 资金费率失败:`, error);
                return null;
            }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            if (result) {
                results.set(result.instId, result.data);
            }
        });

        // 批次间延迟
        if (i + batchSize < instIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * 批量获取标记价格
 */
async function batchGetMarkPrices(
    instIds: string[],
    batchSize: number = 50
): Promise<Map<string, MarkPrice>> {
    const results = new Map<string, MarkPrice>();

    for (let i = 0; i < instIds.length; i += batchSize) {
        const batch = instIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (instId) => {
            try {
                const response = await fetch(`${OKX_BASE_URL}/public/mark-price?instType=SWAP&instId=${instId}`);
                if (!response.ok) return null;

                const result: OKXResponse<MarkPrice> = await response.json();
                if (result.code !== '0' || !result.data || result.data.length === 0) return null;

                return { instId, data: result.data[0] };
            } catch (error) {
                console.error(`获取 ${instId} 标记价格失败:`, error);
                return null;
            }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            if (result) {
                results.set(result.instId, result.data);
            }
        });

        // 批次间延迟
        if (i + batchSize < instIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * 使用 React Query 获取并处理资金费率数据
 */
export function useFundingRates() {
    return useQuery({
        queryKey: ['fundingRates'],
        queryFn: async (): Promise<FundingRateDisplay[]> => {
            // 1. 获取所有 USDT 保证金永续合约
            const instruments = await getSwapInstruments();

            console.log(`获取到 ${instruments.length} 个 USDT 保证金永续合约`);

            // 2. 批量获取资金费率和标记价格
            const instIds = instruments.map(inst => inst.instId);
            const [ratesMap, pricesMap] = await Promise.all([
                batchGetAllFundingRates(instIds, 50),
                batchGetMarkPrices(instIds, 50),
            ]);

            console.log(`成功获取 ${ratesMap.size} 个资金费率, ${pricesMap.size} 个标记价格`);

            // 3. 合并数据并计算
            const results: FundingRateDisplay[] = [];

            for (const inst of instruments) {
                const fundingRate = ratesMap.get(inst.instId);
                const markPrice = pricesMap.get(inst.instId);

                if (!fundingRate) {
                    continue;
                }

                // 解析资金费率数据
                const currentRateValue = parseFloat(fundingRate.fundingRate || '0');
                const currentRate = currentRateValue * 100; // 转为百分比

                // 解析下次资金费率（如果有）
                const nextRateValue = parseFloat(fundingRate.nextFundingRate || fundingRate.fundingRate || '0');
                const nextRate = nextRateValue * 100;

                const nextFundingTime = parseInt(fundingRate.fundingTime || '0');

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
                    baseCcy: inst.baseCcy,
                    currentRate,
                    nextRate,
                    annualizedReturn,
                    premium,
                    nextFundingTime,
                    countdown,
                    markPrice: markPriceValue,
                    indexPrice: indexPriceValue,
                });
            }

            console.log(`成功处理 ${results.length} 个合约的数据`);

            return results;
        },
        // 每 60 秒自动刷新
        refetchInterval: 60000,
        // 启用后台自动刷新
        refetchIntervalInBackground: false,
        // 窗口重新获得焦点时刷新
        refetchOnWindowFocus: true,
        // 保留之前的数据，避免闪烁
        placeholderData: (previousData) => previousData,
        // 重试配置
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
