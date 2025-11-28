/**
 * OKX API 响应通用结构
 */
export interface OKXResponse<T> {
    code: string;
    msg: string;
    data: T[];
}

/**
 * 永续合约信息
 */
export interface Instrument {
    instType: string;        // 产品类型，SWAP
    instId: string;          // 产品ID，如 BTC-USDT-SWAP
    uly: string;             // 标的指数，如 BTC-USDT
    category: string;        // 手续费档位
    baseCcy: string;         // 交易货币，如 BTC
    quoteCcy: string;        // 计价货币，如 USDT
    settleCcy: string;       // 盈亏结算和保证金币种，如 USDT
    ctVal: string;           // 合约面值
    ctMult: string;          // 合约乘数
    ctValCcy: string;        // 合约面值计价币种
    optType: string;         // 期权类型
    stk: string;             // 行权价格
    listTime: string;        // 上线日期
    expTime: string;         // 下线日期
    lever: string;           // 最大杠杆倍数
    tickSz: string;          // 下单价格精度
    lotSz: string;           // 下单数量精度
    minSz: string;           // 最小下单数量
    ctType: string;          // 合约类型，linear: 正向合约, inverse: 反向合约
    alias: string;           // 合约日期别名
    state: string;           // 产品状态，live: 交易中
    maxLmtSz: string;        // 最大限价单数量
    maxMktSz: string;        // 最大市价单数量
    maxTwapSz: string;       // 最大时间加权单数量
    maxIcebergSz: string;    // 最大冰山单数量
    maxTriggerSz: string;    // 最大计划委托单数量
    maxStopSz: string;       // 最大止盈止损单数量
}

/**
 * 资金费率信息
 */
export interface FundingRate {
    instType: string;          // 产品类型，SWAP
    instId: string;            // 产品ID
    fundingRate: string;       // 当前资金费率
    nextFundingRate: string;   // 下次预计资金费率
    fundingTime: string;       // 当前资金费率结算时间，Unix时间戳的毫秒数格式
    nextFundingTime: string;   // 下次资金费率结算时间
    minFundingRate: string;    // 最小资金费率
    maxFundingRate: string;    // 最大资金费率
    markPx?: string;           // 标记价格（部分接口返回）
}

/**
 * 标记价格信息（用于计算溢价率）
 */
export interface MarkPrice {
    instType: string;
    instId: string;
    markPx: string;      // 标记价格
    idxPx: string;       // 指数价格
    ts: string;          // 数据产出时间
}

/**
 * 合并后的展示数据
 */
export interface FundingRateDisplay {
    instId: string;                  // 合约ID
    baseCcy: string;                 // 基础货币
    currentRate: number;             // 当前资金费率（百分比）
    nextRate: number;                // 下次资金费率（百分比）
    annualizedReturn: number;        // 年化收益率（百分比）
    premium: number;                 // 溢价率（百分比）
    nextFundingTime: number;         // 下次结算时间（时间戳）
    countdown: string;               // 倒计时（格式化后）
    markPrice: number;               // 标记价格
    indexPrice: number;              // 指数价格
}

/**
 * 历史数据点（用于图表）
 */
export interface HistoricalDataPoint {
    timestamp: number;               // 时间戳
    markPrice: number;               // 标记价格
    currentRate: number;             // 当前资金费率（百分比）
    nextRate: number;                // 下次资金费率（百分比）
}
