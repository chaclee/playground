const WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';
const PING_INTERVAL = 20000; // 20 秒发送一次 ping
const RECONNECT_DELAY = 3000; // 重连延迟 3 秒

export type WebSocketMessageType = 'funding-rate' | 'mark-price';

export interface WebSocketMessage {
    arg: {
        channel: string;
        instId: string;
    };
    data: any[];
}

export interface WebSocketSubscription {
    channel: 'funding-rate' | 'mark-price';
    instId: string;
}

export type MessageHandler = (type: WebSocketMessageType, instId: string, data: any) => void;

/**
 * OKX WebSocket 连接管理器
 */
export class OKXWebSocketManager {
    private ws: WebSocket | null = null;
    private pingInterval: number | null = null;
    private reconnectTimeout: number | null = null;
    private messageHandlers: Set<MessageHandler> = new Set();
    private subscriptions: Set<string> = new Set();
    private isConnecting = false;
    private shouldReconnect = true;

    /**
     * 连接到 WebSocket 服务器
     */
    connect(): Promise<void> {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        if (this.isConnecting) {
            return new Promise((resolve) => {
                const checkConnection = setInterval(() => {
                    if (this.ws?.readyState === WebSocket.OPEN) {
                        clearInterval(checkConnection);
                        resolve();
                    }
                }, 100);
            });
        }

        this.isConnecting = true;

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(WS_URL);

                this.ws.onopen = () => {
                    console.log('WebSocket 连接已建立');
                    this.isConnecting = false;
                    this.startPing();

                    // 重新订阅之前的频道
                    this.resubscribe();

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket 错误:', error);
                    this.isConnecting = false;
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket 连接已关闭');
                    this.isConnecting = false;
                    this.stopPing();

                    if (this.shouldReconnect) {
                        this.scheduleReconnect();
                    }
                };
            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    /**
     * 订阅频道
     */
    async subscribe(subscriptions: WebSocketSubscription[]): Promise<void> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.log('WebSocket 未连接，正在建立连接...');
            await this.connect();
        }

        // 再次确认连接状态
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket 连接失败，无法订阅');
        }

        const args = subscriptions.map(sub => ({
            channel: sub.channel,
            instId: sub.instId,
        }));

        const message = {
            op: 'subscribe',
            args,
        };

        const messageStr = JSON.stringify(message);
        console.log(`发送订阅消息 (${subscriptions.length} 个频道):`, messageStr);

        this.ws.send(messageStr);

        // 记录订阅
        subscriptions.forEach(sub => {
            this.subscriptions.add(`${sub.channel}:${sub.instId}`);
        });

        console.log(`✓ 已发送订阅请求: ${subscriptions.length} 个频道`);
    }

    /**
     * 取消订阅频道
     */
    async unsubscribe(subscriptions: WebSocketSubscription[]): Promise<void> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const args = subscriptions.map(sub => ({
            channel: sub.channel,
            instId: sub.instId,
        }));

        const message = {
            op: 'unsubscribe',
            args,
        };

        this.ws.send(JSON.stringify(message));

        // 移除订阅记录
        subscriptions.forEach(sub => {
            this.subscriptions.delete(`${sub.channel}:${sub.instId}`);
        });

        console.log(`已取消订阅 ${subscriptions.length} 个频道`);
    }

    /**
     * 添加消息处理器
     */
    addMessageHandler(handler: MessageHandler): void {
        this.messageHandlers.add(handler);
    }

    /**
     * 移除消息处理器
     */
    removeMessageHandler(handler: MessageHandler): void {
        this.messageHandlers.delete(handler);
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.shouldReconnect = false;
        this.stopPing();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.subscriptions.clear();
    }

    /**
     * 处理接收到的消息
     */
    private handleMessage(data: string): void {
        // 处理 pong
        if (data === 'pong') {
            return;
        }

        try {
            const message = JSON.parse(data);

            // 处理订阅确认（不再详细打印）
            if (message.event === 'subscribe') {
                // 静默处理订阅确认
                return;
            }

            // 处理错误
            if (message.event === 'error') {
                console.error('✗ WebSocket 错误:', message);
                return;
            }

            // 处理数据推送
            if (message.arg && message.data) {
                const { channel, instId } = message.arg;
                const messageType = channel as WebSocketMessageType;

                // 只在收到第一条数据时打印日志
                if (this.messageHandlers.size > 0) {
                    // console.log(`收到数据推送 [${channel}] ${instId}`);
                }

                message.data.forEach((item: any) => {
                    this.messageHandlers.forEach(handler => {
                        handler(messageType, instId, item);
                    });
                });
            }
        } catch (error) {
            console.error('解析 WebSocket 消息失败:', error, '原始数据:', data);
        }
    }

    /**
     * 启动心跳
     */
    private startPing(): void {
        this.stopPing();

        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
            }
        }, PING_INTERVAL);
    }

    /**
     * 停止心跳
     */
    private stopPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * 计划重连
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimeout) {
            return;
        }

        console.log(`将在 ${RECONNECT_DELAY / 1000} 秒后重连...`);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect().catch(error => {
                console.error('重连失败:', error);
            });
        }, RECONNECT_DELAY);
    }

    /**
     * 重新订阅所有频道
     */
    private resubscribe(): void {
        if (this.subscriptions.size === 0) {
            return;
        }

        const subscriptions: WebSocketSubscription[] = [];
        this.subscriptions.forEach(sub => {
            const [channel, instId] = sub.split(':');
            subscriptions.push({
                channel: channel as 'funding-rate' | 'mark-price',
                instId,
            });
        });

        // 清除订阅记录，subscribe 会重新添加
        this.subscriptions.clear();

        // 延迟订阅，确保连接稳定
        setTimeout(() => {
            this.subscribe(subscriptions).catch(error => {
                console.error('重新订阅失败:', error);
            });
        }, 100);
    }
}

// 导出单例
export const wsManager = new OKXWebSocketManager();
