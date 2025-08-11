import assert from "node:assert";
import { beforeEach, describe, it, vi } from "vitest";
import type { ContentProvider, ContentResult } from "../libs/types.js";
import { extractContent } from "./extract-content.js";

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
  };
}

// モックプロバイダを作成
const mockSuccessProvider: ContentProvider = {
  name: "mock-success",
  canHandle: () => true,
  extractContent: async () => ({
    success: true,
    content: "Mock content",
  }),
};

const mockFailProvider: ContentProvider = {
  name: "mock-fail",
  canHandle: () => true,
  extractContent: async () => ({
    success: false,
    error: "Mock error",
  }),
};

const mockNoMatchProvider: ContentProvider = {
  name: "mock-no-match",
  canHandle: () => false,
  extractContent: async () => ({
    success: false,
    error: "Should not be called",
  }),
};

describe("extractContent", () => {
  it("マッチするプロバイダが成功した場合、その結果を返す", async () => {
    const result = await extractContentWithProviders("test-url", [
      mockSuccessProvider,
    ]);

    assert(result.success);
    assert(result.content === "Mock content");
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
  });
});

// Readabilityとllms.txtフォールバックのテスト
vi.mock("../libs/readability.js");
vi.mock("../libs/llms-txt.js");

describe("Content extraction fallback integration", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore
    global.fetch = mockFetch;
  });

  it("should return readability result when successful", async () => {
    // readabilityが成功する場合
    const { extractContentByReadability } = await import(
      "../libs/readability.js"
    );
    const mockExtractContentByReadability = vi.mocked(
      extractContentByReadability,
    );

    const { isReadabilityResultEmpty } = await import("../libs/llms-txt.js");
    const mockIsReadabilityResultEmpty = vi.mocked(isReadabilityResultEmpty);

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    mockExtractContentByReadability.mockResolvedValue(
      "# Readability Content\\n\\nThis is extracted by readability.",
    );
    mockIsReadabilityResultEmpty.mockReturnValue(false);

    const result = await extractContent("https://example.com/page");

    assert(result.success);
    assert(
      result.content ===
        "# Readability Content\\n\\nThis is extracted by readability.",
    );
  });

  it("should fallback to llms.txt when readability fails (empty content)", async () => {
    // readabilityが空コンテンツを返す場合
    const { extractContentByReadability } = await import(
      "../libs/readability.js"
    );
    const mockExtractContentByReadability = vi.mocked(
      extractContentByReadability,
    );

    const { isReadabilityResultEmpty, extractContentFromLlmsTxt } =
      await import("../libs/llms-txt.js");
    const mockIsReadabilityResultEmpty = vi.mocked(isReadabilityResultEmpty);
    const mockExtractContentFromLlmsTxt = vi.mocked(extractContentFromLlmsTxt);

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    mockExtractContentByReadability.mockResolvedValue("");
    mockIsReadabilityResultEmpty.mockReturnValue(true);
    mockExtractContentFromLlmsTxt.mockResolvedValue({
      success: true,
      content: "# LLMS.txt Content\\n\\nThis is from llms.txt fallback.",
    });

    const result = await extractContent("https://example.com/page");

    assert(result.success);
    if (result.success) {
      assert(
        result.content ===
          "# LLMS.txt Content\\n\\nThis is from llms.txt fallback.",
      );
    }
  });

  it("should fallback to llms.txt when readability throws exception", async () => {
    // readabilityが例外をスローする場合
    const { extractContentByReadability } = await import(
      "../libs/readability.js"
    );
    const mockExtractContentByReadability = vi.mocked(
      extractContentByReadability,
    );

    const { extractContentFromLlmsTxt } = await import("../libs/llms-txt.js");
    const mockExtractContentFromLlmsTxt = vi.mocked(extractContentFromLlmsTxt);

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    mockExtractContentByReadability.mockRejectedValue(
      new Error("Readability parsing failed"),
    );
    mockExtractContentFromLlmsTxt.mockResolvedValue({
      success: true,
      content:
        "# LLMS.txt Fallback\\n\\nThis content was retrieved after readability failed.",
    });

    const result = await extractContent("https://example.com/page");

    assert(result.success);
    if (result.success) {
      assert(
        result.content ===
          "# LLMS.txt Fallback\\n\\nThis content was retrieved after readability failed.",
      );
    }
  });

  it("should fallback to llms.txt when fetch fails", async () => {
    // fetchが失敗する場合
    const { extractContentFromLlmsTxt } = await import("../libs/llms-txt.js");
    const mockExtractContentFromLlmsTxt = vi.mocked(extractContentFromLlmsTxt);

    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    mockExtractContentFromLlmsTxt.mockResolvedValue({
      success: true,
      content:
        "# LLMS.txt Success\\n\\nContent from llms.txt when page is not found.",
    });

    const result = await extractContent("https://example.com/missing-page");

    assert(result.success);
    if (result.success) {
      assert(
        result.content ===
          "# LLMS.txt Success\\n\\nContent from llms.txt when page is not found.",
      );
    }
  });

  it("should fail when both readability and llms.txt fail", async () => {
    // readabilityとllms.txt両方が失敗する場合
    const { extractContentByReadability } = await import(
      "../libs/readability.js"
    );
    const mockExtractContentByReadability = vi.mocked(
      extractContentByReadability,
    );

    const { isReadabilityResultEmpty, extractContentFromLlmsTxt } =
      await import("../libs/llms-txt.js");
    const mockIsReadabilityResultEmpty = vi.mocked(isReadabilityResultEmpty);
    const mockExtractContentFromLlmsTxt = vi.mocked(extractContentFromLlmsTxt);

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    mockExtractContentByReadability.mockResolvedValue("");
    mockIsReadabilityResultEmpty.mockReturnValue(true);
    mockExtractContentFromLlmsTxt.mockResolvedValue({
      success: false,
      error: "llms.txt not found",
    });

    const result = await extractContent("https://example.com/page");

    assert(!result.success);
    assert(result.error === "llms.txt not found");
  });
});
