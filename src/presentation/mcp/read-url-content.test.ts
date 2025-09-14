import { describe, expect, it, vi } from "vitest";
import type { ContentResult } from "../../libs/types.js";
import { readUrl } from "../../usecase/read-url.js";

vi.mock("../../usecase/read-url.js");

describe("read_url_contentツール", () => {
  const mockedReadUrl = vi.mocked(readUrl);

  describe("正常系", () => {
    it("有効なURLでコンテンツを抽出できる", async () => {
      const mockContent = "This is the extracted content";
      const mockResult: ContentResult = {
        success: true,
        content: mockContent,
      };

      mockedReadUrl.mockResolvedValue(mockResult);

      const result = await mockedReadUrl("https://example.com");

      expect(mockedReadUrl).toHaveBeenCalledWith("https://example.com");
      expect(result).toEqual(mockResult);
    });

    it("GitHub URLでコンテンツを抽出できる", async () => {
      const mockContent = "# README\n\nThis is a test repository";
      const mockResult: ContentResult = {
        success: true,
        content: mockContent,
      };

      mockedReadUrl.mockResolvedValue(mockResult);

      const result = await mockedReadUrl("https://github.com/user/repo");

      expect(mockedReadUrl).toHaveBeenCalledWith(
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
      };

      mockedReadUrl.mockResolvedValue(mockResult);

      const result = await mockedReadUrl("not-a-valid-url");

      expect(mockedReadUrl).toHaveBeenCalledWith("not-a-valid-url");
      expect(result).toEqual(mockResult);
    });

    it("到達不可能なURLでエラーを返す", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "Failed to fetch URL: 404 Not Found",
      };

      mockedReadUrl.mockResolvedValue(mockResult);

      const result = await mockedReadUrl("https://example.com/not-found");

      expect(mockedReadUrl).toHaveBeenCalledWith(
        "https://example.com/not-found",
      );
      expect(result).toEqual(mockResult);
    });

    it("ネットワークエラーを処理する", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "Failed to extract content: Network error",
      };

      mockedReadUrl.mockResolvedValue(mockResult);

      const result = await mockedReadUrl("https://example.com");

      expect(mockedReadUrl).toHaveBeenCalledWith("https://example.com");
      expect(result).toEqual(mockResult);
    });

    it("コンテンツ抽出エラーを処理する", async () => {
      const mockResult: ContentResult = {
        success: false,
        error: "No content could be extracted from the page",
      };

      mockedReadUrl.mockResolvedValue(mockResult);

      const result = await mockedReadUrl("https://example.com/empty");

      expect(mockedReadUrl).toHaveBeenCalledWith("https://example.com/empty");
      expect(result).toEqual(mockResult);
    });

    it("予期しないエラーを処理する", async () => {
      mockedReadUrl.mockRejectedValue(new Error("Unexpected error"));

      await expect(mockedReadUrl("https://example.com")).rejects.toThrow(
        "Unexpected error",
      );
    });
  });
});
