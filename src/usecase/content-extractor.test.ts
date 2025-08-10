import assert from "node:assert";
import { describe, it } from "vitest";
import type { ContentProvider } from "../libs/types.js";
import { extractContent } from "./content-extractor.js";

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
    const result = await extractContent("test-url", [mockSuccessProvider]);

    assert(result.success);
    assert(result.content === "Mock content");
    assert(result.metadata.source === "test-url");
  });

  it("最初のプロバイダが失敗した場合、次のプロバイダを試す", async () => {
    const result = await extractContent("test-url", [
      mockFailProvider,
      mockSuccessProvider,
    ]);

    assert(result.success);
    assert(result.content === "Mock content");
  });

  it("URLにマッチしないプロバイダは呼び出されない", async () => {
    const result = await extractContent("test-url", [
      mockNoMatchProvider,
      mockSuccessProvider,
    ]);

    assert(result.success);
    assert(result.content === "Mock content");
  });

  it("全てのプロバイダが失敗した場合、フォールバック処理が実行される", async () => {
    // 無効なURLでフォールバック処理をテスト
    const result = await extractContent("invalid-url", [mockFailProvider]);

    assert(!result.success);
    assert(result.errorType === "network");
  });
});
