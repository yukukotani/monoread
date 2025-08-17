import { createLogger } from "../../libs/logger.js";
import type { ContentProvider, ContentResult } from "../../libs/types.js";

export const createGithubProvider = (): ContentProvider => {
  return {
    name: "github",

    canHandle(url: string): boolean {
      const canHandle =
        /^https:\/\/github\.com\/[^/]+\/[^/]+\/(blob|tree)\//.test(url);
      return canHandle;
    },

    async extractContent(url: string): Promise<ContentResult> {
      const logger = createLogger("github-provider");

      logger.info({ url }, "GitHub provider extracting content");

      try {
        const isTreeUrl = url.includes("/tree/");

        if (isTreeUrl) {
          return await extractTreeContent(url, logger);
        }

        return await extractBlobContent(url, logger);
      } catch (error) {
        return {
          success: false,
          error: `Failed to fetch GitHub content: ${error instanceof Error ? error.message : String(error)}`,
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

function parseGitHubTreeUrl(url: string) {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/(.*))?$/,
  );

  if (!match) {
    throw new Error("Invalid GitHub tree URL format");
  }

  const [, owner, repo, branch, path = ""] = match;
  return { owner, repo, branch, path };
}

function convertTreeUrlToApiUrl(treeUrl: string): string | null {
  try {
    const { owner, repo, branch, path } = parseGitHubTreeUrl(treeUrl);
    const apiPath = path ? `/${path}` : "";
    return `https://api.github.com/repos/${owner}/${repo}/contents${apiPath}?ref=${branch}`;
  } catch {
    return null;
  }
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  url?: string;
  html_url?: string;
  download_url?: string;
}

async function extractBlobContent(
  url: string,
  logger: ReturnType<typeof createLogger>,
): Promise<ContentResult> {
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

    const fileContent = await response.text();
    const urlInfo = parseGitHubUrl(url);

    if (!urlInfo.path) {
      return {
        success: false,
        error: "Invalid GitHub URL: missing file path",
      };
    }

    const filePath = `/${urlInfo.path}`;

    let content = `<repository>\n${urlInfo.owner}/${urlInfo.repo}\n</repository>\n\n`;
    content += `<path>\n${filePath}\n</path>\n\n`;
    content += `<content>\n${fileContent}\n</content>`;

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
}

async function extractTreeContent(
  url: string,
  logger: ReturnType<typeof createLogger>,
): Promise<ContentResult> {
  try {
    const apiUrl = convertTreeUrlToApiUrl(url);

    if (!apiUrl) {
      return {
        success: false,
        error: "Invalid GitHub tree URL format",
      };
    }

    logger.debug({ apiUrl }, "Fetching directory contents from GitHub API");

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
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
          error: "GitHub directory not found",
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

    const items = (await response.json()) as GitHubContentItem[];

    // ファイルとディレクトリを分けてソート
    const dirs = items
      .filter((item) => item.type === "dir")
      .sort((a, b) => a.name.localeCompare(b.name));
    const files = items
      .filter((item) => item.type === "file")
      .sort((a, b) => a.name.localeCompare(b.name));

    // URLからパス部分を抽出
    const { owner, repo, path } = parseGitHubTreeUrl(url);

    // リポジトリ情報とパス情報を整形
    let content = `<repository>\n${owner}/${repo}\n</repository>\n\n`;
    content += `<path>\n${path ? `/${path}` : "/"}\n</path>\n\n<files>\n`;

    // ディレクトリを先に表示
    for (const dir of dirs) {
      content += `📁 ${dir.name}/\n`;
    }

    // ファイルを表示
    for (const file of files) {
      const size = file.size ? ` (${formatFileSize(file.size)})` : "";
      content += `📄 ${file.name}${size}\n`;
    }

    content += "</files>";

    // READMEファイルがある場合は内容を取得
    const readmeFile = files.find(
      (file) =>
        file.name.toLowerCase() === "readme.md" ||
        file.name.toLowerCase() === "readme.markdown" ||
        file.name.toLowerCase() === "readme.txt" ||
        file.name.toLowerCase() === "readme",
    );

    if (readmeFile?.download_url) {
      logger.debug(
        { readmeUrl: readmeFile.download_url },
        "Fetching README content",
      );

      try {
        const readmeResponse = await fetch(readmeFile.download_url);
        if (readmeResponse.ok) {
          const readmeContent = await readmeResponse.text();
          content += "\n\n<readme>\n";
          content += readmeContent;
          content += "\n</readme>";
        }
      } catch (error) {
        logger.warn({ error }, "Failed to fetch README content");
      }
    }

    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch GitHub directory: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}
