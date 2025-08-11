export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };

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

export type ContentResult =
  | { success: true; content: string }
  | { success: false; error: string; errorType: ErrorType };

export interface ContentProvider {
  name: string;
  canHandle(url: string): boolean;
  extractContent(url: string): Promise<ContentResult>;
}
