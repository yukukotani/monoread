import pino from "pino";
import type { LogLevel } from "../../libs/logger.js";

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

function createMcpRootLogger(): pino.Logger {
  const logLevel = getLogLevelFromEnv();

  const options: pino.LoggerOptions = {
    level: logLevel,
  };

  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      destination: 2,
    },
  };

  return pino(options);
}

const mcpRootLogger: pino.Logger = createMcpRootLogger();

export function createMcpLogger(name: string): pino.Logger {
  return mcpRootLogger.child({ module: name });
}
