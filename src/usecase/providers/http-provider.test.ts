import { R } from "@praha/byethrow";
import assert from "node:assert";
import { test } from "vitest";
import { createHttpProvider } from "./http-provider.js";

test("createHttpProvider should return a provider with correct name", () => {
  const provider = createHttpProvider();
  assert.strictEqual(provider.name, "http");
});

test("createHttpProvider canHandle should return true for any URL", () => {
  const provider = createHttpProvider();
  assert.strictEqual(provider.canHandle("https://example.com"), true);
  assert.strictEqual(provider.canHandle("https://github.com"), true);
  assert.strictEqual(provider.canHandle("invalid-url"), true);
});

test("createHttpProvider extractContent should handle invalid URL", async () => {
  const provider = createHttpProvider();
  const result = await provider.extractContent("invalid-url");

  assert(R.isFailure(result));
  if (R.isFailure(result)) {
    assert.match(result.error, /HTTP extraction failed/);
  }
});
