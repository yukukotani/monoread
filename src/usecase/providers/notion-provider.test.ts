import assert from "node:assert";
import { afterEach, describe, it, vi } from "vitest";
import { createNotionProvider } from "./notion-provider.js";

const { mockFetchNotionPage, mockConvertPageToMarkdown } = vi.hoisted(() => ({
  mockFetchNotionPage: vi.fn(),
  mockConvertPageToMarkdown: vi.fn(),
}));

vi.mock("fetch-notion-page", () => ({
  fetchNotionPage: mockFetchNotionPage,
  convertPageToMarkdown: mockConvertPageToMarkdown,
}));

describe("notionProvider", () => {
  const notionProvider = createNotionProvider();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("canHandle", () => {
    it("NotionのページURLを正しく判定できる", () => {
      const validUrls = [
        "https://www.notion.so/My-Page-123abc456def789012345678901234",
        "https://notion.so/workspace/Page-Title-abc123def456",
        "https://www.notion.so/workspace/Page-Title-abc123def456?v=789",
        "https://notion.so/abc123def456789012345678901234",
        "https://example.notion.site/Page-Title-abc123def456",
        "https://my-workspace.notion.site/My-Page-123abc456def789012345678901234",
      ];

      for (const url of validUrls) {
        assert(notionProvider.canHandle(url), `Should handle: ${url}`);
      }
    });

    it("Notion以外のURLは判定を拒否する", () => {
      const invalidUrls = [
        "https://github.com/owner/repo",
        "https://example.com/page",
        "https://notion.com/page",
        "invalid-url",
      ];

      for (const url of invalidUrls) {
        assert(!notionProvider.canHandle(url), `Should not handle: ${url}`);
      }
    });
  });

  describe("extractContent", () => {
    it("APIキーが設定されていない場合はエラーを返す", async () => {
      const result = await notionProvider.extractContent(
        "https://notion.so/abc123def456",
      );

      assert(!result.success);
      assert(result.error.includes("NOTION_API_KEY"));
    });

    it("APIキーが設定されている場合、Notionページを取得してMarkdownに変換する", async () => {
      process.env.NOTION_API_KEY = "test-api-key";

      const mockPage = {
        id: "abc123",
        properties: {
          title: {
            title: [{ plain_text: "Test Page" }],
          },
        },
        children: [],
      };

      const mockMarkdown = "# Test Page\n\nThis is test content.";

      mockFetchNotionPage.mockResolvedValue({
        type: "Success",
        value: mockPage,
      });

      mockConvertPageToMarkdown.mockReturnValue(mockMarkdown);

      const result = await notionProvider.extractContent(
        "https://notion.so/abc123def456789012345678901234",
      );

      assert(result.success);
      assert.strictEqual(result.content, mockMarkdown);

      assert(mockFetchNotionPage.mock.calls.length === 1);
      assert(mockFetchNotionPage.mock.calls[0][0].includes("abc123def456"));
      assert(mockConvertPageToMarkdown.mock.calls.length === 1);
      assert.deepStrictEqual(
        mockConvertPageToMarkdown.mock.calls[0][0],
        mockPage,
      );

      delete process.env.NOTION_API_KEY;
    });

    it("fetchNotionPageがエラーを返した場合はエラーを返す", async () => {
      process.env.NOTION_API_KEY = "test-api-key";

      mockFetchNotionPage.mockResolvedValue({
        type: "Error",
        error: "Failed to fetch page",
      });

      const result = await notionProvider.extractContent(
        "https://notion.so/abc123def456",
      );

      assert(!result.success);
      assert(result.error.includes("Failed to fetch"));

      delete process.env.NOTION_API_KEY;
    });

    it("無効なURL形式の場合はエラーを返す", async () => {
      process.env.NOTION_API_KEY = "test-api-key";

      const result = await notionProvider.extractContent("invalid-notion-url");

      assert(!result.success);
      assert(result.error.includes("Invalid Notion URL"));

      delete process.env.NOTION_API_KEY;
    });
  });
});
