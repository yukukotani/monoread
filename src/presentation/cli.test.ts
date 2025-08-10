import { assert, test } from "vitest";
import { parseArgs } from "./cli.js";

test("parseArgs関数がコマンドライン引数を正しく解析する", () => {
  const argv = ["node", "script.js", "add", "5", "3"];
  const result = parseArgs(argv);

  assert(result.length === 3);
  assert(result[0] === "add");
  assert(result[1] === "5");
  assert(result[2] === "3");
});

test("parseArgs関数が空の引数を正しく処理する", () => {
  const argv = ["node", "script.js"];
  const result = parseArgs(argv);

  assert(result.length === 0);
});
