import { assert, describe, test } from "vitest";
import { readCommand } from "./read-command.js";

describe("readCommand", () => {
  test("readCommand が定義されている", () => {
    assert(readCommand);
    assert.strictEqual(readCommand.name, "read");
  });

  test("silentオプションがデフォルトでfalseになっている", () => {
    assert.strictEqual(readCommand.args?.silent.default, false);
  });

  test("silentオプションの説明が正しい", () => {
    assert.strictEqual(
      readCommand.args?.silent.description,
      "Extract content but do not output the result",
    );
  });

  test("silentオプションの型がbooleanになっている", () => {
    assert.strictEqual(readCommand.args?.silent.type, "boolean");
  });
});
