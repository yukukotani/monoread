import { R } from "@praha/byethrow";

/**
 * llms.txt URL生成ユーティリティ
 * 元のURLからllms.txtファイルのURLを生成します
 */
export function generateLlmsTxtUrl(originalUrl: string): string | null {
  try {
    const url = new URL(originalUrl);

    // search params と hash を除去
    url.search = "";
    url.hash = "";

    let pathname = url.pathname;

    // パスが / で終わらない場合、ディレクトリパスに変換
    if (!pathname.endsWith("/")) {
      // ファイル名を含むパスの場合は、最後のセグメントを削除してディレクトリにする
      const pathSegments = pathname.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];

      // 拡張子がある場合（ファイル）は、そのセグメントを削除
      if (lastSegment.includes(".")) {
        pathSegments.pop();
        pathname = pathSegments.join("/");
        if (!pathname.endsWith("/") && pathname !== "") {
          pathname += "/";
        }
      } else {
        // ディレクトリの場合は / を追加
        pathname += "/";
      }
    }

    // ルートパスの場合は / を確保
    if (pathname === "" || pathname === "/") {
      pathname = "/";
    }

    // llms.txt を追加
    const llmsTxtUrl = `${url.protocol}//${url.host}${pathname}llms.txt`;
    return llmsTxtUrl;
  } catch (_error) {
    return null;
  }
}

/**
 * readability結果が空または無効かどうかを判定します
 */
export function isReadabilityResultEmpty(content: string): boolean {
  return !content || content.trim().length === 0;
}

/**
 * llms.txtコンテンツが有効かどうかを判定します
 */
export function isValidLlmsTxtContent(content: string): boolean {
  // 空でなければ有効
  return content.trim().length > 0;
}

/**
 * llms.txtからコンテンツを抽出します
 */
export async function extractContentFromLlmsTxt(
  originalUrl: string,
): Promise<import("./types.js").ContentResult> {
  const { createLogger } = await import("./logger.js");
  const logger = createLogger("llms-txt-extractor");

  // llms.txt URLを生成
  const llmsTxtUrl = generateLlmsTxtUrl(originalUrl);
  if (!llmsTxtUrl) {
    logger.debug({ originalUrl }, "Invalid URL for llms.txt generation");
    return R.fail("Invalid URL for llms.txt generation");
  }

  logger.debug({ llmsTxtUrl, originalUrl }, "Trying llms.txt fallback");

  try {
    const response = await fetch(llmsTxtUrl);

    if (!response.ok) {
      if (response.status === 404) {
        logger.debug({ llmsTxtUrl, originalUrl }, "llms.txt not found (404)");
        return R.fail("llms.txt not found");
      }

      if (response.status === 401 || response.status === 403) {
        logger.warn(
          { llmsTxtUrl, originalUrl, status: response.status },
          "llms.txt access denied",
        );
        return R.fail(`Access denied to llms.txt: ${response.status}`);
      }

      if (response.status >= 500) {
        logger.warn(
          { llmsTxtUrl, originalUrl, status: response.status },
          "llms.txt server error",
        );
        return R.fail(`Server error accessing llms.txt: ${response.status}`);
      }

      logger.warn(
        { llmsTxtUrl, originalUrl, status: response.status },
        "llms.txt fallback failed",
      );
      return R.fail(`HTTP ${response.status} when accessing llms.txt`);
    }

    const content = await response.text();

    if (!isValidLlmsTxtContent(content)) {
      logger.debug(
        { llmsTxtUrl, originalUrl, contentLength: content.length },
        "Invalid llms.txt content",
      );
      return R.fail("llms.txt contains invalid or empty content");
    }

    logger.info(
      {
        llmsTxtUrl,
        originalUrl,
        contentLength: content.length,
      },
      "llms.txt extraction successful",
    );

    return R.succeed(content.trim());
  } catch (error) {
    logger.warn(
      {
        llmsTxtUrl,
        originalUrl,
        error: error instanceof Error ? error.message : String(error),
      },
      "llms.txt fallback failed",
    );

    return R.fail(
      `Failed to fetch llms.txt: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
