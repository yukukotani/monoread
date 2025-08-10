import type { Args } from "gunshi";

export const globalArgs = {
  logLevel: {
    type: "enum",
    description: "Log level",
    choices: ["silent", "trace", "debug", "info", "warn", "error", "fatal"],
    default: "silent",
  },
} as const satisfies Args;
