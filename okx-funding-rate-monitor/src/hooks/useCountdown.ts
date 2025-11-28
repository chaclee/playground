import { useState, useEffect } from 'react';

/**
 * 倒计时 hook
 * @param targetTime 目标时间戳（毫秒）
 * @param onComplete 倒计时完成时的回调
 */
export function useCountdown(targetTime: number, onComplete?: () => void) {
    const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = targetTime - Date.now();

            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(timer);
                onComplete?.();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime, onComplete]);

    return timeLeft;
}

/**
 * 刷新倒计时 hook（用于显示距离下次自动刷新的时间）
 * @param intervalMs 刷新间隔（毫秒）
 */
export function useRefreshCountdown(intervalMs: number = 60000) {
    const [countdown, setCountdown] = useState(intervalMs);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = Date.now() - lastRefreshTime;
            const remaining = intervalMs - elapsed;

            if (remaining <= 0) {
                setCountdown(intervalMs);
                setLastRefreshTime(Date.now());
            } else {
                setCountdown(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [intervalMs, lastRefreshTime]);

    const reset = () => {
        setLastRefreshTime(Date.now());
        setCountdown(intervalMs);
    };

    return { countdown, reset };
}
