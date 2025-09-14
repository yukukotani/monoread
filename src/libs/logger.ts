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
  const envLevel = process.env.MONOREAD_LOG_LEVEL?.toLowerCase();
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

  return pino({
    level: logLevel,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: false,
        ignore: "pid,hostname",
        destination:
          process.env.MONOREAD_LOG_FILE || "~/.cache/monoread/monoread.log",
      },
    },
  });
}

const rootLogger: pino.Logger = createRootLogger();

export function createLogger(name: string): pino.Logger {
  return rootLogger.child({ module: name });
}

export const setLogLevel = (level: LogLevel) => {
  rootLogger.level = level;
};
