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

export function createLogger(config?: Config) {
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

  return pino(options);
}
