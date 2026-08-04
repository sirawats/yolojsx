import assert from "node:assert/strict";
import { readdir, rm, truncate } from "node:fs/promises";
import test from "node:test";
import { makeFixture, invoke, writeFixture } from "../helpers.js";

test("reports invocation, runtime, and entry validation failures", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, { "Home.txt": "not jsx" });

  const missing = await invoke([], { cwd: fixture });
  assert.equal(missing.exitCode, 1);
  assert.match(missing.stderr, /JSX or TSX entry file is required/);

  const extension = await invoke(["Home.txt"], { cwd: fixture });
  assert.equal(extension.exitCode, 1);
  assert.match(extension.stderr, /must be a .jsx or .tsx file/);

  const unsupported = await invoke(["--version"], {
    cwd: fixture,
    nodeVersion: "18.0.0",
  });
  assert.equal(unsupported.exitCode, 1);
  assert.match(unsupported.stderr, /requires \^20\.19\.0 \|\| >=22\.12\.0/);
});

test("retains source paths for syntax, export, and dependency failures", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));

  await writeFixture(fixture, {
    "Syntax.jsx": `export default function Broken( { // RTIFACT_SECRET_SOURCE_MARKER`,
    "NoDefault.jsx": `export const Value = 1;`,
    "MissingDependency.jsx": `import value from "not-installed-anywhere"; export default () => <div>{value}</div>;`,
  });

  const syntax = await invoke(["Syntax.jsx", "-o", "syntax-out"], {
    cwd: fixture,
  });
  assert.equal(syntax.exitCode, 1);
  assert.match(syntax.stderr, /Syntax\.jsx/);
  assert.doesNotMatch(syntax.stderr, /RTIFACT_SECRET_SOURCE_MARKER/);

  const missingExport = await invoke(["NoDefault.jsx", "-o", "export-out"], {
    cwd: fixture,
  });
  assert.equal(missingExport.exitCode, 1);
  assert.match(missingExport.stderr, /NoDefault\.jsx/);
  assert.match(missingExport.stderr, /default/i);

  const dependency = await invoke(
    ["MissingDependency.jsx", "-o", "dependency-out"],
    { cwd: fixture },
  );
  assert.equal(dependency.exitCode, 1);
  assert.match(dependency.stderr, /not-installed-anywhere/);
  assert.match(dependency.stderr, /MissingDependency\.jsx/);
});

test("rejects oversized reachable Tailwind sources before scanning", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `import "./Generated.jsx"; export default () => <div />;`,
    "Generated.jsx": "x".repeat(4 * 1024 * 1024 + 1),
  });

  const result = await invoke(["App.jsx", "--out-dir", "dist"], {
    cwd: fixture,
  });
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Tailwind source graph file exceeds 4 MiB/);
  assert.ok(!(await readdir(fixture)).includes("dist"));
  assert.ok(
    !(await readdir(fixture)).some((name) =>
      name.startsWith(".rtifact-stage-"),
    ),
  );
});

test("rejects oversized production resources in every output mode", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `import image from "./large.png"; export default () => <img src={image} />;`,
    "large.png": "",
  });
  await truncate(`${fixture}/large.png`, 16 * 1024 * 1024 + 1);

  for (const args of [
    ["App.jsx"],
    ["App.jsx", "--self-contained", "--output", "offline.html"],
    ["App.jsx", "--out-dir", "dist"],
  ]) {
    const result = await invoke(args, { cwd: fixture });
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /build resource exceeds 16 MiB.*large\.png/is);
  }
  assert.ok(!(await readdir(fixture)).includes("App.html"));
  assert.ok(!(await readdir(fixture)).includes("offline.html"));
  assert.ok(!(await readdir(fixture)).includes("dist"));
});

test("rejects a reachable graph over the file-count limit", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const imports: string[] = [];
  for (let start = 0; start < 2_000; start += 100) {
    const files: Record<string, string> = {};
    for (let index = start; index < start + 100; index += 1) {
      files[`sources/${index}.js`] = `export const value${index}=${index};`;
      imports.push(`import "./sources/${index}.js";`);
    }
    await writeFixture(fixture, files);
  }
  await writeFixture(fixture, {
    "App.jsx": `${imports.join("\n")} export default () => <div />;`,
  });

  const result = await invoke(["App.jsx"], { cwd: fixture });
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /exceeds 2,000 files/);
  assert.ok(!(await readdir(fixture)).includes("App.html"));
});

test("rejects a reachable graph over the aggregate source limit", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const files: Record<string, string> = {};
  const imports: string[] = [];
  for (let index = 0; index < 9; index += 1) {
    files[`sources/${index}.js`] = `/*${"x".repeat(4 * 1024 * 1024 - 4)}*/`;
    imports.push(`import "./sources/${index}.js";`);
  }
  files["App.jsx"] = `${imports.join("\n")} export default () => <div />;`;
  await writeFixture(fixture, files);

  const result = await invoke(
    ["App.jsx", "--self-contained", "--output", "offline.html"],
    { cwd: fixture },
  );
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /exceeds 32 MiB in total/);
  assert.ok(!(await readdir(fixture)).includes("offline.html"));
});
