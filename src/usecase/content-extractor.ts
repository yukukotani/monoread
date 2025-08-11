import {
  extractContentFromLlmsTxt,
  isReadabilityResultEmpty,
} from "../libs/llms-txt.js";
import { createLogger } from "../libs/logger.js";
import { extractContentByReadability } from "../libs/readability.js";
import type { ContentProvider, ContentResult } from "../libs/types.js";
import { createGithubProvider } from "./providers/github-provider.js";

const PROVIDERS: ContentProvider[] = [createGithubProvider()];

export async function extractContent(url: string): Promise<ContentResult> {
  const logger = createLogger("content-extractor");

  logger.info(
    { url, providerCount: PROVIDERS.length },
    "Starting content extraction",
  );

  // 特定プロバイダを順番に試行
  const matchingProviders = PROVIDERS.filter((p) => p.canHandle(url));

  logger.debug(
    {
      url,
      totalProviders: PROVIDERS.length,
      matchingProviders: matchingProviders.length,
    },
    "Provider filtering complete",
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
        "Provider succeeded",
      );
      return result;
    }
    logger.debug(
      { provider: provider.name, url, error: result.error },
      "Provider failed",
    );
  }

  // フォールバックとして@mizchi/readabilityを使用
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
        "Fallback fetch failed",
      );

      // readabilityが失敗した場合、llms.txtフォールバックを試行
      logger.debug({ url }, "readability failed, trying llms.txt fallback");
      return await extractContentFromLlmsTxt(url);
    }

    const content = await extractContentByReadability(url);

    if (isReadabilityResultEmpty(content)) {
      logger.debug({ url }, "readability failed, trying llms.txt fallback");
      return await extractContentFromLlmsTxt(url);
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
      content,
      metadata: {
        source: url,
      },
    };
  } catch (error) {
    logger.debug(
      {
        url,
        error: error instanceof Error ? error.message : String(error),
      },
      "readability failed, trying llms.txt fallback",
    );

    // readabilityが例外をスローした場合、llms.txtフォールバックを試行
    return await extractContentFromLlmsTxt(url);
  }
}
