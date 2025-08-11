import assert from "node:assert";
import { test } from "vitest";
import { createReadabilityProvider } from "./readability-provider.js";

test("createReadabilityProvider should return a provider with correct name", () => {
  const provider = createReadabilityProvider();
  assert.strictEqual(provider.name, "readability");
});

test("createReadabilityProvider canHandle should return true for any URL", () => {
  const provider = createReadabilityProvider();
  assert.strictEqual(provider.canHandle("https://example.com"), true);
  assert.strictEqual(provider.canHandle("https://github.com"), true);
  assert.strictEqual(provider.canHandle("invalid-url"), true);
});

test("createReadabilityProvider extractContent should handle invalid URL", async () => {
  const provider = createReadabilityProvider();
  const result = await provider.extractContent("invalid-url");

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Readability extraction failed/);
  }
});
