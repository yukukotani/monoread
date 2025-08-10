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

function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  const validLevels: LogLevel[] = [
    "silent",
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
  ];

  if (envLevel && validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  return "silent";
}

function createRootLogger(): pino.Logger {
  const logLevel = getLogLevelFromEnv();
  const prettyPrint = logLevel !== "silent";

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

  return pino(options);
}

// グローバルルートロガーインスタンス（環境変数から初期化）
let rootLogger: pino.Logger = createRootLogger();

export function initializeLogger(config?: Config) {
  const logLevel = config?.logging?.level || getLogLevelFromEnv();
  const prettyPrint = config?.logging?.pretty ?? logLevel !== "silent";

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
