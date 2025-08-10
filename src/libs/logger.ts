import pino from "pino";

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

  const options: pino.LoggerOptions = {
    level: logLevel,
  };

  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };

  return pino(options);
}

const rootLogger: pino.Logger = createRootLogger();

export function createLogger(name: string): pino.Logger {
  return rootLogger.child({ module: name });
}

export const setLogLevel = (level: LogLevel) => {
  rootLogger.level = level;
};
