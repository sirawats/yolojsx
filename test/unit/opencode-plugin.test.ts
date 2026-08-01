import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import createPlugin from "../../.opencode/plugins/rtifact.mjs";

test("registers the canonical rtifact skills once", async () => {
  const plugin = await createPlugin();
  const config: { skills?: { paths: string[] } } = {};

  await plugin.config(config);
  await plugin.config(config);

  assert.deepEqual(config.skills?.paths, [
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../skills"),
  ]);
});
