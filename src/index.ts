#!/usr/bin/env node

import { handleCli } from "./presentation/cli.js";

const main = async (): Promise<void> => {
  try {
    await handleCli();
  } catch (error) {
    console.error(
      "Unexpected error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

main();
