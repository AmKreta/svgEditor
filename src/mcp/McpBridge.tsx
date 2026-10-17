import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLatestRef } from '../hooks';
import { connectMcpBridge, isMcpBridgeEnabled } from './bridge';
import { createCommands } from './commands';

/** Lets an AI agent drive this tab through the MCP server in mcp-server/. Renders nothing. */
const McpBridge: React.FC = function () {
    const navigate = useNavigate();
    const navigateRef = useLatestRef(navigate);

    useEffect(() => {
        if (!isMcpBridgeEnabled()) {
            return;
        }
        return connectMcpBridge(createCommands(path => navigateRef.current(path)));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
};

export default McpBridge;
