import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

// Execute the production TypeScript helper without adding a test framework.
const source = await readFile(new URL("../src/lib/dashboardApi.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
});
const { dashboardRequest, DashboardApiError } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("dashboard mutations send cookie credentials and return server-confirmed data", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/v1/dashboard/tasks/task-id");
    assert.equal(options.method, "PATCH");
    assert.equal(options.credentials, "include");
    assert.equal(options.cache, "no-store");
    assert.deepEqual(JSON.parse(options.body), { completed: true });
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers["Idempotency-Key"], "submission-id");
    return Response.json({ id: "task-id", completed: true });
  });
  const saved = await dashboardRequest("/tasks/task-id", { method: "PATCH", body: { completed: true }, requestKey: "submission-id" });
  assert.deepEqual(saved, { id: "task-id", completed: true });
});

test("expired sessions are distinguishable from a server failure", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("", { status: 401 }));
  await assert.rejects(dashboardRequest(), (error) => error instanceof DashboardApiError && error.status === 401);
});

test("failed saves expose validation details instead of returning unsaved data", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ detail: [{ msg: "Amount must be positive" }] }, { status: 422 }));
  await assert.rejects(dashboardRequest("/transactions", { method: "POST", body: { amount: -1 } }), {
    status: 422, message: "Amount must be positive",
  });
});

test("database outage returns the useful server error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ detail: "Database temporarily unavailable" }, { status: 503 }));
  await assert.rejects(dashboardRequest(), { status: 503, message: "Database temporarily unavailable" });
});

test("invalid and unreachable responses reject rather than leaving a pending request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("not json"));
  await assert.rejects(dashboardRequest(), /invalid response/);
  fetch.mock.mockImplementation(async () => { throw new TypeError("Network error"); });
  await assert.rejects(dashboardRequest(), /Unable to reach the backend/);
});

test("a stalled response is aborted and becomes a retryable timeout error", async (t) => {
  const controller = new AbortController();
  t.mock.method(AbortSignal, "timeout", (duration) => {
    assert.equal(duration, 15000);
    return controller.signal;
  });
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => {
    return new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      controller.abort(new DOMException("Timed out", "TimeoutError"));
    });
  });
  await assert.rejects(dashboardRequest(), { status: 0, message: "The server took too long to respond. Please try again." });
});

test("unmount cancellation remains identifiable to the dashboard load handler", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => {
    controller.abort();
    signal.throwIfAborted();
  });
  await assert.rejects(dashboardRequest("", { signal: controller.signal }), { name: "AbortError" });
});
