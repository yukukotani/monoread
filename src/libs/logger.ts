import pino from "pino";

export interface Config {
  github?: {
    token?: string;
  };
  output?: {
    maxLength?: number;
  };
  providers?: {
    disabled?: string[];
  };
  logging?: {
    level?: "silent" | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    pretty?: boolean;
  };
}

export type LogLevel =
  | "silent"
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

// グローバルルートロガーインスタンス
let rootLogger: pino.Logger = pino({ level: "silent" });

export function initializeLogger(config?: Config) {
  const logLevel = config?.logging?.level || "silent";
  const prettyPrint = config?.logging?.pretty || false;

  const options: pino.LoggerOptions = {
    level: logLevel,
  };

  if (prettyPrint) {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    };
  }

  rootLogger = pino(options);
  return rootLogger;
}

export function getRootLogger(): pino.Logger {
  return rootLogger;
}

export function createChildLogger(name: string): pino.Logger {
  return rootLogger.child({ module: name });
}
