import { R } from "@praha/byethrow";
import { createLogger } from "../../libs/logger.js";
import type { ContentProvider, ContentResult } from "../../libs/types.js";

export function createHttpProvider(): ContentProvider {
  return {
    name: "http",
    canHandle(_url: string): boolean {
      return true;
    },
    async extractContent(url: string): Promise<ContentResult> {
      const logger = createLogger("http-provider");

      logger.debug({ url }, "Attempting HTTP extraction");

      try {
        const response = await fetch(url);

        if (!response.ok) {
          logger.debug(
            {
              url,
              status: response.status,
              statusText: response.statusText,
            },
            "HTTP fetch failed",
          );

          return R.fail(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();

        if (!content || content.trim().length === 0) {
          logger.debug({ url }, "Empty content received");
          return R.fail("Empty content received from HTTP response");
        }

        logger.info(
          {
            url,
            contentLength: content.length,
          },
          "HTTP extraction successful",
        );

        return R.succeed(content.trim());
      } catch (error) {
        logger.debug(
          {
            url,
            error: error instanceof Error ? error.message : String(error),
          },
          "HTTP extraction failed",
        );

        return R.fail(
          `HTTP extraction failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },
  };
}
