import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/dashboardUtils.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } });
const { sumAmounts, subtractAmounts, subscribeLocalDate, dateKey } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("cent totals do not incorrectly exceed the budget", () => {
  const spent = sumAmounts([{ amount: 0.1 }, { amount: 0.2 }]);
  assert.equal(spent, 0.3);
  assert.equal(subtractAmounts(0.3, spent), 0);
  assert.equal(subtractAmounts(0.2, spent), -0.1);
  assert.equal(sumAmounts([]), 0);
});

test("local dates update across midnight and on focus after sleep, and stop on unmount", (t) => {
  const target = new EventTarget();
  const originalWindow = globalThis.window;
  globalThis.window = target;
  t.after(() => { globalThis.window = originalWindow; });
  const beforeMidnight = new Date(2026, 10, 30, 23, 59, 50);
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: beforeMidnight });
  const dates = [];
  const unsubscribe = subscribeLocalDate((date) => dates.push(date));
  t.mock.timers.tick(30000);
  assert.equal(dates.at(-1), "2026-12-01");
  t.mock.timers.setTime(new Date(2027, 0, 1, 9).getTime());
  target.dispatchEvent(new Event("focus"));
  assert.equal(dates.at(-1), "2027-01-01");
  unsubscribe();
  const count = dates.length;
  t.mock.timers.tick(60000);
  target.dispatchEvent(new Event("focus"));
  assert.equal(dates.length, count);
  assert.equal(dateKey(new Date(2026, 0, 2, 0, 30)), "2026-01-02");
});
