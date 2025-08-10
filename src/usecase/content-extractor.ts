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

    // extractedの構造に応じてコンテンツを取得
    const content =
      (extracted as any).textContent ||
      (extracted as any).content ||
      (extracted as any).text ||
      "";

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: "No content could be extracted from the page",
        errorType: "unknown",
      };
    }

    return {
      success: true,
      content,
      metadata: {
        title: (extracted as any).title || undefined,
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
