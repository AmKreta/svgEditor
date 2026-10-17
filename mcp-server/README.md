# svgtool MCP server

Lets an AI agent (Claude Code, Claude Desktop, or any MCP client) use React Svg Editor: draw and edit shapes, manage pages, animate with timelines and cutscenes, save documents, and export SVG or PNG.

The editor keeps its documents in the browser (Redux state and IndexedDB), so the agent works through the editor tab you have open:

```
agent ⇄ (MCP over stdio) ⇄ mcp-server ⇄ (websocket, 127.0.0.1:7341) ⇄ editor tab
```

Each tool runs the editor's own actions in that tab, so you see every change on the canvas as it happens, and edits are recorded into the cutscene that is open, just as if you had made them yourself.

## Setup

```sh
cd mcp-server && npm install
```

**Claude Code:** the repo's `.mcp.json` already registers the server as `svgtool`. Approve it when Claude Code asks, or run `/mcp`.

**Other clients**, for example Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "svgtool": { "command": "node", "args": ["/absolute/path/to/svgEditor/mcp-server/src/index.js"] }
  }
}
```

Then start the editor (`npm start` in the project root) and open it in a browser. In development the editor connects to the server by itself and retries every few seconds, so the server and the editor can be started in either order. Ask the agent to run `editor_status` to check the connection.

With several editor tabs open, the agent works in the one you focused last.

## Tools

| Area | Tools |
| --- | --- |
| Connection | `editor_status` |
| Documents | `list_documents`, `open_document`, `new_document`, `save_document`, `get_document` |
| Shapes | `add_shape`, `update_shape`, `get_shape`, `delete_shapes`, `select_shapes`, `group_shapes`, `add_gradient` |
| Canvas and pages | `set_canvas`, `add_page`, `set_active_page` |
| Animation | `get_timelines`, `add_timeline`, `add_cutscene`, `open_cutscene`, `update_cutscene`, `set_transition` |
| Output | `export_svg`, `screenshot` (PNG; pass `time` to see a moment of the animation) |

Changes stay in the tab until `save_document` is called, as in the editor itself. `open_document` and `new_document` replace the open document, and anything unsaved is lost.

## Configuration

| Where | Variable | Default | |
| --- | --- | --- | --- |
| server | `SVG_EDITOR_BRIDGE_PORT` | `7341` | port the editor connects to |
| server | `SVG_EDITOR_ALLOWED_ORIGINS` | none | comma-separated extra sites allowed to connect; localhost is always allowed |
| editor | `REACT_APP_MCP_BRIDGE_URL` | `ws://127.0.0.1:7341` | must match the server's port |
| editor | `REACT_APP_MCP_BRIDGE` | on in development | `true` to connect from a production build, `false` to never connect |

The websocket only listens on 127.0.0.1, and it refuses browser pages from sites other than localhost unless you list them.

## Tests

```sh
npm test
```
