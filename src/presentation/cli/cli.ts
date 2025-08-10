import { cli } from "gunshi";
import { setLogLevel } from "../../libs/logger.js";
import { readCommand } from "./read-command.js";

export async function execute() {
  const subCommands = new Map([["read", readCommand]]);

  await cli(process.argv.slice(2), readCommand, {
    subCommands,
    onBeforeCommand(ctx) {
      if (ctx.values.logLevel) {
        setLogLevel(ctx.values.logLevel);
      }
    },
  });
}
