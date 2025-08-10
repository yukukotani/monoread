import type { ContentProvider, ContentResult } from "../libs/types.js";

export async function extractContent(
  url: string,
  providers: ContentProvider[],
): Promise<ContentResult> {
  // 特定プロバイダを順番に試行
  const matchingProviders = providers.filter((p) => p.canHandle(url));

  for (const provider of matchingProviders) {
    const result = await provider.extractContent(url);
    if (result.success) {
      return result;
    }
  }

  // フォールバックとして@mizchi/readabilityを直接使用
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
        errorType: response.status === 404 ? "not_found" : "network",
      };
    }

    const html = await response.text();

    // @mizchi/readabilityのextract関数をインポート
    const { extract } = await import("@mizchi/readability");
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
      return {
        success: false,
        error: "No content could be extracted from the page",
        errorType: "unknown",
      };
    }

    const title = getStringProp(extractedObj, "title") || undefined;

    return {
      success: true,
      content,
      metadata: {
        ...(title && { title }),
        source: url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to extract content: ${error instanceof Error ? error.message : String(error)}`,
      errorType: "network",
    };
  }
}
