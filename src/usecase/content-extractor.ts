import { extract } from "@mizchi/readability";
import { createLogger } from "../libs/logger.js";
import type { ContentProvider, ContentResult } from "../libs/types.js";

const logger = createLogger();

export async function extractContent(
  url: string,
  providers: ContentProvider[],
): Promise<ContentResult> {
  logger.info(
    { url, providerCount: providers.length },
    "Starting content extraction",
  );

  // 特定プロバイダを順番に試行
  const matchingProviders = providers.filter((p) => p.canHandle(url));

  logger.debug(
    {
      url,
      totalProviders: providers.length,
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
        "Fallback fetch failed",
      );

      return {
        success: false,
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
        errorType: response.status === 404 ? "not_found" : "network",
      };
    }

    const html = await response.text();
    logger.debug({ url, htmlLength: html.length }, "HTML fetched successfully");

    // @mizchi/readabilityでコンテンツを抽出
    const extracted = extract(html);

    // extractedオブジェクトから安全にプロパティを取得
    const extractedObj = extracted as unknown as Record<string, unknown>;

    // 安全にプロパティにアクセス
    const getStringProp = (
      obj: Record<string, unknown>,
      key: string,
    ): string | null => {
      const value = obj[key];
      return typeof value === "string" ? value : null;
    };

    const content =
      getStringProp(extractedObj, "textContent") ||
      getStringProp(extractedObj, "content") ||
      getStringProp(extractedObj, "text") ||
      "";

    if (!content || content.trim().length === 0) {
      logger.warn({ url }, "No content could be extracted from page");
      return {
        success: false,
        error: "No content could be extracted from the page",
        errorType: "unknown",
      };
    }

    const title = getStringProp(extractedObj, "title") || undefined;

    logger.info(
      {
        url,
        contentLength: content.length,
        hasTitle: !!title,
      },
      "Readability extraction successful",
    );

    return {
      success: true,
      content,
      metadata: {
        ...(title && { title }),
        source: url,
      },
    };
  } catch (error) {
    logger.error(
      {
        url,
        error: error instanceof Error ? error.message : String(error),
      },
      "Readability extraction failed",
    );

    return {
      success: false,
      error: `Failed to extract content: ${error instanceof Error ? error.message : String(error)}`,
      errorType: "network",
    };
  }
}
