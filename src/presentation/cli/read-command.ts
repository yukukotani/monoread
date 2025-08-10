import { define } from "gunshi";
import { createLogger } from "../../libs/logger.js";
import { extractContent } from "../../usecase/content-extractor.js";
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
  },
  run: async (ctx) => {
    const logger = createLogger("read-command");

    const url = ctx.values.url;

    if (!isValidUrl(url)) {
      logger.error({ url }, "Invalid URL format");
      throw new Error("Invalid URL format");
    }

    const result = await extractContent(url);

    if (result.success) {
      logger.info({ url }, "Content extracted successfully");
      ctx.log(result.content);
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
