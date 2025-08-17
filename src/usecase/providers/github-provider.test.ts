import assert from "node:assert";
import { describe, it } from "vitest";
import { createGithubProvider } from "./github-provider.js";

describe("githubProvider", () => {
  const githubProvider = createGithubProvider();

  describe("canHandle", () => {
    it("GitHubのblobURLを正しく判定できる", () => {
      const validUrls = [
        "https://github.com/owner/repo/blob/main/src/index.ts",
        "https://github.com/user/project/blob/develop/README.md",
        "https://github.com/org/app/blob/feature/branch/lib/utils.js",
      ];

      for (const url of validUrls) {
        assert(githubProvider.canHandle(url), `Should handle: ${url}`);
      }
    });

    it("GitHubのtreeURLを正しく判定できる", () => {
      const validUrls = [
        "https://github.com/owner/repo/tree/main",
        "https://github.com/owner/repo/tree/main/src",
        "https://github.com/user/project/tree/develop/docs",
        "https://github.com/org/app/tree/feature/branch/lib",
      ];

      for (const url of validUrls) {
        assert(githubProvider.canHandle(url), `Should handle: ${url}`);
      }
    });

    it("GitHubのblob/treeURL以外は判定を拒否する", () => {
      const invalidUrls = [
        "https://github.com/owner/repo",
        "https://gitlab.com/owner/repo/blob/main/file.txt",
        "https://example.com/file.txt",
        "invalid-url",
      ];

      for (const url of invalidUrls) {
        assert(!githubProvider.canHandle(url), `Should not handle: ${url}`);
      }
    });
  });

  describe("extractContent", () => {
    it("無効なURL形式の場合はエラーを返す", async () => {
      const result = await githubProvider.extractContent("invalid-url");

      assert(!result.success);
    });
  });
});
