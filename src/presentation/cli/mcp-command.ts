import { define } from "gunshi";
import { startMcpServer } from "../mcp/server.js";
import { globalArgs } from "./global-args.js";

export const mcpCommand = define({
  name: "mcp",
  description: "Start MCP server",
  toKebab: true,
  args: globalArgs,
  run: async (_ctx) => {
    await startMcpServer();
  },
});
