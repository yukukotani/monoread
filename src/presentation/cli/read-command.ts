import { R } from "@praha/byethrow";
import { define } from "gunshi";
import { createLogger } from "../../libs/logger.js";
import { readUrl } from "../../usecase/read-url.js";
import { globalArgs } from "./global-args.js";

export const readCommand = define({
  name: "read",
  description: "Read a URL",
  toKebab: true,
  args: {
    ...globalArgs,
    url: {
      type: "positional",
      description: "URL to read",
      required: true,
    },
    silent: {
      type: "boolean",
      description: "Extract content but do not output the result",
      default: false,
    },
  },
  run: async (ctx) => {
    const logger = createLogger("read-command");

    const url = ctx.values.url;

    if (!isValidUrl(url)) {
      logger.error({ url }, "Invalid URL format");
      throw new Error("Invalid URL format");
    }

    const result = await readUrl(url);

    if (R.isSuccess(result)) {
      logger.info({ url }, "Content extracted successfully");
      if (!ctx.values.silent) {
        ctx.log(result.value);
      }
    } else {
      logger.error({ url }, "Failed to extract content");
    }
  },
});

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
