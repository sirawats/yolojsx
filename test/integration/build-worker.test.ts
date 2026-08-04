import assert from "node:assert/strict";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { invoke, makeFixture, writeFixture } from "../helpers.js";

async function assertNoPublicationDebris(fixture: string) {
  const entries = await readdir(fixture);
  assert.deepEqual(
    entries.filter((name) => /rtifact-(?:stage|backup|job)/.test(name)),
    [],
  );
}

test("contains custom-theme exits and timeouts without publishing", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `export default function App(){return <main>safe</main>}`,
    "exit-theme.jsx": `process.exit(27); export default {};`,
    "hang-theme.jsx": `while (true) {} export default {};`,
    "result.html": "previous file",
    "dist/previous.txt": "previous directory",
  });

  const exited = await invoke(
    [
      "App.jsx",
      "--theme",
      "./exit-theme.jsx",
      "--output",
      "result.html",
      "--force",
    ],
    { cwd: fixture },
  );
  assert.equal(exited.exitCode, 1);
  assert.match(exited.stderr, /Build worker exited before completing/);
  assert.equal(
    await readFile(path.join(fixture, "result.html"), "utf8"),
    "previous file",
  );

  const timedOut = await invoke(
    ["App.jsx", "--theme", "./hang-theme.jsx", "--out-dir", "dist", "--force"],
    { cwd: fixture, workerOverrides: { timeoutMs: 100 } },
  );
  assert.equal(timedOut.exitCode, 1);
  assert.match(timedOut.stderr, /Build worker timed out/);
  assert.equal(
    await readFile(path.join(fixture, "dist/previous.txt"), "utf8"),
    "previous directory",
  );
  await assertNoPublicationDebris(fixture);
});

test("contains worker memory failure, malformed control data, and invalid output", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `export default function App(){return <main>safe</main>}`,
    "memory-theme.jsx": `const retained=[]; while(true) retained.push(new Array(1_000_000).fill("memory")); export default {};`,
    "result.html": "previous file",
  });

  const memory = await invoke(
    [
      "App.jsx",
      "--theme",
      "./memory-theme.jsx",
      "--output",
      "result.html",
      "--force",
    ],
    {
      cwd: fixture,
      workerOverrides: { maxOldSpaceSizeMiB: 32, timeoutMs: 10_000 },
    },
  );
  assert.equal(memory.exitCode, 1);
  assert.match(memory.stderr, /Build worker exited before completing/);
  assert.equal(
    await readFile(path.join(fixture, "result.html"), "utf8"),
    "previous file",
  );

  const malformedWorker = path.join(fixture, "malformed.mjs");
  await writeFile(
    malformedWorker,
    `import {writeFileSync} from "node:fs";\nfor await (const _ of process.stdin) {}\nprocess.stdout.write("noise");\nwriteFileSync(3, "not-json");`,
  );
  const malformed = await invoke(
    ["App.jsx", "--output", "result.html", "--force"],
    {
      cwd: fixture,
      workerOverrides: { workerEntrypoint: malformedWorker },
    },
  );
  assert.equal(malformed.exitCode, 1);
  assert.match(malformed.stderr, /malformed control data/);

  const oversizedWorker = path.join(fixture, "oversized.mjs");
  await writeFile(
    oversizedWorker,
    `import {writeFileSync} from "node:fs";\nfor await (const _ of process.stdin) {}\nwriteFileSync(3, "x".repeat(70 * 1024));`,
  );
  const oversized = await invoke(
    ["App.jsx", "--output", "result.html", "--force"],
    {
      cwd: fixture,
      workerOverrides: { workerEntrypoint: oversizedWorker },
    },
  );
  assert.equal(oversized.exitCode, 1);
  assert.match(oversized.stderr, /result exceeds the protocol limit/);

  const invalidWorker = path.join(fixture, "invalid.mjs");
  await writeFile(
    invalidWorker,
    `import {writeFileSync} from "node:fs";\nfor await (const _ of process.stdin) {}\nwriteFileSync(3, JSON.stringify({ok:true,kind:"file",relativePath:"prepared/missing.html",files:1,bytes:1,warnings:[]}));`,
  );
  const invalid = await invoke(
    ["App.jsx", "--output", "result.html", "--force"],
    {
      cwd: fixture,
      workerOverrides: { workerEntrypoint: invalidWorker },
    },
  );
  assert.equal(invalid.exitCode, 1);
  assert.equal(
    await readFile(path.join(fixture, "result.html"), "utf8"),
    "previous file",
  );
  await assertNoPublicationDebris(fixture);
});
