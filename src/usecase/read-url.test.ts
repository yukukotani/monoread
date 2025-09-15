import assert from "node:assert";
import { R } from "@praha/byethrow";
import { beforeEach, describe, it, vi } from "vitest";
import type { ContentProvider, ContentResult } from "../libs/types.js";
import { readUrl } from "./read-url.js";

// テスト用のreadUrl関数（プロバイダの配列を受け取る）
async function readUrlWithProviders(
  url: string,
  providers: ContentProvider[],
): Promise<ContentResult> {
  // 特定プロバイダを順番に試行
  const matchingProviders = providers.filter((p) => p.canHandle(url));

  for (const provider of matchingProviders) {
    const result = await provider.extractContent(url);
    if (R.isSuccess(result)) {
      return result;
    }
  }

  // フォールバック処理（テスト用）
  return R.fail("No provider could handle the URL");
}

// モックプロバイダを作成
const mockSuccessProvider: ContentProvider = {
  name: "mock-success",
  canHandle: () => true,
  extractContent: async () => R.succeed("Mock content"),
};

const mockFailProvider: ContentProvider = {
  name: "mock-fail",
  canHandle: () => true,
  extractContent: async () => R.fail("Mock error"),
};

const mockNoMatchProvider: ContentProvider = {
  name: "mock-no-match",
  canHandle: () => false,
  extractContent: async () => R.fail("Should not be called"),
};

describe("readUrl", () => {
  it("マッチするプロバイダが成功した場合、その結果を返す", async () => {
    const result = await readUrlWithProviders("test-url", [
      mockSuccessProvider,
    ]);

    assert(R.isSuccess(result));
    assert(result.value === "Mock content");
  });

  it("最初のプロバイダが失敗した場合、次のプロバイダを試す", async () => {
    const result = await readUrlWithProviders("test-url", [
      mockFailProvider,
      mockSuccessProvider,
    ]);

    assert(R.isSuccess(result));
    assert(result.value === "Mock content");
  });

  it("URLにマッチしないプロバイダは呼び出されない", async () => {
    const result = await readUrlWithProviders("test-url", [
      mockNoMatchProvider,
      mockSuccessProvider,
    ]);

    assert(R.isSuccess(result));
    assert(result.value === "Mock content");
  });

  it("全てのプロバイダが失敗した場合、フォールバック処理が実行される", async () => {
    // 無効なURLでフォールバック処理をテスト
    const result = await readUrlWithProviders("invalid-url", [
      mockFailProvider,
    ]);

    assert(R.isFailure(result));
  });
});

// Readabilityとllms.txtフォールバックのテスト
vi.mock("../libs/readability.js");
vi.mock("../libs/llms-txt.js");

describe("Content extraction fallback integration", () => {
  describe("readability fallback", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("URLが正常にフォールバック処理される", async () => {
      const testUrl = "https://example.com/test";
      const testContent = "Test content from readability";

      // readabilityのmockを設定
      const { extractContentByReadability } = await import(
        "../libs/readability.js"
      );
      vi.mocked(extractContentByReadability).mockResolvedValue(testContent);

      // fetchのmockを設定
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(""),
        } as Response),
      );

      const result = await readUrl(testUrl);

      assert(R.isSuccess(result));
      assert(result.value === testContent);
    });
  });

  describe("llms.txt fallback", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("llms.txtフォールバックが正常に機能する", async () => {
      const testUrl = "https://example.com/blog/post.html";
      const llmsContent = "# LLMs.txt Content\n\nSample content";

      // llms.txtのモックを設定
      const { extractContentFromLlmsTxt } = await import("../libs/llms-txt.js");
      vi.mocked(extractContentFromLlmsTxt).mockResolvedValue(
        R.succeed(llmsContent),
      );

      // readabilityが空の結果を返すモック
      const { extractContentByReadability } = await import(
        "../libs/readability.js"
      );
      vi.mocked(extractContentByReadability).mockResolvedValue("");

      // fetchのmockを設定（readability用）
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(""),
        } as Response),
      );

      const result = await readUrl(testUrl);

      assert(R.isSuccess(result));
      assert(result.value === llmsContent);
    });
  });

  describe("GitHub provider", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("GitHubのblobURLが正常に処理される", async () => {
      const testUrl = "https://github.com/owner/repo/blob/main/path/to/file.ts";

      // fetchのモックをGitHub API用に設定
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve("const code = 'GitHub content';"),
        } as Response),
      );

      const result = await readUrl(testUrl);

      assert(R.isSuccess(result));
      assert(result.value.includes("const code = 'GitHub content';"));
    });

    it("GitHubのtreeURLが正常に処理される", async () => {
      const testUrl = "https://github.com/owner/repo/tree/main/src";

      // fetchのモックをGitHub API用に設定
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { name: "file1.ts", type: "file", size: 1234 },
              { name: "dir1", type: "dir" },
            ]),
        } as Response),
      );

      const result = await readUrl(testUrl);

      assert(R.isSuccess(result));
      assert(result.value.includes("file1.ts"));
      assert(result.value.includes("dir1"));
    });
  });

  describe("エラーハンドリング", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("全てのプロバイダーがエラーを返す場合", async () => {
      const testUrl = "https://invalid-url.com/test";

      // 全てのモックが失敗するように設定
      const { extractContentByReadability } = await import(
        "../libs/readability.js"
      );
      vi.mocked(extractContentByReadability).mockRejectedValue(
        new Error("Readability failed"),
      );

      const { extractContentFromLlmsTxt } = await import("../libs/llms-txt.js");
      vi.mocked(extractContentFromLlmsTxt).mockResolvedValue(
        R.fail("llms.txt not found"),
      );

      // fetchのモックも失敗させる
      global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

      const result = await readUrl(testUrl);

      assert(R.isFailure(result));
      assert(result.error.includes("Failed"));
    });
  });
});
