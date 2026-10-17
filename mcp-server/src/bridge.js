import { WebSocketServer } from 'ws';

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
const HEARTBEAT_MS = 15000;

export class BridgeError extends Error { }

/**
 * Websocket server the editor tab connects to. Tools are forwarded to the most recently
 * connected tab as `{ id, method, params }` and resolve with its `{ id, result | error }` reply.
 */
export class EditorBridge {
    /**
     * @param {{ port: number, host?: string, allowedOrigins?: string[], timeoutMs?: number, log?: (msg: string) => void }} options
     */
    constructor({ port, host = '127.0.0.1', allowedOrigins = [], timeoutMs = 20000, log = () => { } }) {
        this.port = port;
        this.host = host;
        this.allowedOrigins = allowedOrigins;
        this.timeoutMs = timeoutMs;
        this.log = log;
        /** open editor tabs; the last one (most recently focused, else connected) receives commands */
        this.clients = [];
        this.pending = new Map();
        this.nextId = 1;
        this.startError = null;
    }

    isAllowedOrigin(origin) {
        // non-browser clients send no origin; they are local processes anyway
        return !origin || LOCAL_ORIGIN.test(origin) || this.allowedOrigins.includes(origin);
    }

    start() {
        return new Promise((resolve) => {
            this.wss = new WebSocketServer({
                port: this.port,
                host: this.host,
                verifyClient: ({ origin }) => {
                    const ok = this.isAllowedOrigin(origin);
                    if (!ok) {
                        this.log(`rejected editor connection from origin ${origin}`);
                    }
                    return ok;
                },
            });
            this.wss.on('listening', () => {
                this.log(`waiting for the editor on ws://${this.host}:${this.port}`);
                resolve();
            });
            // keep the MCP server up (and able to explain the problem) when the port is taken
            this.wss.on('error', (err) => {
                this.startError = err;
                this.log(`bridge error: ${err.message}`);
                resolve();
            });
            this.wss.on('connection', (socket) => this.onConnection(socket));
            this.heartbeat = setInterval(() => this.clients.forEach((client) => {
                if (!client.alive) {
                    client.socket.terminate();
                    return;
                }
                client.alive = false;
                client.socket.ping();
            }), HEARTBEAT_MS);
            this.heartbeat.unref();
        });
    }

    onConnection(socket) {
        const client = { socket, alive: true, info: {} };
        this.clients.push(client);
        this.log(`editor connected (${this.clients.length} open)`);

        socket.on('pong', () => { client.alive = true; });
        socket.on('message', (data) => {
            let message;
            try {
                message = JSON.parse(data.toString());
            } catch {
                return;
            }
            if (message.type === 'hello') {
                client.info = message.info || {};
                // a tab that reconnects in the background (dev server reload) shouldn't take over from the focused one
                if (!message.focused && this.clients.length > 1) {
                    this.clients = [client, ...this.clients.filter((c) => c !== client)];
                }
                return;
            }
            if (message.type === 'focus') {
                this.clients = [...this.clients.filter((c) => c !== client), client];
                return;
            }
            const request = this.pending.get(message.id);
            if (!request || request.client !== client) {
                return;
            }
            this.pending.delete(message.id);
            clearTimeout(request.timer);
            if (message.error) {
                request.reject(new BridgeError(message.error));
            } else {
                request.resolve(message.result);
            }
        });
        socket.on('close', () => {
            this.clients = this.clients.filter((c) => c !== client);
            this.log(`editor disconnected (${this.clients.length} open)`);
            for (const [id, request] of this.pending) {
                if (request.client === client) {
                    this.pending.delete(id);
                    clearTimeout(request.timer);
                    request.reject(new BridgeError('The editor tab closed before answering.'));
                }
            }
        });
    }

    status() {
        const client = this.clients[this.clients.length - 1];
        return {
            listening: !this.startError,
            url: `ws://${this.host}:${this.port}`,
            error: this.startError?.message,
            connectedTabs: this.clients.length,
            activeTab: client?.info,
            otherTabs: this.clients.slice(0, -1).map((c) => c.info),
        };
    }

    /** Runs a command in the active editor tab. */
    call(method, params = {}) {
        if (this.startError) {
            throw new BridgeError(`The editor bridge could not listen on ${this.host}:${this.port} (${this.startError.message}). Another svgtool MCP server may be running; set SVG_EDITOR_BRIDGE_PORT to use a different port, and REACT_APP_MCP_BRIDGE_URL in the editor to match.`);
        }
        const client = this.clients[this.clients.length - 1];
        if (!client) {
            throw new BridgeError(`No editor is connected. Start the editor (npm start in the project root) and open it in a browser; it connects to ws://${this.host}:${this.port} automatically.`);
        }
        const id = this.nextId++;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(id);
                reject(new BridgeError(`The editor did not answer "${method}" within ${this.timeoutMs / 1000}s.`));
            }, this.timeoutMs);
            this.pending.set(id, { client, resolve, reject, timer });
            client.socket.send(JSON.stringify({ id, method, params }));
        });
    }

    close() {
        clearInterval(this.heartbeat);
        this.wss?.close();
    }
}
