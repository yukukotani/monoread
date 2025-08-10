import { cli } from "gunshi";
import { setLogLevel } from "../../libs/logger.js";
import { readCommand } from "./read-command.js";

export async function execute() {
  await cli(process.argv.slice(2), readCommand, {
    onBeforeCommand(ctx) {
      if (ctx.values.logLevel) {
        setLogLevel(ctx.values.logLevel);
      }
    },
  });
}
