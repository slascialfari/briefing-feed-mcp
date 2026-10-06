import type { Config, Context } from "@netlify/functions";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "../../src/mcp.js";

// The MCP endpoint. ChatGPT connects to https://<your-site>.netlify.app/mcp/<MCP_SECRET>
export default async (req: Request, context: Context) => {
  // Simple protection: the URL must contain the secret set in Netlify's environment variables.
  const secret = process.env.MCP_SECRET;
  if (!secret || context.params.secret !== secret) {
    return new Response("Not found", { status: 404 });
  }

  // Serverless functions can't hold long-lived streams, so only POST is supported.
  if (req.method !== "POST") {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null },
      { status: 405, headers: { Allow: "POST" } }
    );
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true, // plain JSON replies instead of a stream
  });
  await server.connect(transport);
  return transport.handleRequest(req);
};

export const config: Config = {
  path: "/mcp/:secret",
};
