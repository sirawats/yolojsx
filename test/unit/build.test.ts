import assert from "node:assert/strict";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  createBuildResourceBudgetPlugin,
  withTemporaryApplicationBuild,
} from "../../src/build.js";
import { resolveTheme } from "../../src/themes.js";
import { makeFixture } from "../helpers.js";

test("returns exact approved dependency text from stable reads", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const plugin = createBuildResourceBudgetPlugin(new Map());
  const load = plugin.load as (id: string) => Promise<unknown>;

  for (const [name, approved, replacement] of [
    [
      "dependency.js",
      `export const value = "approved";`,
      `export const value = "replacement";`,
    ],
    ["dependency.css", `.value{color:green}`, `.value{color:red}`],
    ["dependency.json", `{"value":"approved"}`, `{"value":"replacement"}`],
  ]) {
    const dependency = path.join(fixture, name);
    await writeFile(dependency, approved);
    const loaded = await load(dependency);
    await writeFile(dependency, replacement);
    assert.equal(loaded, approved);
  }

  const queried = path.join(fixture, "queried.js");
  await writeFile(queried, `export default "raw source";`);
  assert.equal(await load(`${queried}?raw`), null);
});

test("rejects queried and binary resources changed after Vite loads them", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const plugin = createBuildResourceBudgetPlugin(new Map());
  const load = plugin.load as (id: string) => Promise<unknown>;
  const transform = plugin.transform as (
    source: string,
    id: string,
  ) => Promise<unknown>;

  for (const id of [
    `${path.join(fixture, "resource.txt")}?raw`,
    path.join(fixture, "resource.bin"),
  ]) {
    const file = id.split("?", 1)[0];
    await writeFile(file, "approved");
    assert.equal(await load(id), null);
    await writeFile(file, "replaced");
    await assert.rejects(transform("export default null", id), /changed/);
  }
});

test("creates the Vite workspace beneath the worker-owned root", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const workspaceRoot = path.join(fixture, "worker");
  const entry = path.join(fixture, "App.jsx");
  await mkdir(workspaceRoot);
  await writeFile(entry, `export default () => <main>contained</main>;`);

  await withTemporaryApplicationBuild(
    {
      entry,
      base: "/",
      theme: resolveTheme("default"),
      workspaceRoot,
      onWarning() {},
    },
    (workspaceOutput) => {
      const relative = path.relative(workspaceRoot, workspaceOutput);
      assert.ok(relative && !relative.startsWith(`..${path.sep}`));
    },
  );
  assert.deepEqual(await readdir(workspaceRoot), []);
});
