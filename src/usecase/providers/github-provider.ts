import { createLogger } from "../../libs/logger.js";
import type { ContentProvider, ContentResult } from "../../libs/types.js";

export const createGithubProvider = (): ContentProvider => {
  return {
    name: "github",

    canHandle(url: string): boolean {
      const canHandle = /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\//.test(
        url,
      );
      return canHandle;
    },

    async extractContent(url: string): Promise<ContentResult> {
      const logger = createLogger("github-provider");

      logger.info({ url }, "GitHub provider extracting content");

      try {
        // GitHubのblobURLをAPIのパスに変換
        const apiUrl = convertBlobUrlToApiUrl(url);

        if (!apiUrl) {
          return {
            success: false,
            error: "Invalid GitHub blob URL format",
          };
        }

        logger.debug({ apiUrl }, "Fetching from GitHub API");

        const response = await fetch(apiUrl, {
          headers: {
            Accept: "application/vnd.github.raw+json",
            "User-Agent": "yukukotani/monoread",
          },
        });

        if (!response.ok) {
          logger.warn(
            {
              status: response.status,
              statusText: response.statusText,
              apiUrl,
            },
            "GitHub API request failed",
          );

          if (response.status === 404) {
            return {
              success: false,
              error: "GitHub file not found",
            };
          }

          if (response.status === 401 || response.status === 403) {
            return {
              success: false,
              error: "Access denied. This may be a private repository.",
            };
          }

          return {
            success: false,
            error: `GitHub API error: ${response.status} ${response.statusText}`,
          };
        }

        const content = await response.text();
        const urlInfo = parseGitHubUrl(url);

        if (!urlInfo.path) {
          return {
            success: false,
            error: "Invalid GitHub URL: missing file path",
          };
        }

        return {
          success: true,
          content,
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to fetch GitHub file: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  };
};

function convertBlobUrlToApiUrl(blobUrl: string): string | null {
  const match = blobUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
  );

  if (!match) {
    return null;
  }

  const [, owner, repo, branch, path] = match;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
}

function parseGitHubUrl(url: string) {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
  );

  if (!match) {
    throw new Error("Invalid GitHub URL format");
  }

  const [, owner, repo, branch, path] = match;
  return { owner, repo, branch, path };
}
