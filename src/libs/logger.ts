import pino from "pino";
import pretty from "pino-pretty";

export type LogLevel =
  | "silent"
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

function createRootLogger(): pino.Logger {
  const logLevel = process.env.MONOREAD_LOG_LEVEL || "silent";

  const prettyStream = pretty({
    colorize: false,
    ignore: "pid,hostname",
    destination:
      process.env.MONOREAD_LOG_FILE ||
      `${process.env.HOME}/.cache/monoread/monoread.log`,
  });

  return pino(
    {
      level: logLevel,
    },
    prettyStream,
  );
}

const rootLogger: pino.Logger = createRootLogger();

export function createLogger(name: string): pino.Logger {
  return rootLogger.child({ module: name });
}

export const setLogLevel = (level: LogLevel) => {
  rootLogger.level = level;
};
