import type { Result } from "@praha/byethrow";

export type ErrorType =
  | "network"
  | "not_found"
  | "auth"
  | "rate_limit"
  | "invalid_url"
  | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
  cause?: Error;
}

export type ContentResult = Result.Result<string, string>;

export interface ContentProvider {
  name: string;
  canHandle(url: string): boolean;
  extractContent(url: string): Promise<ContentResult>;
}
