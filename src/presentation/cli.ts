import { gunshi } from "gunshi";
import { githubProvider } from "../libs/providers/github-provider.js";
import type { ContentProvider } from "../libs/types.js";
import { extractContent } from "../usecase/content-extractor.js";

const providers: ContentProvider[] = [githubProvider];

export async function handleCli(): Promise<void> {
  const cli = gunshi()
    .name("omniread")
    .description("CLI tool for reading any URL in AI-optimized format")
    .version("1.0.0")
    .argument("<url>", "URL to extract content from")
    .option("--help, -h", "Display help message")
    .action(async (url: string) => {
      // URL の妥当性をチェック
      if (!isValidUrl(url)) {
        console.error("Error: Invalid URL format");
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
    });

  await cli.run();
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
