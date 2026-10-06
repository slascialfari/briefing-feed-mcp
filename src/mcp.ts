import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getBriefings, saveBriefing } from "./db.js";

// Builds an MCP server with our two tools registered.
// A fresh instance is created for every request (stateless).
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "briefing-feed-mcp",
    version: "0.2.0",
  });

  server.registerTool(
    "save_briefing",
    {
      title: "Save briefing",
      description:
        "Save a briefing to the user's briefing feed. Use this to store the output of scheduled tasks.",
      inputSchema: {
        task_name: z.string().describe("Name of the scheduled task that produced this briefing"),
        title: z.string().describe("Short headline for the briefing"),
        summary: z.string().describe("One or two sentence summary"),
        content: z.string().describe("Full briefing text (Markdown is fine)"),
        sources: z.array(z.string()).describe("List of source URLs or references"),
      },
    },
    async (input) => {
      try {
        const briefing = await saveBriefing(input);
        console.log(`Saved briefing #${briefing.id} "${briefing.title}" from task "${briefing.task_name}"`);
        return {
          content: [
            { type: "text", text: `Briefing #${briefing.id} "${briefing.title}" saved to the feed.` },
          ],
        };
      } catch (error) {
        console.error(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Could not save the briefing: ${(error as Error).message}` }],
        };
      }
    }
  );

  server.registerTool(
    "get_briefings",
    {
      title: "Get briefings",
      description: "Return the most recent briefings saved in the feed (newest first, up to 20).",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const all = await getBriefings();
        return {
          content: [
            {
              type: "text",
              text: all.length === 0 ? "No briefings saved yet." : JSON.stringify(all, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Could not load briefings: ${(error as Error).message}` }],
        };
      }
    }
  );

  return server;
}
