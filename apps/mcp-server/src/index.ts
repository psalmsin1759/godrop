import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { allTools } from "./tools";
import { toMcpToolDescriptor } from "./toolRegistry";
import { toolError } from "./apiClient";

const server = new Server(
  { name: "godrop-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools.map(toMcpToolDescriptor),
}));

server.setRequestHandler(CallToolRequestSchema, async (request): Promise<any> => {
  const tool = allTools.find((t) => t.name === request.params.name);
  if (!tool) {
    return { content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }], isError: true };
  }

  const parsed = tool.schema.safeParse(request.params.arguments ?? {});
  if (!parsed.success) {
    return {
      content: [{ type: "text", text: `Invalid arguments for ${tool.name}: ${parsed.error.message}` }],
      isError: true,
    };
  }

  try {
    return await tool.handler(parsed.data);
  } catch (err) {
    return { content: [{ type: "text", text: toolError(err) }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is reserved for the JSON-RPC transport — log to stderr only.
  console.error("godrop-mcp-server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting godrop-mcp-server:", err);
  process.exit(1);
});
