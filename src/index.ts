import { handleCli, parseArgs } from "./presentation/cli.js";

const main = (): void => {
  const args = parseArgs(process.argv);
  handleCli(args);
};

main();
