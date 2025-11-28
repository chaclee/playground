import type { OKXResponse, Instrument, FundingRate, MarkPrice } from '../types/okx';

const OKX_BASE_URL = 'https://www.okx.com/api/v5';

/**
 * 获取所有 USDT 保证金永续合约列表
 */
export async function getSwapInstruments(): Promise<Instrument[]> {
    const response = await fetch(`${OKX_BASE_URL}/public/instruments?instType=SWAP`);

    if (!response.ok) {
        throw new Error(`获取合约列表失败: ${response.statusText}`);
    }

    const result: OKXResponse<Instrument> = await response.json();

    if (result.code !== '0') {
        throw new Error(`OKX API 错误: ${result.msg}`);
    }

    // 筛选 USDT 保证金的正向合约
    return result.data.filter(
        inst => inst.ctType === 'linear' && inst.settleCcy === 'USDT' && inst.state === 'live'
    );
}

/**
 * 获取单个合约的资金费率
 */
export async function getFundingRate(instId: string): Promise<FundingRate> {
    const response = await fetch(`${OKX_BASE_URL}/public/funding-rate?instId=${instId}`);

    if (!response.ok) {
        throw new Error(`获取资金费率失败 (${instId}): ${response.statusText}`);
    }

    const result: OKXResponse<FundingRate> = await response.json();

    if (result.code !== '0') {
        throw new Error(`OKX API 错误 (${instId}): ${result.msg}`);
    }

    if (!result.data || result.data.length === 0) {
        throw new Error(`未找到资金费率数据 (${instId})`);
    }

    return result.data[0];
}

/**
 * 获取标记价格（用于计算溢价率）
 */
export async function getMarkPrice(instId: string): Promise<MarkPrice> {
    const response = await fetch(`${OKX_BASE_URL}/public/mark-price?instType=SWAP&instId=${instId}`);

    if (!response.ok) {
        throw new Error(`获取标记价格失败 (${instId}): ${response.statusText}`);
    }

    const result: OKXResponse<MarkPrice> = await response.json();

    if (result.code !== '0') {
        throw new Error(`OKX API 错误 (${instId}): ${result.msg}`);
    }

    if (!result.data || result.data.length === 0) {
        throw new Error(`未找到标记价格数据 (${instId})`);
    }

    return result.data[0];
}

/**
 * 批量获取资金费率和标记价格
 * @param instIds 合约ID列表
 * @param batchSize 每批次数量
 * @param delayMs 批次间延迟时间（毫秒）
 */
export async function batchGetFundingRates(
    instIds: string[],
    batchSize: number = 20,
    delayMs: number = 200
): Promise<Map<string, { fundingRate: FundingRate; markPrice: MarkPrice }>> {
    const results = new Map<string, { fundingRate: FundingRate; markPrice: MarkPrice }>();

    // 分批处理
    for (let i = 0; i < instIds.length; i += batchSize) {
        const batch = instIds.slice(i, i + batchSize);

        // 并发请求当前批次
        const batchPromises = batch.map(async (instId) => {
            try {
                const [fundingRate, markPrice] = await Promise.all([
                    getFundingRate(instId),
                    getMarkPrice(instId),
                ]);

                return { instId, fundingRate, markPrice };
            } catch (error) {
                console.error(`获取 ${instId} 数据失败:`, error);
                return null;
            }
        });

        const batchResults = await Promise.all(batchPromises);

        // 收集成功的结果
        batchResults.forEach(result => {
            if (result) {
                results.set(result.instId, {
                    fundingRate: result.fundingRate,
                    markPrice: result.markPrice,
                });
            }
        });

        // 如果不是最后一批，等待一段时间再请求下一批
        if (i + batchSize < instIds.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return results;
}
