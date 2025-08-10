import { assert, describe, test } from "vitest";
import { execute } from "./cli.js";

describe("CLI", () => {
  test("execute関数が存在する", () => {
    assert(typeof execute === "function");
  });
});
