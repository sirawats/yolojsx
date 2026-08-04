import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {
  cleanupPreparedOutput,
  runBuildJob,
  type BuildJob,
  type PreparedOutput,
} from "../src/build-worker.js";
import { inspectFileOutput, publishPreparedFile } from "../src/output.js";
import { BUILD_WORKER_LIMITS } from "../src/resource-limits.js";

interface StressWorkload {
  fixture: string;
  job: BuildJob;
}

const CANONICAL_EXAMPLES = [
  "APIDocs.jsx",
  "APITestReport.jsx",
  "Analytics.jsx",
  "AntD.jsx",
  "CodeReviewReport.jsx",
  "Editorial.jsx",
  "SaaS.jsx",
  "SetupGuide.jsx",
  "TaxCalculator.jsx",
  "Techspec.jsx",
] as const;

function outputArgument() {
  const index = process.argv.indexOf("--output");
  if (index === -1) return path.resolve("stress-results/release.json");
  const value = process.argv[index + 1];
  if (!value) throw new Error("--output requires a path.");
  return path.resolve(value);
}

async function createWorkloads(root: string): Promise<StressWorkload[]> {
  const pack = path.join(root, "pack");
  await mkdir(pack, { recursive: true });
  await writeFile(
    path.join(pack, "asset.bin"),
    Buffer.alloc(4 * 1024 * 1024, 65),
  );
  await writeFile(
    path.join(pack, "index.html"),
    `<!doctype html><html><head><title>Stress</title></head><body><main>${Array.from(
      { length: 12 },
      (_, index) => `<img alt="asset ${index}" src="asset.bin">`,
    ).join(
      "",
    )}</main><script type="module" src="app.js"></script></body></html>`,
  );
  await writeFile(path.join(pack, "app.js"), `console.log("stress fixture");`);
  const cwd = process.cwd();
  const preset = { kind: "preset" as const, value: "default" };
  return [
    ...CANONICAL_EXAMPLES.map((example) => ({
      fixture: `canonical-${path.basename(example, ".jsx")}-default`,
      job: {
        kind: "file" as const,
        cwd,
        entry: path.join(cwd, "examples", example),
        base: "./",
        cdn: true,
        theme: preset,
      },
    })),
    {
      fixture: "self-contained",
      job: {
        kind: "file",
        cwd,
        entry: path.join(cwd, "examples/APIDocs.jsx"),
        base: "./",
        cdn: false,
        theme: preset,
      },
    },
    {
      fixture: "website-default",
      job: {
        kind: "file",
        cwd,
        entry: path.join(cwd, "website/index.tsx"),
        base: "./",
        cdn: true,
        theme: { kind: "preset", value: "rtifact" },
      },
    },
    {
      fixture: "website-directory",
      job: {
        kind: "directory",
        cwd,
        entry: path.join(cwd, "website/index.tsx"),
        base: "/",
        theme: { kind: "preset", value: "rtifact" },
      },
    },
    {
      fixture: "custom-theme",
      job: {
        kind: "file",
        cwd,
        entry: path.join(cwd, "examples/TaxCalculator.jsx"),
        base: "./",
        cdn: true,
        theme: {
          kind: "module",
          source: path.join(cwd, "src/themes/rtifact.jsx"),
        },
      },
    },
    {
      fixture: "asset-expansion-compression",
      job: { kind: "pack", inputDirectory: pack },
    },
  ];
}

async function measureWorkerContainment(
  root: string,
  kind: "exit" | "timeout",
) {
  const worker = path.join(root, `${kind}-worker.mjs`);
  const workspaceRecord = path.join(root, `${kind}-workspace.txt`);
  await writeFile(
    worker,
    `import {writeFile} from "node:fs/promises";
let input="";
for await (const chunk of process.stdin) input += chunk;
const job=JSON.parse(input);
await writeFile(job.inputDirectory, job.workspace);
${kind === "exit" ? "process.exit(23);" : "setInterval(() => {}, 1000);"}`,
  );
  const started = process.hrtime.bigint();
  let error: string | null = null;
  try {
    await runBuildJob(
      { kind: "pack", inputDirectory: workspaceRecord },
      {
        workerEntrypoint: worker,
        timeoutMs: kind === "timeout" ? 1_000 : 2_000,
      },
    );
  } catch (failure) {
    error = failure instanceof Error ? failure.message : String(failure);
  }
  const workspace = await readFile(workspaceRecord, "utf8");
  let cleaned = false;
  try {
    await stat(workspace);
  } catch {
    cleaned = true;
  }
  return {
    kind,
    elapsedMs: Number(process.hrtime.bigint() - started) / 1_000_000,
    expectedFailure: error,
    cleanup: { ok: cleaned },
    ok: Boolean(error && cleaned),
  };
}

async function measurePublicationCrashWindow(root: string) {
  const directory = path.join(root, "publication-crash-window");
  const output = path.join(directory, "artifact.html");
  const prepared = path.join(directory, "prepared.html");
  await mkdir(directory);
  await writeFile(output, "last good output");
  await writeFile(prepared, "new output");
  const state = await inspectFileOutput(output, true);
  const started = process.hrtime.bigint();
  let renameCount = 0;
  let error: string | null = null;
  try {
    await publishPreparedFile(prepared, output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 2) throw new Error("injected publication crash");
        return rename(from, to);
      },
      rm,
    });
  } catch (failure) {
    error = failure instanceof Error ? failure.message : String(failure);
  }
  const restored = (await readFile(output, "utf8")) === "last good output";
  const debris = (await readdir(directory)).filter((name) =>
    /rtifact-(?:stage|backup)/.test(name),
  );
  return {
    elapsedMs: Number(process.hrtime.bigint() - started) / 1_000_000,
    expectedFailure: error,
    renameCount,
    restored,
    cleanup: { ok: debris.length === 0, debris },
    ok: Boolean(error && renameCount === 3 && restored && debris.length === 0),
  };
}

async function main() {
  const output = outputArgument();
  const temporary = await mkdtemp(path.join(os.tmpdir(), "rtifact-stress-"));
  const results: unknown[] = [];
  let containment: Awaited<ReturnType<typeof measureWorkerContainment>>[];
  let publicationCrashWindow:
    Awaited<ReturnType<typeof measurePublicationCrashWindow>> | undefined;
  let failed = false;
  try {
    const workloads = await createWorkloads(temporary);
    for (const workload of workloads) {
      for (let run = 1; run <= 3; run += 1) {
        globalThis.gc?.();
        const parentHeapBeforeBytes = process.memoryUsage().heapUsed;
        const started = process.hrtime.bigint();
        let prepared: PreparedOutput | undefined;
        let cleanup = { ok: true, error: null as string | null };
        let exit: { ok: boolean; error: string | null } = {
          ok: false,
          error: null,
        };
        try {
          prepared = await runBuildJob(workload.job);
          exit = { ok: true, error: null };
        } catch (error) {
          failed = true;
          exit = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
        } finally {
          try {
            await cleanupPreparedOutput(prepared);
          } catch (error) {
            failed = true;
            cleanup = {
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }
        globalThis.gc?.();
        results.push({
          fixture: workload.fixture,
          run,
          elapsedMs: Number(process.hrtime.bigint() - started) / 1_000_000,
          peakRssBytes: prepared?.metrics?.peakRssBytes ?? null,
          peakHeapBytes: prepared?.metrics?.peakHeapBytes ?? null,
          parentHeapBeforeBytes,
          parentHeapAfterBytes: process.memoryUsage().heapUsed,
          artifactBytes: prepared?.bytes ?? null,
          exit,
          cleanup,
        });
      }
    }
    containment = await Promise.all([
      measureWorkerContainment(temporary, "exit"),
      measureWorkerContainment(temporary, "timeout"),
    ]);
    publicationCrashWindow = await measurePublicationCrashWindow(temporary);
    if (
      containment.some((measurement) => !measurement.ok) ||
      !publicationCrashWindow.ok
    ) {
      failed = true;
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }

  const evidence = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    platform: {
      os: process.platform,
      release: os.release(),
      architecture: process.arch,
      node: process.version,
    },
    productionLimits: {
      timeoutMs: BUILD_WORKER_LIMITS.timeoutMs,
      maxOldSpaceSizeMiB: BUILD_WORKER_LIMITS.maxOldSpaceSizeMiB,
    },
    measurementsPerFixture: 3,
    forcedGarbageCollection: Boolean(globalThis.gc),
    results,
    containment,
    publicationCrashWindow,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(`${output}\n`);
  if (failed) process.exitCode = 1;
}

await main();
