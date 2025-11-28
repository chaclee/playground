/**
 * 计算年化收益率
 * 公式：年化收益率 = 当前资金费率 × 3 × 365 × 100
 * @param fundingRate 当前资金费率（小数形式）
 * @returns 年化收益率（百分比）
 */
export function calculateAnnualizedReturn(fundingRate: number): number {
    return fundingRate * 3 * 365 * 100;
}

/**
 * 计算溢价率
 * 公式：溢价率 = (标记价格 - 指数价格) / 指数价格 × 100%
 * @param markPrice 标记价格
 * @param indexPrice 指数价格
 * @returns 溢价率（百分比）
 */
export function calculatePremium(markPrice: number, indexPrice: number): number {
    if (indexPrice === 0) return 0;
    return ((markPrice - indexPrice) / indexPrice) * 100;
}

/**
 * 格式化倒计时
 * @param timestamp 目标时间戳（毫秒）
 * @returns 格式化的倒计时字符串 (hh:mm:ss)
 */
export function formatCountdown(timestamp: number): string {
    const now = Date.now();
    const diff = timestamp - now;

    if (diff <= 0) {
        return '00:00:00';
    }

    const seconds = Math.floor(diff / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
        .map(n => String(n).padStart(2, '0'))
        .join(':');
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 将百分比数字格式化为字符串
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    return value.toFixed(decimals) + '%';
}

/**
 * 格式化价格显示
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
    if (price >= 1000) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else if (price >= 0.01) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    } else {
        return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 });
    }
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
export async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}
