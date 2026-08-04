import assert from "node:assert/strict";
import { readFile, readdir, rm, stat, symlink } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createCdnImportMap } from "../../src/dependencies.js";
import { readEmbeddedPayload } from "../../src/single-file.js";
import { invoke, makeFixture, writeFixture } from "../helpers.js";

test("builds a default and explicitly named single HTML file", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "pages/Home.jsx": `import { Button } from "antd";export default () => <main className="p-8"><Button>Single artifact</Button></main>;`,
  });

  const defaultBuild = await invoke(["pages/Home.jsx"], {
    cwd: fixture,
  });
  assert.equal(defaultBuild.exitCode, 0, defaultBuild.stderr);
  assert.match(defaultBuild.stdout, /Output: .*Home\.html/);
  assert.match(defaultBuild.stdout, /Size: \d+ bytes/);
  const defaultHtml = await readFile(path.join(fixture, "Home.html"), "utf8");
  const payload = readEmbeddedPayload(defaultHtml);
  assert.match(payload.script, /Single artifact/);
  assert.match(payload.styles.join("\n"), /\.p-8\{/);
  assert.deepEqual(payload.importMap, createCdnImportMap());
  assert.match(payload.script, /from"react"/);
  assert.match(payload.script, /from"antd"/);
  assert.ok(!(await readdir(fixture)).includes("dist"));

  const explicitBuild = await invoke(
    ["pages/Home.jsx", "--output", "public/index.html"],
    { cwd: fixture },
  );
  assert.equal(explicitBuild.exitCode, 0, explicitBuild.stderr);
  assert.ok(await readFile(path.join(fixture, "public/index.html"), "utf8"));

  const selfContained = await invoke(
    ["pages/Home.jsx", "--self-contained", "--output", "offline.html"],
    { cwd: fixture },
  );
  assert.equal(selfContained.exitCode, 0, selfContained.stderr);
  const offlinePayload = readEmbeddedPayload(
    await readFile(path.join(fixture, "offline.html"), "utf8"),
  );
  assert.equal(offlinePayload.importMap, undefined);
  assert.doesNotMatch(offlinePayload.script, /from"react"/);
});

test("packs an existing build without changing its input", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div className="font-bold">Packed existing build</div>;`,
  });
  const build = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
  });
  assert.equal(build.exitCode, 0, build.stderr);

  const beforeEntries = await readdir(path.join(fixture, "dist"), {
    recursive: true,
  });
  const beforeHtml = await readFile(
    path.join(fixture, "dist/index.html"),
    "utf8",
  );
  const packed = await invoke(["pack", "dist", "--output", "index.html"], {
    cwd: fixture,
  });
  assert.equal(packed.exitCode, 0, packed.stderr);
  assert.match(packed.stdout, /Packed .*dist/);
  const payload = readEmbeddedPayload(
    await readFile(path.join(fixture, "index.html"), "utf8"),
  );
  assert.match(payload.script, /Packed existing build/);
  assert.equal(payload.importMap, undefined);
  assert.deepEqual(
    await readdir(path.join(fixture, "dist"), { recursive: true }),
    beforeEntries,
  );
  assert.equal(
    await readFile(path.join(fixture, "dist/index.html"), "utf8"),
    beforeHtml,
  );
});

test("protects existing HTML and preserves it when a forced rebuild fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>Good</div>;`,
    "Home.html": "previous artifact",
  });

  const refused = await invoke(["Home.jsx"], { cwd: fixture });
  assert.equal(refused.exitCode, 1);
  assert.match(refused.stderr, /non-interactive.*--force/s);
  assert.equal(
    await readFile(path.join(fixture, "Home.html"), "utf8"),
    "previous artifact",
  );

  const declined = await invoke(["Home.jsx"], {
    cwd: fixture,
    confirmReplacement: async () => false,
  });
  assert.equal(declined.exitCode, 1);
  assert.match(declined.stderr, /Cancelled/);
  assert.equal(
    await readFile(path.join(fixture, "Home.html"), "utf8"),
    "previous artifact",
  );

  await writeFixture(fixture, {
    "Home.jsx": "export default function Broken( {",
  });
  const failed = await invoke(["Home.jsx"], {
    cwd: fixture,
    confirmReplacement: async () => true,
  });
  assert.equal(failed.exitCode, 1);
  assert.equal(
    await readFile(path.join(fixture, "Home.html"), "utf8"),
    "previous artifact",
  );
  assert.ok(
    !(await readdir(fixture)).some((name) => name.includes("rtifact-stage")),
  );

  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>Confirmed replacement</div>;`,
  });
  const confirmed = await invoke(["Home.jsx"], {
    cwd: fixture,
    confirmReplacement: async () => true,
  });
  assert.equal(confirmed.exitCode, 0, confirmed.stderr);
  assert.match(
    readEmbeddedPayload(await readFile(path.join(fixture, "Home.html"), "utf8"))
      .script,
    /Confirmed replacement/,
  );

  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>Forced replacement</div>;`,
  });
  const replaced = await invoke(["Home.jsx", "--force"], {
    cwd: fixture,
  });
  assert.equal(replaced.exitCode, 0, replaced.stderr);
  assert.match(replaced.stderr, /replacing existing HTML/);
  assert.match(
    readEmbeddedPayload(await readFile(path.join(fixture, "Home.html"), "utf8"))
      .script,
    /Forced replacement/,
  );
  assert.ok(
    !(await readdir(fixture)).some((name) => name.includes("rtifact-backup")),
  );
});

test("rejects an HTML output swapped for a symbolic link after authorization", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <div>New build</div>;`,
    "Home.html": "authorized output",
    "important.html": "must survive",
  });

  const result = await invoke(["Home.jsx"], {
    cwd: fixture,
    confirmReplacement: async () => {
      await rm(path.join(fixture, "Home.html"));
      await symlink("important.html", path.join(fixture, "Home.html"));
      return true;
    },
  });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /changed after it was authorized/i);
  assert.equal(
    await readFile(path.join(fixture, "important.html"), "utf8"),
    "must survive",
  );
});

test("accepts the deprecated single-file alias with a migration warning", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Legacy.jsx": `export default () => <div>Legacy alias</div>;`,
  });

  const result = await invoke(["Legacy.jsx", "--single-file"], {
    cwd: fixture,
  });
  assert.equal(result.exitCode, 0, result.stderr);
  assert.match(result.stderr, /--single-file is deprecated/);
  assert.ok(await readFile(path.join(fixture, "Legacy.html"), "utf8"));
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

test("keeps the self-contained APIDocs artifact below its regression budget", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "APIDocs.html");
  const result = await invoke(
    [
      path.resolve("examples/APIDocs.jsx"),
      "--self-contained",
      "--output",
      output,
    ],
    { cwd: path.resolve(".") },
  );
  assert.equal(result.exitCode, 0, result.stderr);
  assert.ok((await stat(output)).size < 450_000);
});
