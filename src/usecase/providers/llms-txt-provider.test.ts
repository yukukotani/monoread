import assert from "node:assert";
import { R } from "@praha/byethrow";
import { test } from "vitest";
import { createLlmsTxtProvider } from "./llms-txt-provider.js";

test("createLlmsTxtProvider should return a provider with correct name", () => {
  const provider = createLlmsTxtProvider();
  assert.strictEqual(provider.name, "llms-txt");
});

test("createLlmsTxtProvider canHandle should return true for any URL", () => {
  const provider = createLlmsTxtProvider();
  assert.strictEqual(provider.canHandle("https://example.com"), true);
  assert.strictEqual(provider.canHandle("https://github.com"), true);
  assert.strictEqual(provider.canHandle("invalid-url"), true);
});

test("createLlmsTxtProvider extractContent should handle invalid URL", async () => {
  const provider = createLlmsTxtProvider();
  const result = await provider.extractContent("invalid-url");

  assert(R.isFailure(result));
  if (R.isFailure(result)) {
    assert.strictEqual(result.error, "Invalid URL for llms.txt generation");
  }
});
