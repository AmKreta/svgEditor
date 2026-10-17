import { test } from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { EditorBridge } from '../src/bridge.js';

let nextPort = 17341;

async function startBridge(options = {}) {
    const bridge = new EditorBridge({ port: nextPort++, timeoutMs: 500, ...options });
    await bridge.start();
    return bridge;
}

/** A fake editor tab that answers every command with its own name. */
function connectTab(bridge, name, { origin = 'http://localhost:3000', focused = false } = {}) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`ws://127.0.0.1:${bridge.port}`, { origin });
        socket.on('open', () => {
            socket.send(JSON.stringify({ type: 'hello', focused, info: { name } }));
            // let the hello arrive before the test sends commands
            setTimeout(() => resolve(socket), 50);
        });
        socket.on('message', (data) => {
            const { id, method } = JSON.parse(data.toString());
            socket.send(JSON.stringify(method === 'fail' ? { id, error: 'nope' } : { id, result: { tab: name, method } }));
        });
        socket.on('error', reject);
    });
}

test('explains when no editor is connected', async () => {
    const bridge = await startBridge();
    assert.throws(() => bridge.call('status'), /No editor is connected/);
    bridge.close();
});

test('forwards commands and errors to the editor', async () => {
    const bridge = await startBridge();
    const tab = await connectTab(bridge, 'a');
    assert.deepEqual(await bridge.call('status'), { tab: 'a', method: 'status' });
    await assert.rejects(bridge.call('fail'), /nope/);
    tab.close();
    bridge.close();
});

test('rejects tabs from other sites', async () => {
    const bridge = await startBridge();
    await assert.rejects(connectTab(bridge, 'evil', { origin: 'https://evil.example' }));
    assert.equal(bridge.status().connectedTabs, 0);
    bridge.close();
});

test('accepts extra origins that were allowed explicitly', async () => {
    const bridge = await startBridge({ allowedOrigins: ['https://react-svg-editor.netlify.app'] });
    const tab = await connectTab(bridge, 'site', { origin: 'https://react-svg-editor.netlify.app' });
    assert.equal(bridge.status().connectedTabs, 1);
    tab.close();
    bridge.close();
});

test('sends commands to the focused tab, not one that reconnected in the background', async () => {
    const bridge = await startBridge();
    const a = await connectTab(bridge, 'a', { focused: true });
    const b = await connectTab(bridge, 'b', { focused: false });
    assert.equal((await bridge.call('status')).tab, 'a');

    b.send(JSON.stringify({ type: 'focus' }));
    await new Promise((r) => setTimeout(r, 50));
    assert.equal((await bridge.call('status')).tab, 'b');

    b.close();
    await new Promise((r) => setTimeout(r, 50));
    assert.equal((await bridge.call('status')).tab, 'a');
    a.close();
    bridge.close();
});

test('times out when the editor never answers', async () => {
    const bridge = await startBridge({ timeoutMs: 100 });
    const silent = new WebSocket(`ws://127.0.0.1:${bridge.port}`);
    await new Promise((r) => silent.on('open', r));
    await new Promise((r) => setTimeout(r, 50));
    await assert.rejects(bridge.call('status'), /did not answer "status"/);
    silent.close();
    bridge.close();
});

test('reports a taken port instead of crashing', async () => {
    const first = await startBridge();
    const second = new EditorBridge({ port: first.port });
    await second.start();
    assert.equal(second.status().listening, false);
    assert.throws(() => second.call('status'), /could not listen/);
    second.close();
    first.close();
});
