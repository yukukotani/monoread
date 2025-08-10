#!/usr/bin/env node

import { execute } from "@oclif/core";

const main = async (): Promise<void> => {
  const isDev =
    process.env.NODE_ENV === "development" || process.argv.includes("--dev");

  await execute({
    dir: import.meta.url,
    development: isDev,
  });
};

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
