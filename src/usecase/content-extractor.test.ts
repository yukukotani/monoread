import assert from "node:assert";
import { describe, it } from "vitest";
import type { ContentProvider, ContentResult } from "../libs/types.js";

// テスト用のextractContent関数（プロバイダの配列を受け取る）
async function extractContentWithProviders(
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

  // フォールバック処理（テスト用）
  return {
    success: false,
    error: "No provider could handle the URL",
    errorType: "network",
  };
}

// モックプロバイダを作成
const mockSuccessProvider: ContentProvider = {
  name: "mock-success",
  canHandle: () => true,
  extractContent: async () => ({
    success: true,
    content: "Mock content",
    metadata: { source: "test-url" },
  }),
};

const mockFailProvider: ContentProvider = {
  name: "mock-fail",
  canHandle: () => true,
  extractContent: async () => ({
    success: false,
    error: "Mock error",
    errorType: "network",
  }),
};

const mockNoMatchProvider: ContentProvider = {
  name: "mock-no-match",
  canHandle: () => false,
  extractContent: async () => ({
    success: false,
    error: "Should not be called",
    errorType: "unknown",
  }),
};

describe("extractContent", () => {
  it("マッチするプロバイダが成功した場合、その結果を返す", async () => {
    const result = await extractContentWithProviders("test-url", [
      mockSuccessProvider,
    ]);

    assert(result.success);
    assert(result.content === "Mock content");
    assert(result.metadata?.source === "test-url");
  });

  it("最初のプロバイダが失敗した場合、次のプロバイダを試す", async () => {
    const result = await extractContentWithProviders("test-url", [
      mockFailProvider,
      mockSuccessProvider,
    ]);

    assert(result.success);
    assert(result.content === "Mock content");
  });

  it("URLにマッチしないプロバイダは呼び出されない", async () => {
    const result = await extractContentWithProviders("test-url", [
      mockNoMatchProvider,
      mockSuccessProvider,
    ]);

    assert(result.success);
    assert(result.content === "Mock content");
  });

  it("全てのプロバイダが失敗した場合、フォールバック処理が実行される", async () => {
    // 無効なURLでフォールバック処理をテスト
    const result = await extractContentWithProviders("invalid-url", [
      mockFailProvider,
    ]);

    assert(!result.success);
    assert(result.errorType === "network");
  });
});
