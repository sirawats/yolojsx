import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { makeFixture, invoke, readAsset, writeFixture } from "../helpers.js";

test("rebuilds managed output and protects unowned output", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div className="p-4">First</div>;`,
  });

  const first = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
  });
  assert.equal(first.exitCode, 0, first.stderr);
  await writeFixture(path.join(fixture, "dist"), { "stale.txt": "stale" });

  const declined = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
    confirmReplacement: async () => false,
  });
  assert.equal(declined.exitCode, 1);
  assert.match(declined.stderr, /Cancelled/);
  assert.ok((await readdir(path.join(fixture, "dist"))).includes("stale.txt"));

  const rebuild = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
    confirmReplacement: async () => true,
  });
  assert.equal(rebuild.exitCode, 0, rebuild.stderr);
  assert.ok(!(await readdir(path.join(fixture, "dist"))).includes("stale.txt"));

  await writeFixture(fixture, { "unowned/important.txt": "keep" });
  const refused = await invoke(["Home.jsx", "-o", "unowned"], { cwd: fixture });
  assert.equal(refused.exitCode, 1);
  assert.match(refused.stderr, /non-interactive.*--force/s);
  assert.equal(
    await readFile(path.join(fixture, "unowned/important.txt"), "utf8"),
    "keep",
  );

  const confirmed = await invoke(["Home.jsx", "-o", "unowned"], {
    cwd: fixture,
    confirmReplacement: async () => true,
  });
  assert.equal(confirmed.exitCode, 0, confirmed.stderr);
  assert.match(confirmed.stderr, /Warning: replacing unowned/);
  assert.ok(
    !(await readdir(path.join(fixture, "unowned"))).includes("important.txt"),
  );

  await writeFixture(fixture, {
    "unowned-force/important.txt": "replace again",
  });
  const forced = await invoke(["Home.jsx", "-o", "unowned-force", "--force"], {
    cwd: fixture,
  });
  assert.equal(forced.exitCode, 0, forced.stderr);
  assert.match(forced.stderr, /Warning: replacing unowned/);
  assert.ok(
    !(await readdir(path.join(fixture, "unowned-force"))).includes(
      "important.txt",
    ),
  );
});

test("rejects dangerous paths even with force", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "src/Home.jsx": `export default () => <div />;`,
  });

  const cwdOutput = await invoke(["src/Home.jsx", "-o", ".", "--force"], {
    cwd: fixture,
  });
  assert.equal(cwdOutput.exitCode, 1);
  assert.match(cwdOutput.stderr, /current working directory/);

  const sourceOutput = await invoke(["src/Home.jsx", "-o", "src", "--force"], {
    cwd: fixture,
  });
  assert.equal(sourceOutput.exitCode, 1);
  assert.match(sourceOutput.stderr, /contains the source entry/);
});

test("failed rebuild preserves successful output and cleans stages", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>Last good build</div>;`,
  });

  const first = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
  });
  assert.equal(first.exitCode, 0, first.stderr);
  const previousHtml = await readFile(
    path.join(fixture, "dist/index.html"),
    "utf8",
  );
  const previousJs = await readAsset(path.join(fixture, "dist"), ".js");

  await writeFixture(fixture, {
    "Home.jsx": `export default function Broken( {`,
  });
  const failed = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
    confirmReplacement: async () => true,
  });
  assert.equal(failed.exitCode, 1);
  assert.equal(
    await readFile(path.join(fixture, "dist/index.html"), "utf8"),
    previousHtml,
  );
  assert.equal(await readAsset(path.join(fixture, "dist"), ".js"), previousJs);
  assert.ok(
    !(await readdir(fixture)).some((name) =>
      name.startsWith(".yolojsx-stage-"),
    ),
  );
});
