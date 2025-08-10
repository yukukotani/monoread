import { calculate } from "../usecase/calculator.js";

export const handleCli = (args: string[]): void => {
  if (args.length < 3) {
    console.log("Usage: calculator <operation> <number1> <number2>");
    console.log("Operations: add, subtract, multiply, divide (or +, -, *, /)");
    console.log("Example: calculator add 5 3");
    process.exit(1);
  }

  const operation = args[0];
  const num1Str = args[1];
  const num2Str = args[2];

  if (!operation || !num1Str || !num2Str) {
    console.error("Error: Missing required arguments");
    process.exit(1);
  }

  const num1 = Number.parseFloat(num1Str);
  const num2 = Number.parseFloat(num2Str);

  if (Number.isNaN(num1) || Number.isNaN(num2)) {
    console.error("Error: Please provide valid numbers");
    process.exit(1);
  }

  const result = calculate(operation, num1, num2);

  if (result.success) {
    console.log(`Result: ${result.value}`);
    process.exit(0);
  } else {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
};

export const parseArgs = (argv: string[]): string[] => {
  return argv.slice(2);
};
