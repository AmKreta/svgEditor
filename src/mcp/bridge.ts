import store, { State } from '../store/store';

/** where the MCP server (mcp-server/) listens for the editor */
const BRIDGE_URL = process.env.REACT_APP_MCP_BRIDGE_URL || 'ws://127.0.0.1:7341';
const MIN_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

/** On during development; REACT_APP_MCP_BRIDGE=true turns it on in a build, =false turns it off. */
export const isMcpBridgeEnabled = () => process.env.REACT_APP_MCP_BRIDGE
    ? process.env.REACT_APP_MCP_BRIDGE === 'true'
    : process.env.NODE_ENV === 'development';

type Commands = { [method: string]: (params: any) => unknown };

/**
 * Connects to the MCP server and runs the commands it sends against this tab, retrying with
 * backoff while no server is running. Returns a function that disconnects for good.
 */
export function connectMcpBridge(commands: Commands): () => void {
    let socket: WebSocket | null = null;
    let retryMs = MIN_RETRY_MS;
    let retryTimer: number | undefined;
    let stopped = false;
    // run commands one at a time so each sees the state the previous one left
    let queue: Promise<unknown> = Promise.resolve();

    const connect = () => {
        socket = new WebSocket(BRIDGE_URL);
        const current = socket;

        current.onopen = () => {
            retryMs = MIN_RETRY_MS;
            const { page } = store.getState() as State;
            current.send(JSON.stringify({
                type: 'hello',
                focused: document.hasFocus(),
                info: { url: window.location.href, title: document.title, document: page.name || null },
            }));
        };

        current.onmessage = (event) => {
            let request: { id: number, method: string, params?: any };
            try {
                request = JSON.parse(event.data);
            } catch {
                return;
            }
            queue = queue.then(async () => {
                const reply: { id: number, result?: unknown, error?: string } = { id: request.id };
                try {
                    const command = commands[request.method];
                    if (!command) {
                        throw new Error(`Unknown command "${request.method}"; the editor may be older than the MCP server.`);
                    }
                    reply.result = await command.call(commands, request.params || {});
                } catch (err) {
                    reply.error = err instanceof Error ? err.message : String(err);
                }
                if (current.readyState === WebSocket.OPEN) {
                    current.send(JSON.stringify(reply));
                }
            });
        };

        current.onclose = () => {
            if (stopped) {
                return;
            }
            retryTimer = window.setTimeout(connect, retryMs);
            retryMs = Math.min(MAX_RETRY_MS, retryMs * 2);
        };
    };

    // with several editor tabs open, commands go to the one focused last
    const onFocus = () => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'focus' }));
        }
    };
    window.addEventListener('focus', onFocus);

    connect();
    return () => {
        stopped = true;
        window.removeEventListener('focus', onFocus);
        window.clearTimeout(retryTimer);
        socket?.close();
    };
}
