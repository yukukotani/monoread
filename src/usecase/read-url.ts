import { R } from "@praha/byethrow";
import { createLogger } from "../libs/logger.js";
import type { ContentProvider, ContentResult } from "../libs/types.js";
import { createGithubProvider } from "./providers/github-provider.js";
import { createHttpProvider } from "./providers/http-provider.js";
import { createLlmsTxtProvider } from "./providers/llms-txt-provider.js";
import { createNotionProvider } from "./providers/notion-provider.js";
import { createReadabilityProvider } from "./providers/readability-provider.js";

const PROVIDERS: ContentProvider[] = [
  createGithubProvider(),
  createNotionProvider(),
  // fallbacks
  createReadabilityProvider(),
  createLlmsTxtProvider(),
  createHttpProvider(),
];

export async function readUrl(url: string): Promise<ContentResult> {
  const logger = createLogger("content-extractor");

  logger.info(
    { url, providerCount: PROVIDERS.length },
    "Starting content extraction",
  );

  // 各プロバイダを順番に試行（フォールバック機能）
  for (const provider of PROVIDERS) {
    if (!provider.canHandle(url)) {
      logger.debug(
        { provider: provider.name, url },
        "Provider skipped (canHandle returned false)",
      );
      continue;
    }

    const result = await executeProvider(provider, url);

    logger.debug(
      { provider: provider.name, url, result: R.isSuccess(result) },
      "Provider executed",
    );

    if (R.isSuccess(result)) {
      logger.info(
        { provider: provider.name, url },
        "Content extracted successfully",
      );
      return result;
    }
  }

  return R.fail("Failed to extract content");
}

async function executeProvider(
  provider: ContentProvider,
  url: string,
): Promise<ContentResult> {
  try {
    const result = await provider.extractContent(url);

    if (R.isFailure(result)) {
      return result;
    }

    const trimmedContent = result.value.trim();
    if (trimmedContent.length === 0) {
      return R.fail("Empty content");
    }

    return R.succeed(trimmedContent);
  } catch (error) {
    return R.fail(error instanceof Error ? error.message : "Unknown error");
  }
}
