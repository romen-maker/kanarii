import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server';

export { createMcpServer };

/**
 * Conecta e inicia el servidor MCP utilizando el transporte StdioServerTransport.
 */
export async function runMcpServer(server: McpServer = createMcpServer()): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
