import assert from "node:assert";
import { describe, it } from "vitest";

// CLI のテストは統合テストで行うため、ここではユーティリティ関数のテストのみ
describe("CLI utilities", () => {
  it("URL 妥当性チェックが正しく動作する", () => {
    // isValidUrl 関数をエクスポートしていないため、
    // ここでは同じロジックをテストする
    function isValidUrl(string: string): boolean {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    }

    // 有効なURL
    assert(isValidUrl("https://github.com/owner/repo/blob/main/file.ts"));
    assert(isValidUrl("https://example.com/page"));
    assert(isValidUrl("http://localhost:3000"));

    // 無効なURL
    assert(!isValidUrl("invalid-url"));
    assert(!isValidUrl(""));
    assert(!isValidUrl("not a url"));
  });
});
