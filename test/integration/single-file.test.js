import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { readEmbeddedPayload } from "../../src/single-file.js";
import { invoke, makeFixture, writeFixture } from "../helpers.js";

test("builds a default and explicitly named single HTML file", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "pages/Home.jsx": `import { Button } from "antd";export default () => <main className="p-8"><Button>Single artifact</Button></main>;`,
  });

  const defaultBuild = await invoke(["pages/Home.jsx", "--single-file"], {
    cwd: fixture,
  });
  assert.equal(defaultBuild.exitCode, 0, defaultBuild.stderr);
  assert.match(defaultBuild.stdout, /Output: .*Home\.html/);
  assert.match(defaultBuild.stdout, /Size: \d+ bytes/);
  const defaultHtml = await readFile(path.join(fixture, "Home.html"), "utf8");
  const payload = readEmbeddedPayload(defaultHtml);
  assert.match(payload.script, /Single artifact/);
  assert.match(payload.styles.join("\n"), /\.p-8\{/);
  assert.ok(!(await readdir(fixture)).includes("dist"));

  const explicitBuild = await invoke(
    ["pages/Home.jsx", "--single-file", "--output", "public/index.html"],
    { cwd: fixture },
  );
  assert.equal(explicitBuild.exitCode, 0, explicitBuild.stderr);
  assert.ok(await readFile(path.join(fixture, "public/index.html"), "utf8"));
});

test("packs an existing build without changing its input", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div className="font-bold">Packed existing build</div>;`,
  });
  const build = await invoke(["Home.jsx"], { cwd: fixture });
  assert.equal(build.exitCode, 0, build.stderr);

  const beforeEntries = await readdir(path.join(fixture, "dist"), { recursive: true });
  const beforeHtml = await readFile(path.join(fixture, "dist/index.html"), "utf8");
  const packed = await invoke(
    ["pack", "dist", "--output", "index.html"],
    { cwd: fixture },
  );
  assert.equal(packed.exitCode, 0, packed.stderr);
  assert.match(packed.stdout, /Packed .*dist/);
  assert.match(
    readEmbeddedPayload(await readFile(path.join(fixture, "index.html"), "utf8")).script,
    /Packed existing build/,
  );
  assert.deepEqual(
    await readdir(path.join(fixture, "dist"), { recursive: true }),
    beforeEntries,
  );
  assert.equal(await readFile(path.join(fixture, "dist/index.html"), "utf8"), beforeHtml);
});

test("protects existing HTML and preserves it when a forced rebuild fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>Good</div>;`,
    "Home.html": "previous artifact",
  });

  const refused = await invoke(["Home.jsx", "--single-file"], { cwd: fixture });
  assert.equal(refused.exitCode, 1);
  assert.match(refused.stderr, /already exists/);
  assert.equal(await readFile(path.join(fixture, "Home.html"), "utf8"), "previous artifact");

  await writeFixture(fixture, { "Home.jsx": "export default function Broken( {" });
  const failed = await invoke(["Home.jsx", "--single-file", "--force"], {
    cwd: fixture,
  });
  assert.equal(failed.exitCode, 1);
  assert.equal(await readFile(path.join(fixture, "Home.html"), "utf8"), "previous artifact");
  assert.ok(
    !(await readdir(fixture)).some((name) => name.includes("yolojsx-stage")),
  );

  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>Forced replacement</div>;`,
  });
  const replaced = await invoke(["Home.jsx", "--single-file", "--force"], {
    cwd: fixture,
  });
  assert.equal(replaced.exitCode, 0, replaced.stderr);
  assert.match(replaced.stderr, /replacing existing HTML/);
  assert.match(
    readEmbeddedPayload(await readFile(path.join(fixture, "Home.html"), "utf8")).script,
    /Forced replacement/,
  );
  assert.ok(
    !(await readdir(fixture)).some((name) => name.includes("yolojsx-backup")),
  );
});

test("rejects unsafe pack destinations and unsupported chunks", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "dist/index.html": `<!doctype html><html><head></head><body><script type="module" src="assets/app.js"></script></body></html>`,
    "dist/assets/app.js": "document.body.dataset.ready='yes';",
    "dist/assets/lazy.js": "export default 1;",
  });

  const inside = await invoke(
    ["pack", "dist", "--output", "dist/packed.html", "--force"],
    { cwd: fixture },
  );
  assert.equal(inside.exitCode, 1);
  assert.match(inside.stderr, /inside its input directory/);

  const unsupported = await invoke(
    ["pack", "dist", "--output", "packed.html"],
    { cwd: fixture },
  );
  assert.equal(unsupported.exitCode, 1);
  assert.match(unsupported.stderr, /found 2/);
  await assert.rejects(readFile(path.join(fixture, "packed.html")), /ENOENT/);
});
