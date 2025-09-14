import pino from "pino";

export type LogLevel =
  | "silent"
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

function createRootLogger(): pino.Logger {
  return pino({
    level: process.env.MONOREAD_LOG_LEVEL || "silent",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: false,
        ignore: "pid,hostname",
        destination:
          process.env.MONOREAD_LOG_FILE || "~/.cache/monoread/monoread.log",
        mkdir: true,
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
