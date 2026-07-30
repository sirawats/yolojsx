import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
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
    "Syntax.jsx": `export default function Broken( {`,
    "NoDefault.jsx": `export const Value = 1;`,
    "MissingDependency.jsx": `import value from "not-installed-anywhere"; export default () => <div>{value}</div>;`,
  });

  const syntax = await invoke(["Syntax.jsx", "-o", "syntax-out"], {
    cwd: fixture,
  });
  assert.equal(syntax.exitCode, 1);
  assert.match(syntax.stderr, /Syntax\.jsx/);

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
