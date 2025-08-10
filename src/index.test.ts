import { assert, describe, test } from "vitest";
import MonoreadCommand from "./index.js";

describe("MonoreadCommand", () => {
  test("引数が必要である", () => {
    assert(MonoreadCommand.args.url.required === true);
  });

  test("説明が設定されている", () => {
    assert(
      MonoreadCommand.description ===
        "CLI tool for reading any URL in AI-optimized format",
    );
  });

  test("isValidUrlメソッドが正しく動作する", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テスト用のコマンドインスタンス作成で必要
    const command = new MonoreadCommand([], {} as any);

    // 有効なURL
    // biome-ignore lint/suspicious/noExplicitAny: プライベートメソッドテストのため必要
    assert((command as any).isValidUrl("https://example.com") === true);
    // biome-ignore lint/suspicious/noExplicitAny: プライベートメソッドテストのため必要
    assert((command as any).isValidUrl("http://example.com") === true);

    // 無効なURL
    // biome-ignore lint/suspicious/noExplicitAny: プライベートメソッドテストのため必要
    assert((command as any).isValidUrl("invalid-url") === false);
    // biome-ignore lint/suspicious/noExplicitAny: プライベートメソッドテストのため必要
    assert((command as any).isValidUrl("") === false);
  });
});
