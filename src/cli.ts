#!/usr/bin/env node

import { execute } from "./presentation/cli/cli.js";

const main = async (): Promise<void> => {
  await execute();
};

main();
