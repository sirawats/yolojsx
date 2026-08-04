import assert from "node:assert/strict";
import { readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { cleanupPreparedOutput, runBuildJob } from "../../src/build-worker.js";

import { makeFixture, writeFixture } from "../helpers.js";

async function writeWorker(directory: string, body: string) {
  const worker = path.join(directory, `worker-${Math.random()}.mjs`);
  await writeFile(
    worker,
    `import { mkdir, symlink, truncate, writeFile } from "node:fs/promises";
import { createWriteStream, writeFileSync } from "node:fs";
import path from "node:path";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const job = JSON.parse(input);
await writeFile(job.inputDirectory ?? job.entry, job.workspace);
${body}\n`,
  );
  return worker;
}

const packJob = (workspaceRecord: string) => ({
  kind: "pack" as const,
  inputDirectory: workspaceRecord,
});

const directoryJob = (workspaceRecord: string) => ({
  kind: "directory" as const,
  cwd: path.dirname(workspaceRecord),
  entry: workspaceRecord,
  base: "/",
  theme: { kind: "preset" as const, value: "default" },
});

test("accepts only validated worker-prepared output", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const workspaceRecord = path.join(fixture, "workspace.txt");
  const worker = await writeWorker(
    fixture,
    `const relativePath = "prepared/artifact.html";
await mkdir(path.join(job.workspace, "prepared"), { recursive: true });
await writeFile(path.join(job.workspace, relativePath), "ok");
process.stdout.write("theme console output");
process.stderr.write("bounded diagnostic output");
await new Promise((resolve, reject) => {
  const stream = createWriteStream(null, { fd: 3 });
  stream.end(JSON.stringify({ ok: true, kind: "file", relativePath, files: 1, bytes: 2, warnings: [] }), resolve);
  stream.on("error", reject);
});`,
  );

  const prepared = await runBuildJob(packJob(workspaceRecord), {
    workerEntrypoint: worker,
    timeoutMs: 2_000,
  });
  assert.equal(await readFile(prepared.path, "utf8"), "ok");
  assert.equal(prepared.bytes, 2);
  await cleanupPreparedOutput(prepared);
  await assert.rejects(stat(prepared.workspace), { code: "ENOENT" });
});

test("contains worker exits, timeouts, malformed IPC, and invalid prepared output", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const cases = [
    {
      body: `await mkdir(path.join(job.workspace, "rtifact-work-abandoned"), { recursive: true });
await writeFile(path.join(job.workspace, "rtifact-work-abandoned/marker"), "partial");
process.exit(23);`,
      expected: /exited before completing/,
    },
    {
      body: `setInterval(() => {}, 1_000);`,
      expected: /timed out/,
      timeoutMs: 50,
    },
    { body: `writeFileSync(3, "not-json");`, expected: /malformed/ },
    {
      body: `writeFileSync(3, "x".repeat(70 * 1024));`,
      expected: /protocol limit/,
    },
    {
      body: `writeFileSync(3, JSON.stringify({ ok: true, kind: "file", relativePath: "../escape.html", files: 1, bytes: 0, warnings: [] }));`,
      expected: /outside its workspace/,
    },
    {
      body: `const relativePath = "prepared/artifact.html";
await mkdir(path.join(job.workspace, "prepared"), { recursive: true });
await writeFile(path.join(job.workspace, relativePath), "ok");
writeFileSync(3, JSON.stringify({ ok: true, kind: "file", relativePath, files: 1, bytes: 99, warnings: [] }));`,
      expected: /does not match disk/,
    },
    {
      body: `const relativePath = "prepared/artifact.html";
const external = path.join(path.dirname(job.inputDirectory), "external-output");
await mkdir(external, { recursive: true });
await writeFile(path.join(external, "artifact.html"), "escaped");
await symlink(external, path.join(job.workspace, "prepared"), process.platform === "win32" ? "junction" : "dir");
writeFileSync(3, JSON.stringify({ ok: true, kind: "file", relativePath, files: 1, bytes: 7, warnings: [] }));`,
      expected: /outside its workspace|symbolic-link ancestor/,
    },
  ];

  for (const [index, scenario] of cases.entries()) {
    const workspaceRecord = path.join(fixture, `workspace-${index}.txt`);
    const worker = await writeWorker(fixture, scenario.body);
    await assert.rejects(
      runBuildJob(packJob(workspaceRecord), {
        workerEntrypoint: worker,
        timeoutMs: scenario.timeoutMs ?? 2_000,
      }),
      scenario.expected,
    );
    if (!scenario.timeoutMs) {
      const workspace = await readFile(workspaceRecord, "utf8");
      await assert.rejects(stat(workspace), { code: "ENOENT" });
    }
  }
});

test("validates worker-prepared directory trees and metadata", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));

  const acceptedRecord = path.join(fixture, "accepted-workspace.txt");
  const acceptedWorker = await writeWorker(
    fixture,
    `const relativePath = "prepared/site";
const site = path.join(job.workspace, relativePath);
await mkdir(path.join(site, "assets"), { recursive: true });
await writeFile(path.join(site, "index.html"), "home");
await writeFile(path.join(site, "assets/app.js"), "js");
writeFileSync(3, JSON.stringify({ ok: true, kind: "directory", relativePath, files: 2, bytes: 6, warnings: [] }));`,
  );
  const prepared = await runBuildJob(directoryJob(acceptedRecord), {
    workerEntrypoint: acceptedWorker,
  });
  assert.equal(prepared.kind, "directory");
  assert.equal(prepared.files, 2);
  assert.equal(
    await readFile(path.join(prepared.path, "index.html"), "utf8"),
    "home",
  );
  await cleanupPreparedOutput(prepared);

  const cases = [
    {
      body: `const relativePath = "prepared/site";
const site = path.join(job.workspace, relativePath);
await mkdir(site, { recursive: true });
await writeFile(path.join(site, "target.txt"), "safe");
await symlink(path.join(site, "target.txt"), path.join(site, "linked.txt"));
writeFileSync(3, JSON.stringify({ ok: true, kind: "directory", relativePath, files: 2, bytes: 8, warnings: [] }));`,
      expected: /symbolic link/,
    },
    {
      body: `const relativePath = "prepared/site";
const site = path.join(job.workspace, relativePath);
await mkdir(site, { recursive: true });
await writeFile(path.join(site, "index.html"), "home");
writeFileSync(3, JSON.stringify({ ok: true, kind: "directory", relativePath, files: 2, bytes: 4, warnings: [] }));`,
      expected: /metadata that does not match disk/,
    },
    {
      body: `const relativePath = "prepared/site";
const site = path.join(job.workspace, relativePath);
await mkdir(site, { recursive: true });
const oversized = path.join(site, "oversized.bin");
await writeFile(oversized, "");
await truncate(oversized, 33 * 1024 * 1024);
writeFileSync(3, JSON.stringify({ ok: true, kind: "directory", relativePath, files: 1, bytes: 33 * 1024 * 1024, warnings: [] }));`,
      expected: /oversized output file/,
    },
    {
      body: `const relativePath = "prepared/site";
await mkdir(path.join(job.workspace, relativePath), { recursive: true });
writeFileSync(3, JSON.stringify({ ok: true, kind: "file", relativePath, files: 1, bytes: 0, warnings: [] }));`,
      expected: /wrong prepared-output kind/,
    },
  ];

  for (const [index, scenario] of cases.entries()) {
    const workspaceRecord = path.join(
      fixture,
      `directory-workspace-${index}.txt`,
    );
    const worker = await writeWorker(fixture, scenario.body);
    await assert.rejects(
      runBuildJob(directoryJob(workspaceRecord), { workerEntrypoint: worker }),
      scenario.expected,
    );
    const workspace = await readFile(workspaceRecord, "utf8");
    await assert.rejects(stat(workspace), { code: "ENOENT" });
  }
});

test("enforces warning, metric, request, and private override limits", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const protocolCases = [
    {
      result: `{ ok: true, kind: "file", relativePath, files: 1, bytes: 2, warnings: Array.from({length: 33}, () => "warning") }`,
      expected: /too many warnings/,
    },
    {
      result: `{ ok: true, kind: "file", relativePath, files: 1, bytes: 2, warnings: ["x".repeat(2049)] }`,
      expected: /oversized warning/,
    },
    {
      result: `{ ok: true, kind: "file", relativePath, files: 1, bytes: 2, warnings: Array.from({length: 9}, () => "x".repeat(2000)) }`,
      expected: /oversized warnings/,
    },
    {
      result: `{ ok: true, kind: "file", relativePath, files: 1, bytes: 2, warnings: [], metrics: { peakRssBytes: -1, peakHeapBytes: 1 } }`,
      expected: /invalid resource metrics/,
    },
  ];
  for (const [index, scenario] of protocolCases.entries()) {
    const workspaceRecord = path.join(
      fixture,
      `protocol-workspace-${index}.txt`,
    );
    const worker = await writeWorker(
      fixture,
      `const relativePath = "prepared/artifact.html";
await mkdir(path.join(job.workspace, "prepared"), { recursive: true });
await writeFile(path.join(job.workspace, relativePath), "ok");
writeFileSync(3, JSON.stringify(${scenario.result}));`,
    );
    await assert.rejects(
      runBuildJob(packJob(workspaceRecord), { workerEntrypoint: worker }),
      scenario.expected,
    );
  }

  await assert.rejects(
    runBuildJob(packJob(path.join(fixture, "invalid-limit.txt")), {
      timeoutMs: 0,
    }),
    /invalid private test limits/,
  );
  await assert.rejects(
    runBuildJob(packJob(`${fixture}/${"x".repeat(17 * 1024)}`), {
      workerEntrypoint: path.join(fixture, "unused.mjs"),
    }),
    /request exceeds the protocol limit/,
  );
});

test("accepts the exact result limit and rejects the next byte", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const result = JSON.stringify({
    ok: true,
    kind: "file",
    relativePath: "prepared/artifact.html",
    files: 1,
    bytes: 2,
    warnings: [],
  });

  const acceptedRecord = path.join(fixture, "limit-accepted.txt");
  const acceptedWorker = await writeWorker(
    fixture,
    `const relativePath = "prepared/artifact.html";
await mkdir(path.join(job.workspace, "prepared"), { recursive: true });
await writeFile(path.join(job.workspace, relativePath), "ok");
writeFileSync(3, ${JSON.stringify(result)});`,
  );
  const prepared = await runBuildJob(packJob(acceptedRecord), {
    workerEntrypoint: acceptedWorker,
    resultBytes: Buffer.byteLength(result),
  });
  await cleanupPreparedOutput(prepared);

  const rejectedRecord = path.join(fixture, "limit-rejected.txt");
  const rejectedWorker = await writeWorker(
    fixture,
    `const relativePath = "prepared/artifact.html";
await mkdir(path.join(job.workspace, "prepared"), { recursive: true });
await writeFile(path.join(job.workspace, relativePath), "ok");
writeFileSync(3, ${JSON.stringify(result)});`,
  );
  await assert.rejects(
    runBuildJob(packJob(rejectedRecord), {
      workerEntrypoint: rejectedWorker,
      resultBytes: Buffer.byteLength(result) - 1,
    }),
    /result exceeds the protocol limit/,
  );
});

test("reports bounded resource metrics from the real worker", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const input = path.join(fixture, "pack");
  await writeFixture(input, {
    "index.html":
      '<!doctype html><html><head><title>Metrics</title></head><body><main>ok</main><script type="module" src="app.js"></script></body></html>',
    "app.js": 'console.log("metrics");',
  });

  const prepared = await runBuildJob({ kind: "pack", inputDirectory: input });
  assert.ok(prepared.metrics);
  assert.ok(Number.isSafeInteger(prepared.metrics.peakRssBytes));
  assert.ok(Number.isSafeInteger(prepared.metrics.peakHeapBytes));
  assert.ok(prepared.metrics.peakRssBytes > 0);
  assert.ok(prepared.metrics.peakHeapBytes > 0);
  await cleanupPreparedOutput(prepared);
});

test("does not use the input directory as the custom-theme Vite root", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const defaultTheme = await readFile(
    path.join(process.cwd(), "src/themes/default.jsx"),
    "utf8",
  );
  await writeFixture(fixture, {
    "App.jsx": `export default function App(){return <main>isolated</main>}`,
    "ambient.js": defaultTheme,
    "theme.jsx": `import ambient from "/ambient.js";
export default { ...ambient, id: "ambient-root", name: "Ambient Root" };`,
  });

  await assert.rejects(async () => {
    const prepared = await runBuildJob({
      kind: "file",
      cwd: fixture,
      entry: path.join(fixture, "App.jsx"),
      base: "./",
      cdn: true,
      theme: { kind: "module", source: path.join(fixture, "theme.jsx") },
    });
    await cleanupPreparedOutput(prepared);
  }, /Could not load theme module.*theme\.jsx/);
});

test("does not include uncontrolled worker stderr in diagnostics", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const workspaceRecord = path.join(fixture, "diagnostic-workspace.txt");
  const worker = await writeWorker(
    fixture,
    `await new Promise((resolve) => process.stderr.write("TOP_SECRET_TOKEN=do-not-disclose", resolve));
process.exitCode = 9;`,
  );

  let error: unknown;
  try {
    await runBuildJob(packJob(workspaceRecord), { workerEntrypoint: worker });
    assert.fail("Expected the worker to fail.");
  } catch (caught) {
    error = caught;
  }
  assert.ok(error instanceof Error);
  assert.match(error.message, /exited before completing \(code 9\)/);
  assert.doesNotMatch(error.message, /TOP_SECRET_TOKEN|do-not-disclose/);
});

test("runs the worker in its owned workspace", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const workspaceRecord = path.join(fixture, "cwd-workspace.txt");
  const worker = await writeWorker(
    fixture,
    `const relativePath = "prepared/artifact.html";
await mkdir(path.join(job.workspace, "prepared"), { recursive: true });
await writeFile(path.join(job.workspace, relativePath), process.cwd());
writeFileSync(3, JSON.stringify({ ok: true, kind: "file", relativePath, files: 1, bytes: Buffer.byteLength(process.cwd()), warnings: [] }));`,
  );

  const prepared = await runBuildJob(packJob(workspaceRecord), {
    workerEntrypoint: worker,
  });
  assert.equal(
    await realpath(await readFile(prepared.path, "utf8")),
    await realpath(prepared.workspace),
  );
  await cleanupPreparedOutput(prepared);
});

test("redacts environment values from structured worker failures", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const workspaceRecord = path.join(fixture, "failure-workspace.txt");
  const worker = await writeWorker(
    fixture,
    `writeFileSync(3, JSON.stringify({ ok: false, error: { code: "BUILD_FAILED", message: "failure: RTIFACT_WORKER_SECRET_MARKER" } }));`,
  );
  const previous = process.env.RTIFACT_WORKER_SECRET;
  process.env.RTIFACT_WORKER_SECRET = "RTIFACT_WORKER_SECRET_MARKER";
  t.after(() => {
    if (previous === undefined) delete process.env.RTIFACT_WORKER_SECRET;
    else process.env.RTIFACT_WORKER_SECRET = previous;
  });

  await assert.rejects(
    runBuildJob(packJob(workspaceRecord), { workerEntrypoint: worker }),
    (error: Error) => {
      assert.match(error.message, /\[redacted\]/);
      assert.doesNotMatch(error.message, /RTIFACT_WORKER_SECRET_MARKER/);
      return true;
    },
  );
});
