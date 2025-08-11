import { createLogger } from "../../libs/logger.js";
import { extractContentByReadability } from "../../libs/readability.js";
import type { ContentProvider, ContentResult } from "../../libs/types.js";

export function createReadabilityProvider(): ContentProvider {
  return {
    name: "readability",
    canHandle(_url: string): boolean {
      return true;
    },
    async extractContent(url: string): Promise<ContentResult> {
      const logger = createLogger("readability-provider");

      logger.debug({ url }, "Attempting readability extraction");

      try {
        const response = await fetch(url);

        if (!response.ok) {
          logger.debug(
            {
              url,
              status: response.status,
              statusText: response.statusText,
            },
            "Fetch failed",
          );

          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            errorType: "network",
          };
        }

        const content = await extractContentByReadability(url);

        if (!content || content.trim().length === 0) {
          logger.debug({ url }, "Empty content extracted");
          return {
            success: false,
            error: "Empty content extracted from readability",
            errorType: "unknown",
          };
        }

        logger.info(
          {
            url,
            contentLength: content.length,
          },
          "Readability extraction successful",
        );

        return {
          success: true,
          content: content.trim(),
        };
      } catch (error) {
        logger.debug(
          {
            url,
            error: error instanceof Error ? error.message : String(error),
          },
          "Readability extraction failed",
        );

        return {
          success: false,
          error: `Readability extraction failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          errorType: "unknown",
        };
      }
    },
  };
}
