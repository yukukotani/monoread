import { add } from "../libs/add.js";

export type CalculationResult =
  | { success: true; value: number }
  | { success: false; error: string };

export const calculate = (
  operation: string,
  a: number,
  b: number,
): CalculationResult => {
  switch (operation) {
    case "add":
    case "+":
      return { success: true, value: add(a, b) };
    case "subtract":
    case "-":
      return { success: true, value: a - b };
    case "multiply":
    case "*":
      return { success: true, value: a * b };
    case "divide":
    case "/":
      if (b === 0) {
        return { success: false, error: "Division by zero is not allowed" };
      }
      return { success: true, value: a / b };
    default:
      return { success: false, error: `Unknown operation: ${operation}` };
  }
};
