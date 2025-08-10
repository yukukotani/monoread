import { githubProvider } from "../libs/providers/github-provider.js";
import type { ContentProvider } from "../libs/types.js";
import { extractContent } from "../usecase/content-extractor.js";

const providers: ContentProvider[] = [githubProvider];

export async function handleCli(): Promise<void> {
  const args = process.argv.slice(2);

  // ヘルプメッセージの表示
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    console.log("monoread v1.0.0");
    console.log("CLI tool for reading any URL in AI-optimized format");
    console.log("");
    console.log("Usage:");
    console.log("  monoread <url>     Extract content from URL");
    console.log("  monoread --help    Display this help message");
    console.log("");
    console.log("Examples:");
    console.log("  monoread https://github.com/owner/repo/blob/main/file.ts");
    console.log("  monoread https://example.com/article");
    process.exit(0);
  }

  // バージョンの表示
  if (args.includes("--version") || args.includes("-v")) {
    console.log("1.0.0");
    process.exit(0);
  }

  const url = args[0];

  // URL が提供されているかチェック
  if (!url) {
    console.error("Error: URL is required");
    console.error("Use --help for usage information");
    process.exit(1);
  }

  // URL の妥当性をチェック
  if (!isValidUrl(url)) {
    console.error("Error: Invalid URL format");
    console.error("Use --help for usage information");
    process.exit(1);
  }

  console.error(`Processing: ${url}`);

  const result = await extractContent(url, providers);

  if (result.success) {
    // メタデータがある場合は出力
    if (result.metadata.title) {
      console.error(`Title: ${result.metadata.title}`);
    }
    if (result.metadata.fileName) {
      console.error(`File: ${result.metadata.fileName}`);
    }

    // メインコンテンツを標準出力に出力
    console.log(result.content);
    process.exit(0);
  } else {
    console.error(`Error: ${result.error}`);

    // エラータイプに応じた追加情報を表示
    switch (result.errorType) {
      case "not_found":
        console.error("The specified URL or file was not found.");
        break;
      case "auth":
        console.error(
          "Authentication required. This may be a private repository.",
        );
        console.error(
          "Consider setting up GitHub token for private repositories.",
        );
        break;
      case "rate_limit":
        console.error("API rate limit exceeded. Please try again later.");
        break;
      case "invalid_url":
        console.error("Please provide a valid URL.");
        break;
      case "network":
        console.error(
          "Network error. Please check your connection and try again.",
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
