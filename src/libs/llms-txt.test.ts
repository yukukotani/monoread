import { describe, expect, it, vi, beforeEach } from "vitest";
import { 
  generateLlmsTxtUrl, 
  isReadabilityResultEmpty, 
  isValidLlmsTxtContent,
  extractContentFromLlmsTxt
} from "./llms-txt.js";

describe("generateLlmsTxtUrl", () => {
  it("should generate correct llms.txt URL for root path", () => {
    expect(generateLlmsTxtUrl("https://example.com/")).toBe(
      "https://example.com/llms.txt",
    );
  });

  it("should preserve subpath for directories", () => {
    expect(generateLlmsTxtUrl("https://docs.example.com/guide/")).toBe(
      "https://docs.example.com/guide/llms.txt",
    );
  });

  it("should handle file paths by converting to directory", () => {
    expect(generateLlmsTxtUrl("https://example.com/project/readme.md")).toBe(
      "https://example.com/project/llms.txt",
    );
  });

  it("should preserve multi-level subpaths", () => {
    expect(generateLlmsTxtUrl("https://api.example.com/v1/docs")).toBe(
      "https://api.example.com/v1/docs/llms.txt",
    );
  });

  it("should remove search parameters while preserving path", () => {
    expect(
      generateLlmsTxtUrl("https://example.com/page?param=value&foo=bar"),
    ).toBe("https://example.com/page/llms.txt");
  });

  it("should remove hash fragments while preserving path", () => {
    expect(
      generateLlmsTxtUrl("https://docs.example.com/guide/intro#section1"),
    ).toBe("https://docs.example.com/guide/intro/llms.txt");
  });

  it("should remove both search params and hash while preserving path", () => {
    expect(
      generateLlmsTxtUrl("https://api.example.com/v1/docs?v=1.2#auth"),
    ).toBe("https://api.example.com/v1/docs/llms.txt");
  });

  it("should handle path without trailing slash", () => {
    expect(generateLlmsTxtUrl("https://example.com/docs")).toBe(
      "https://example.com/docs/llms.txt",
    );
  });

  it("should handle nested paths", () => {
    expect(generateLlmsTxtUrl("https://example.com/a/b/c/d")).toBe(
      "https://example.com/a/b/c/d/llms.txt",
    );
  });

  it("should handle file extension paths correctly", () => {
    expect(generateLlmsTxtUrl("https://example.com/docs/api.html")).toBe(
      "https://example.com/docs/llms.txt",
    );
  });

  it("should return null for invalid URL", () => {
    expect(generateLlmsTxtUrl("invalid-url")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(generateLlmsTxtUrl("")).toBeNull();
  });

  it("should handle URLs with port numbers", () => {
    expect(generateLlmsTxtUrl("https://example.com:8080/docs/")).toBe(
      "https://example.com:8080/docs/llms.txt",
    );
  });
});

describe("isReadabilityResultEmpty", () => {
  it("should return true for empty string", () => {
    expect(isReadabilityResultEmpty("")).toBe(true);
  });

  it("should return true for whitespace only", () => {
    expect(isReadabilityResultEmpty("   \n\t   ")).toBe(true);
  });

  it("should return true for only spaces", () => {
    expect(isReadabilityResultEmpty("   ")).toBe(true);
  });

  it("should return true for only tabs", () => {
    expect(isReadabilityResultEmpty("\t\t\t")).toBe(true);
  });

  it("should return true for only newlines", () => {
    expect(isReadabilityResultEmpty("\n\n\n")).toBe(true);
  });

  it("should return false for valid content", () => {
    expect(isReadabilityResultEmpty("# Valid Content")).toBe(false);
  });

  it("should return false for content with leading/trailing whitespace", () => {
    expect(isReadabilityResultEmpty("  # Valid Content  ")).toBe(false);
  });

  it("should return false for single character", () => {
    expect(isReadabilityResultEmpty("a")).toBe(false);
  });
});

describe("isValidLlmsTxtContent", () => {
  it("should return false for empty string", () => {
    expect(isValidLlmsTxtContent("")).toBe(false);
  });

  it("should return false for whitespace only", () => {
    expect(isValidLlmsTxtContent("   \n\t   ")).toBe(false);
  });

  it("should return false for content with HTML tags", () => {
    expect(isValidLlmsTxtContent("<div>Hello World</div>")).toBe(false);
  });

  it("should return false for content with script tags", () => {
    expect(isValidLlmsTxtContent("<script>alert('hello')</script>")).toBe(
      false,
    );
  });

  it("should return false for content shorter than 10 characters", () => {
    expect(isValidLlmsTxtContent("short")).toBe(false);
  });

  it("should return true for valid Markdown content", () => {
    expect(isValidLlmsTxtContent("# Valid Markdown Content")).toBe(true);
  });

  it("should return true for plain text content", () => {
    expect(
      isValidLlmsTxtContent("This is a valid plain text content for llms.txt"),
    ).toBe(true);
  });

  it("should return true for content with markdown formatting", () => {
    expect(
      isValidLlmsTxtContent(
        "# Title\n\n## Section\n\nThis is **bold** text with *italic* formatting.",
      ),
    ).toBe(true);
  });

  it("should return false for content with self-closing HTML tags", () => {
    expect(isValidLlmsTxtContent("Content with <br/> tag")).toBe(false);
  });

  it("should return true for content with angle brackets in text", () => {
    expect(isValidLlmsTxtContent("Compare a < b and b > c in this example")).toBe(
      true,
    );
  });
});

describe("extractContentFromLlmsTxt", () => {
  // グローバルfetchをモック
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore
    global.fetch = mockFetch;
  });

  it("should successfully extract llms.txt content", async () => {
    const mockContent = "# Example Project\n\nThis is an example llms.txt file with markdown content.";
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockContent,
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe(mockContent);
      expect(result.metadata.source).toBe("https://example.com/page");
      expect(result.metadata.fileType).toBe("llms-txt");
    }
    expect(mockFetch).toHaveBeenCalledWith("https://example.com/page/llms.txt");
  });

  it("should fail gracefully when llms.txt not found (404)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "Not Found",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("not_found");
      expect(result.error).toBe("llms.txt not found");
    }
  });

  it("should fail gracefully when llms.txt access denied (403)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("auth");
      expect(result.error).toBe("Access denied to llms.txt: 403");
    }
  });

  it("should fail gracefully when llms.txt server error (500)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("network");
      expect(result.error).toBe("Server error accessing llms.txt: 500");
    }
  });

  it("should fail when llms.txt content is empty", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("unknown");
      expect(result.error).toBe("llms.txt contains invalid or empty content");
    }
  });

  it("should fail when llms.txt content has HTML tags", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "<div>This is HTML content</div>",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("unknown");
      expect(result.error).toBe("llms.txt contains invalid or empty content");
    }
  });

  it("should fail when fetch throws an error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("network");
      expect(result.error).toBe("Failed to fetch llms.txt: Network error");
    }
  });

  it("should fail when URL is invalid for llms.txt generation", async () => {
    const result = await extractContentFromLlmsTxt("invalid-url");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("invalid_url");
      expect(result.error).toBe("Invalid URL for llms.txt generation");
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should extract content from subdirectory URL", async () => {
    const mockContent = "# Sub Project\n\nThis is from a subdirectory llms.txt file.";
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockContent,
    });

    const result = await extractContentFromLlmsTxt("https://docs.example.com/guide/intro#section");
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe(mockContent);
      expect(result.metadata.source).toBe("https://docs.example.com/guide/intro#section");
      expect(result.metadata.fileType).toBe("llms-txt");
    }
    expect(mockFetch).toHaveBeenCalledWith("https://docs.example.com/guide/intro/llms.txt");
  });
});

describe("extractContentFromLlmsTxt edge cases", () => {
  // グローバルfetchをモック
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore
    global.fetch = mockFetch;
  });

  it("should handle very large llms.txt file", async () => {
    // 大きなファイル（100KBのコンテンツ）をテスト
    const largeContent = `# Large Content\n\n${"This is a large content. ".repeat(4000)}`;
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => largeContent,
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe(largeContent.trim());
      expect(result.content.length).toBeGreaterThan(90000);
    }
  });

  it("should handle llms.txt with only whitespace", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "\n\n   \t\t   \n\n",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("unknown");
      expect(result.error).toBe("llms.txt contains invalid or empty content");
    }
  });

  it("should handle mixed content with HTML and markdown", async () => {
    const mixedContent = "# Valid Markdown\n\n<div>This should fail</div>\n\nMore content";
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mixedContent,
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("unknown");
      expect(result.error).toBe("llms.txt contains invalid or empty content");
    }
  });

  it("should handle complex URL with multiple path segments", async () => {
    const mockContent = "# Deep Path Content\n\nThis is from a deeply nested path.";
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockContent,
    });

    const result = await extractContentFromLlmsTxt("https://api.example.com/v1/docs/reference/auth.html?section=oauth#bearer-tokens");
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe(mockContent);
      expect(result.metadata.source).toBe("https://api.example.com/v1/docs/reference/auth.html?section=oauth#bearer-tokens");
    }
    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/v1/docs/reference/llms.txt");
  });

  it("should handle timeout errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("fetch timeout"));

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("network");
      expect(result.error).toBe("Failed to fetch llms.txt: fetch timeout");
    }
  });

  it("should handle redirect responses (302)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 302,
      text: async () => "Found",
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("network");
      expect(result.error).toBe("HTTP 302 when accessing llms.txt");
    }
  });

  it("should handle non-UTF8 content gracefully", async () => {
    // 非UTF8文字が含まれた場合のテスト（実際には文字化けしたコンテンツ）
    const nonUtf8Content = "# Valid Start\n\n\u00FF\u00FE\u00FD corrupt data \u0000";
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => nonUtf8Content,
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    // コンテンツが有効な長さなので成功するが、実際のユースケースではこのようなコンテンツは問題を引き起こす可能性がある
    expect(result.success).toBe(true);
  });

  it("should handle URL with unusual characters", async () => {
    const mockContent = "# Unicode Path Content\n\nContent from path with unicode characters.";
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockContent,
    });

    // 日本語を含むURL
    const result = await extractContentFromLlmsTxt("https://example.com/ドキュメント/ガイド.html");
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe(mockContent);
    }
    expect(mockFetch).toHaveBeenCalledWith("https://example.com/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/llms.txt");
  });

  it("should handle minimal valid content (exactly 10 characters)", async () => {
    const minimalContent = "1234567890"; // Exactly 10 characters
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => minimalContent,
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe(minimalContent);
    }
  });

  it("should fail with content just below minimum length", async () => {
    const shortContent = "123456789"; // 9 characters
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => shortContent,
    });

    const result = await extractContentFromLlmsTxt("https://example.com/page");
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("unknown");
      expect(result.error).toBe("llms.txt contains invalid or empty content");
    }
  });
});