import { assert, test } from "vitest";
import { calculate } from "./calculator.js";

test("calculate関数の加算テスト", () => {
  const result = calculate("add", 5, 3);

  assert(result.success === true);
  if (result.success) {
    assert(result.value === 8);
  }
});

test("calculate関数の減算テスト", () => {
  const result = calculate("subtract", 10, 4);

  assert(result.success === true);
  if (result.success) {
    assert(result.value === 6);
  }
});

test("calculate関数の乗算テスト", () => {
  const result = calculate("multiply", 6, 7);

  assert(result.success === true);
  if (result.success) {
    assert(result.value === 42);
  }
});

test("calculate関数の除算テスト", () => {
  const result = calculate("divide", 15, 3);

  assert(result.success === true);
  if (result.success) {
    assert(result.value === 5);
  }
});

test("ゼロ除算エラーテスト", () => {
  const result = calculate("divide", 10, 0);

  assert(result.success === false);
  if (!result.success) {
    assert(result.error === "Division by zero is not allowed");
  }
});

test("不正な演算子エラーテスト", () => {
  const result = calculate("invalid", 1, 2);

  assert(result.success === false);
  if (!result.success) {
    assert(result.error === "Unknown operation: invalid");
  }
});

test("記号での演算テスト", () => {
  const addResult = calculate("+", 2, 3);
  const subtractResult = calculate("-", 5, 2);
  const multiplyResult = calculate("*", 4, 3);
  const divideResult = calculate("/", 8, 2);

  assert(addResult.success === true);
  assert(subtractResult.success === true);
  assert(multiplyResult.success === true);
  assert(divideResult.success === true);

  if (addResult.success) assert(addResult.value === 5);
  if (subtractResult.success) assert(subtractResult.value === 3);
  if (multiplyResult.success) assert(multiplyResult.value === 12);
  if (divideResult.success) assert(divideResult.value === 4);
});
