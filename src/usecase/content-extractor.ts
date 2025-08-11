import { createLogger } from "../libs/logger.js";
import type { ContentProvider, ContentResult } from "../libs/types.js";
import { createGithubProvider } from "./providers/github-provider.js";
import { createLlmsTxtProvider } from "./providers/llms-txt-provider.js";
import { createReadabilityProvider } from "./providers/readability-provider.js";

const PROVIDERS: ContentProvider[] = [
  createGithubProvider(),
  createReadabilityProvider(),
  createLlmsTxtProvider(),
];

export async function extractContent(url: string): Promise<ContentResult> {
  const logger = createLogger("content-extractor");

  logger.info(
    { url, providerCount: PROVIDERS.length },
    "Starting content extraction",
  );

  let lastFailedResult: ContentResult | null = null;

  // 各プロバイダを順番に試行（フォールバック機能）
  for (const provider of PROVIDERS) {
    // canHandleがfalseの場合はスキップ
    if (!provider.canHandle(url)) {
      logger.debug(
        { provider: provider.name, url },
        "Provider skipped (canHandle returned false)",
      );
      continue;
    }

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
      "Provider failed, trying next provider",
    );

    // 失敗した結果を記録（最後のプロバイダのエラーを返すため）
    lastFailedResult = result;
  }

  // すべてのプロバイダが失敗した場合、最後のプロバイダのエラーを返す
  logger.warn({ url }, "All providers failed");
  return (
    lastFailedResult || {
      success: false,
      error: "No providers available for this URL",
      errorType: "unknown",
    }
  );
}
