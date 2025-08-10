import { cli } from "gunshi";
import pkgJson from "../../../package.json" with { type: "json" };
import { setLogLevel } from "../../libs/logger.js";
import { mcpCommand } from "./mcp-command.js";
import { readCommand } from "./read-command.js";

export async function execute() {
  const subCommands = new Map([
    ["read", readCommand],
    ["mcp", mcpCommand],
  ]);

  await cli(process.argv.slice(2), readCommand, {
    name: pkgJson.name,
    description: pkgJson.description,
    version: pkgJson.version,
    subCommands,
    onBeforeCommand(ctx) {
      if (ctx.values.logLevel) {
        setLogLevel(ctx.values.logLevel);
      }
    },
  });
}
