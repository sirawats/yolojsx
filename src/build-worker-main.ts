import { cp, lstat, mkdir, opendir, writeFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { withTemporaryApplicationBuild } from "./build.js";
import type { BuildJob } from "./build-worker.js";
import { formatError, sanitizeDiagnostic } from "./errors.js";
import { BUILD_WORKER_LIMITS } from "./resource-limits.js";
import { createSingleFileArtifact } from "./single-file.js";
import { loadThemeInput } from "./theme-modules.js";

type WorkerRequest = BuildJob & { workspace: string };

let peakRssBytes = 0;
let peakHeapBytes = 0;
function sampleMemory() {
  const memory = process.memoryUsage();
  peakRssBytes = Math.max(peakRssBytes, memory.rss);
  peakHeapBytes = Math.max(peakHeapBytes, memory.heapUsed);
}
sampleMemory();
const memorySampler = setInterval(sampleMemory, 10);
memorySampler.unref();

async function readRequest() {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of process.stdin as AsyncIterable<Buffer | string>) {
    const buffer = Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > BUILD_WORKER_LIMITS.requestBytes) {
      throw new Error("Build worker request exceeds the protocol limit.");
    }
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as WorkerRequest;
}

function sendResult(value: unknown) {
  const serialized = JSON.stringify(value);
  if (Buffer.byteLength(serialized) > BUILD_WORKER_LIMITS.resultBytes) {
    throw new Error("Build worker result exceeds the protocol limit.");
  }
  writeFileSync(3, serialized);
}

async function inspectDirectory(directory: string) {
  let files = 0;
  let bytes = 0;
  const visit = async (current: string): Promise<void> => {
    const directory = await opendir(current);
    for await (const entry of directory) {
      const candidate = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(candidate);
      } else if (entry.isFile()) {
        const fileStat = await lstat(candidate, { bigint: true });
        files += 1;
        bytes += Number(fileStat.size);
      }
    }
  };
  await visit(directory);
  return { files, bytes };
}

async function prepare(job: WorkerRequest) {
  const preparedRoot = path.join(job.workspace, "prepared");
  await mkdir(preparedRoot, { recursive: true });
  const warnings: string[] = [];
  const onWarning = (warning: string) => warnings.push(warning);

  if (job.kind === "pack") {
    const artifact = await createSingleFileArtifact(job.inputDirectory);
    const relativePath = "prepared/artifact.html";
    await writeFile(
      path.join(job.workspace, relativePath),
      artifact.html,
      "utf8",
    );
    return {
      ok: true,
      kind: "file",
      relativePath,
      files: 1,
      bytes: artifact.bytes,
      compressedBytes: artifact.compressedBytes,
      warnings,
    } as const;
  }

  const selection = await loadThemeInput(job.theme, job.workspace);
  if (job.kind === "file") {
    const artifact = await withTemporaryApplicationBuild(
      {
        entry: job.entry,
        base: job.base,
        singleFile: true,
        cdn: job.cdn,
        theme: selection.theme,
        themeSource: selection.source,
        workspaceRoot: job.workspace,
        onWarning,
      },
      createSingleFileArtifact,
    );
    const relativePath = "prepared/artifact.html";
    await writeFile(
      path.join(job.workspace, relativePath),
      artifact.html,
      "utf8",
    );
    return {
      ok: true,
      kind: "file",
      relativePath,
      files: 1,
      bytes: artifact.bytes,
      compressedBytes: artifact.compressedBytes,
      warnings,
    } as const;
  }

  const relativePath = "prepared/site";
  const preparedDirectory = path.join(job.workspace, relativePath);
  await withTemporaryApplicationBuild(
    {
      entry: job.entry,
      base: job.base,
      theme: selection.theme,
      themeSource: selection.source,
      workspaceRoot: job.workspace,
      onWarning,
    },
    (workspaceOutput) =>
      cp(workspaceOutput, preparedDirectory, { recursive: true }),
  );
  const measured = await inspectDirectory(preparedDirectory);
  return {
    ok: true,
    kind: "directory",
    relativePath,
    ...measured,
    warnings,
  } as const;
}

try {
  const result = await prepare(await readRequest());
  sampleMemory();
  sendResult({
    ...result,
    metrics: { peakRssBytes, peakHeapBytes },
  });
} catch (error) {
  sampleMemory();
  sendResult({
    ok: false,
    error: {
      code:
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "BUILD_FAILED",
      message: sanitizeDiagnostic(
        formatError(error),
        BUILD_WORKER_LIMITS.diagnosticBytes,
      ),
    },
  });
}
