import assert from "node:assert/strict";
import test from "node:test";
import { cleanupDirectory } from "../../src/output.js";

test("reports cleanup failures without replacing the original failure", async () => {
  const failure = new Error("Original build failure.");

  await cleanupDirectory("\0", failure);

  assert.match(failure.message, /^Original build failure\./);
  assert.match(failure.message, /Cleanup also failed:/);
});

test("throws cleanup failures when there is no earlier failure", async () => {
  await assert.rejects(cleanupDirectory("\0"));
});
