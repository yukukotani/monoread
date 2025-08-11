import { extractContentFromLlmsTxt } from "../../libs/llms-txt.js";
import type { ContentProvider, ContentResult } from "../../libs/types.js";

export function createLlmsTxtProvider(): ContentProvider {
  return {
    name: "llms-txt",
    canHandle(_url: string): boolean {
      return true;
    },
    async extractContent(url: string): Promise<ContentResult> {
      return await extractContentFromLlmsTxt(url);
    },
  };
}
