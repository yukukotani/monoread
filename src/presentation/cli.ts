import { createLogger } from "../libs/logger.js";
import { githubProvider } from "../libs/providers/github-provider.js";
import type { ContentProvider } from "../libs/types.js";
import { extractContent } from "../usecase/content-extractor.js";

const providers: ContentProvider[] = [githubProvider];
const logger = createLogger();

export async function handleCli(): Promise<void> {
  const args = process.argv.slice(2);

  // ヘルプメッセージの表示
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    // ヘルプメッセージは標準出力に出力
    console.log("monoread v1.0.0");
    console.log("CLI tool for reading any URL in AI-optimized format");
    console.log("");
    console.log("Usage:");
    console.log("  monoread <url>     Extract content from URL");
    console.log("  monoread --help    Display this help message");
    console.log("  monoread --version Display version");
    console.log("");
    console.log("Examples:");
    console.log("  monoread https://github.com/owner/repo/blob/main/file.ts");
    console.log("  monoread https://example.com/article");
    return;
  }

  // バージョンの表示
  if (args.includes("--version") || args.includes("-v")) {
    // バージョンも標準出力に出力
    console.log("1.0.0");
    return;
  }

  const url = args[0];

  // URL が提供されているかチェック
  if (!url) {
    logger.error("URL is required");
    process.stderr.write("Error: URL is required\n");
    process.stderr.write("Use --help for usage information\n");
    process.exit(1);
  }

  // URL の妥当性をチェック
  if (!isValidUrl(url)) {
    logger.error({ url }, "Invalid URL format");
    process.stderr.write("Error: Invalid URL format\n");
    process.stderr.write("Use --help for usage information\n");
    process.exit(1);
  }

  logger.info({ url }, "Processing URL");
  process.stderr.write(`Processing: ${url}\n`);

  const result = await extractContent(url, providers);

  if (result.success) {
    logger.info(
      {
        metadata: result.metadata,
        contentLength: result.content.length,
      },
      "Content extracted successfully",
    );

    // メタデータがある場合は標準エラー出力に出力
    if (result.metadata.title) {
      process.stderr.write(`Title: ${result.metadata.title}\n`);
    }
    if (result.metadata.fileName) {
      process.stderr.write(`File: ${result.metadata.fileName}\n`);
    }

    // メインコンテンツを標準出力に出力
    console.log(result.content);
  } else {
    logger.error(
      {
        error: result.error,
        errorType: result.errorType,
        url,
      },
      "Failed to extract content",
    );

    process.stderr.write(`Error: ${result.error}\n`);

    // エラータイプに応じた追加情報を表示
    switch (result.errorType) {
      case "not_found":
        process.stderr.write("The specified URL or file was not found.\n");
        break;
      case "auth":
        process.stderr.write(
          "Authentication required. This may be a private repository.\n",
        );
        process.stderr.write(
          "Consider setting up GitHub token for private repositories.\n",
        );
        break;
      case "rate_limit":
        process.stderr.write(
          "API rate limit exceeded. Please try again later.\n",
        );
        break;
      case "invalid_url":
        process.stderr.write("Please provide a valid URL.\n");
        break;
      case "network":
        process.stderr.write(
          "Network error. Please check your connection and try again.\n",
        );
        break;
    }

    process.exit(1);
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
