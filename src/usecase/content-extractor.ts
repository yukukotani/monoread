import { createChildLogger } from "../libs/logger.js";
import { extractContentByReadability } from "../libs/readability.js";
import type { ContentProvider, ContentResult } from "../libs/types.js";

const logger = createChildLogger("content-extractor");

export async function extractContent(
  url: string,
  providers: ContentProvider[]
): Promise<ContentResult> {
  logger.info(
    { url, providerCount: providers.length },
    "Starting content extraction"
  );

  // 特定プロバイダを順番に試行
  const matchingProviders = providers.filter((p) => p.canHandle(url));

  logger.debug(
    {
      url,
      totalProviders: providers.length,
      matchingProviders: matchingProviders.length,
    },
    "Provider filtering complete"
  );

  for (const provider of matchingProviders) {
    logger.debug({ provider: provider.name, url }, "Trying provider");
    const result = await provider.extractContent(url);
    if (result.success) {
      logger.info(
        {
          provider: provider.name,
          url,
          contentLength: result.content.length,
        },
        "Provider succeeded"
      );
      return result;
    }
    logger.debug(
      { provider: provider.name, url, error: result.error },
      "Provider failed"
    );
  }

  // フォールバックとして@mizchi/readabilityを直接使用
  logger.info({ url }, "Falling back to readability extraction");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      logger.warn(
        {
          url,
          status: response.status,
          statusText: response.statusText,
        },
        "Fallback fetch failed"
      );

      return {
        success: false,
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
        errorType: response.status === 404 ? "not_found" : "network",
      };
    }

    const content = await extractContentByReadability(url);

    if (!content || content.trim().length === 0) {
      logger.warn({ url }, "No content could be extracted from page");
      return {
        success: false,
        error: "No content could be extracted from the page",
        errorType: "unknown",
      };
    }

    logger.info(
      {
        url,
        contentLength: content.length,
      },
      "Readability extraction successful"
    );

    return {
      success: true,
      content,
      metadata: {
        source: url,
      },
    };
  } catch (error) {
    logger.error(
      {
        url,
        error: error instanceof Error ? error.message : String(error),
      },
      "Readability extraction failed"
    );

    return {
      success: false,
      error: `Failed to extract content: ${
        error instanceof Error ? error.message : String(error)
      }`,
      errorType: "network",
    };
  }
}
