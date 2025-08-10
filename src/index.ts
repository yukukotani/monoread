#!/usr/bin/env node

import { execute } from "./presentation/cli/cli.js";

const main = async (): Promise<void> => {
  await execute();
};

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
