import { Result } from "@praha/byethrow";
import { readUrl } from "./usecase/read-url.js";

export async function monoread(url: string): Promise<string> {
  const res = await readUrl(url);

  return Result.unwrap(res);
}
