import WebSocket, { type RawData } from 'ws';

export class AnbotWsClient {
    private readonly url: string;
    private ws: WebSocket | null = null;

    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = Infinity;
    private readonly baseReconnectDelayMs = 1000;
    private readonly maxReconnectDelayMs = 30_000;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private shouldReconnect = true;

    constructor(url: string) {
        this.url = url;
        this.connect();
    }

    private connect(): void {
        const ws = new WebSocket(this.url);
        this.ws = ws;

        ws.on('open', () => this.onOpen());
        ws.on('message', (data) => this.onMessage(data));
        ws.on('close', () => this.onClose());
        ws.on('error', (err) => this.onError(err));
        ws.on('pong', () => this.onPong());
    }

    private onOpen(): void {
        console.log('client connected');
        this.reconnectAttempts = 0;
        // this.send('hello ws from ts');
    }

    private onMessage(data: RawData): void {
        const msg = data.toString();
        try {
            if (msg === 'ping') {
                this.send('pong');
                console.log('心跳', msg, Date.now());
            } else {
                console.log('非心跳', msg);
            }
        } catch { }
    }

    private onClose(): void {
        console.log('connection closed');
        this.scheduleReconnect();
    }

    private onError(err: Error): void {
        console.error('client error', err);
    }

    private onPong(): void {
        console.log('接收pong');
    }

    private scheduleReconnect(): void {
        if (!this.shouldReconnect || this.reconnectTimer) {
            return;
        }
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('达到最大重连次数，停止重连');
            return;
        }

        const delay = Math.min(
            this.maxReconnectDelayMs,
            this.baseReconnectDelayMs * 2 ** this.reconnectAttempts,
        );
        this.reconnectAttempts++;

        console.log(`${delay}ms 后进行第 ${this.reconnectAttempts} 次重连`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    send(data: string): void {
        this.ws?.send(data);
    }

    close(): void {
        this.shouldReconnect = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.ws?.close();
    }
}

