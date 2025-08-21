import { convertPageToMarkdown, fetchNotionPage } from "fetch-notion-page";
import { createLogger } from "../../libs/logger.js";
import type { ContentProvider, ContentResult } from "../../libs/types.js";

export const createNotionProvider = (): ContentProvider => {
  return {
    name: "notion",

    canHandle(url: string): boolean {
      return /^https?:\/\/([\w-]+\.)?notion\.(so|site)\//.test(url);
    },

    async extractContent(url: string): Promise<ContentResult> {
      const logger = createLogger("notion-provider");

      logger.info({ url }, "Notion provider extracting content");

      try {
        const apiKey = process.env.NOTION_API_KEY;

        if (!apiKey) {
          logger.warn("NOTION_API_KEY environment variable is not set");
          return {
            success: false,
            error:
              "NOTION_API_KEY environment variable is required for Notion pages. Please set it and try again.",
          };
        }

        const pageId = extractPageIdFromUrl(url);

        if (!pageId) {
          logger.warn({ url }, "Failed to extract page ID from Notion URL");
          return {
            success: false,
            error: "Invalid Notion URL format. Could not extract page ID.",
          };
        }

        logger.debug({ pageId }, "Fetching Notion page");

        const result = await fetchNotionPage(pageId, {
          apiKey,
          maxDepth: 10,
        });

        if (result.type === "Error") {
          logger.error(
            { error: result.error, pageId },
            "Failed to fetch Notion page",
          );
          return {
            success: false,
            error: `Failed to fetch Notion page: ${result.error}`,
          };
        }

        logger.debug({ pageId }, "Converting Notion page to Markdown");

        const markdown = convertPageToMarkdown(result.value);

        if (!markdown || markdown.trim().length === 0) {
          logger.warn({ pageId }, "Notion page returned empty content");
          return {
            success: false,
            error: "Notion page has no content",
          };
        }

        logger.info(
          { pageId, contentLength: markdown.length },
          "Successfully extracted Notion content",
        );

        return {
          success: true,
          content: markdown,
        };
      } catch (error) {
        logger.error({ error, url }, "Unexpected error in Notion provider");
        return {
          success: false,
          error: `Failed to extract Notion content: ${
            error instanceof Error ? error.message : String(error)
          }`,
        };
      }
    },
  };
};

function extractPageIdFromUrl(url: string): string | null {
  try {
    const patterns = [
      /notion\.(?:so|site)\/(?:[\w-]+\/)?([a-fA-F0-9]{32})/,
      /notion\.(?:so|site)\/(?:[\w-]+\/)?[\w-]+-([a-fA-F0-9]{32})/,
      /notion\.(?:so|site)\/([a-fA-F0-9]+)/,
      /notion\.(?:so|site)\/[\w-]+-([a-fA-F0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        const pageId = match[1];
        return formatPageId(pageId);
      }
    }

    return null;
  } catch {
    return null;
  }
}

function formatPageId(pageId: string): string {
  const cleanId = pageId.replace(/-/g, "");

  if (cleanId.length !== 32) {
    return pageId;
  }

  return [
    cleanId.slice(0, 8),
    cleanId.slice(8, 12),
    cleanId.slice(12, 16),
    cleanId.slice(16, 20),
    cleanId.slice(20, 32),
  ].join("-");
}
