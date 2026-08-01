import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { syncVersions } from "../../scripts/sync-versions.js";
import { makeFixture, writeFixture } from "../helpers.js";

test("synchronizes every package and plugin version", async (t) => {
  const root = await makeFixture("rtifact-versions-");
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFixture(root, {
    "package.json": '{"version":"1.2.3"}',
    "package-lock.json":
      '{"version":"1.0.0","packages":{"":{"version":"1.0.0"}}}',
    ".codex-plugin/plugin.json": '{"version":"1.0.0"}',
    ".claude-plugin/plugin.json": '{"version":"1.0.0"}',
    "gemini-extension.json": '{"version":"1.0.0"}',
  });

  await assert.rejects(
    syncVersions(root, { check: true }),
    /Version 1\.2\.3 is not synchronized/,
  );
  const result = await syncVersions(root);

  assert.deepEqual(result.changed, [
    "package-lock.json",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    "gemini-extension.json",
  ]);
  await syncVersions(root, { check: true });

  const lock = JSON.parse(
    await readFile(path.join(root, "package-lock.json"), "utf8"),
  ) as { version: string; packages: { "": { version: string } } };
  assert.equal(lock.version, "1.2.3");
  assert.equal(lock.packages[""].version, "1.2.3");
});
