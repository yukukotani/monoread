import { describe, expect, it, vi } from "vitest";
import type { ContentResult } from "../../libs/types.js";
import { extractContent } from "../../usecase/content-extractor.js";

vi.mock("../../usecase/content-extractor.js");

describe("read_url_contentツール", () => {
  const mockedExtractContent = vi.mocked(extractContent);

  describe("正常系", () => {
    it("有効なURLでコンテンツを抽出できる", async () => {
      const mockContent = "This is the extracted content";
      const mockResult: ContentResult = {
        success: true,
        content: mockContent,
        metadata: {
          source: "https://example.com",
        },
      };

      mockedExtractContent.mockResolvedValue(mockResult);

      const result = await mockedExtractContent("https://example.com");

      expect(mockedExtractContent).toHaveBeenCalledWith("https://example.com");
      expect(result).toEqual(mockResult);
    });

    it("GitHub URLでコンテンツを抽出できる", async () => {
      const mockContent = "# README\n\nThis is a test repository";
      const mockResult: ContentResult = {
        success: true,
        content: mockContent,
        metadata: {
          source: "https://github.com/user/repo",
          fileName: "README.md",
          fileType: "markdown",
        },
      };

      mockedExtractContent.mockResolvedValue(mockResult);

      const result = await mockedExtractContent("https://github.com/user/repo");

      expect(mockedExtractContent).toHaveBeenCalledWith(
        "https://github.com/user/repo",
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("エラー系", () => {
    it("無効なURLでエラーを返す", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "Invalid URL format",
        errorType: "invalid_url",
      };

      mockedExtractContent.mockResolvedValue(mockResult);

      const result = await mockedExtractContent("not-a-valid-url");

      expect(mockedExtractContent).toHaveBeenCalledWith("not-a-valid-url");
      expect(result).toEqual(mockResult);
    });

    it("到達不可能なURLでエラーを返す", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "Failed to fetch URL: 404 Not Found",
        errorType: "not_found",
      };

      mockedExtractContent.mockResolvedValue(mockResult);

      const result = await mockedExtractContent(
        "https://example.com/not-found",
      );

      expect(mockedExtractContent).toHaveBeenCalledWith(
        "https://example.com/not-found",
      );
      expect(result).toEqual(mockResult);
    });

    it("ネットワークエラーを処理する", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "Failed to extract content: Network error",
        errorType: "network",
      };

      mockedExtractContent.mockResolvedValue(mockResult);

      const result = await mockedExtractContent("https://example.com");

      expect(mockedExtractContent).toHaveBeenCalledWith("https://example.com");
      expect(result).toEqual(mockResult);
    });

    it("コンテンツ抽出エラーを処理する", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "No content could be extracted from the page",
        errorType: "unknown",
      };

      mockedExtractContent.mockResolvedValue(mockResult);

      const result = await mockedExtractContent("https://example.com/empty");

      expect(mockedExtractContent).toHaveBeenCalledWith(
        "https://example.com/empty",
      );
      expect(result).toEqual(mockResult);
    });

    it("予期しないエラーを処理する", async () => {
      mockedExtractContent.mockRejectedValue(new Error("Unexpected error"));

      await expect(mockedExtractContent("https://example.com")).rejects.toThrow(
        "Unexpected error",
      );
    });
  });
});
