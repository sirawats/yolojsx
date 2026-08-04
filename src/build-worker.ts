import { lstat, mkdtemp, opendir, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RtifactError, sanitizeDiagnostic } from "./errors.js";
import {
  BUILD_RESOURCE_LIMITS,
  BUILD_WORKER_LIMITS,
} from "./resource-limits.js";
import type { ThemeInput } from "./theme-modules.js";

const require = createRequire(import.meta.url);

export type BuildJob =
  | { kind: "pack"; inputDirectory: string }
  | {
      kind: "file";
      cwd: string;
      entry: string;
      base: string;
      cdn: boolean;
      theme: ThemeInput;
    }
  | {
      kind: "directory";
      cwd: string;
      entry: string;
      base: string;
      theme: ThemeInput;
    };

interface WorkerSuccess {
  ok: true;
  kind: "file" | "directory";
  relativePath: string;
  files: number;
  bytes: number;
  compressedBytes?: number;
  warnings: string[];
  metrics?: { peakRssBytes: number; peakHeapBytes: number };
}

interface WorkerFailure {
  ok: false;
  error: { code: string; message: string };
}

type WorkerResult = WorkerSuccess | WorkerFailure;

export interface PreparedOutput {
  kind: "file" | "directory";
  workspace: string;
  path: string;
  files: number;
  bytes: number;
  compressedBytes?: number;
  warnings: string[];
  metrics?: { peakRssBytes: number; peakHeapBytes: number };
}

export interface BuildWorkerTestOverrides {
  timeoutMs?: number;
  maxOldSpaceSizeMiB?: number;
  resultBytes?: number;
  workerEntrypoint?: string;
}

function validateTestOverrides(overrides: BuildWorkerTestOverrides) {
  if (
    (overrides.timeoutMs !== undefined &&
      (!Number.isSafeInteger(overrides.timeoutMs) ||
        overrides.timeoutMs < 1 ||
        overrides.timeoutMs > BUILD_WORKER_LIMITS.timeoutMs)) ||
    (overrides.maxOldSpaceSizeMiB !== undefined &&
      (!Number.isSafeInteger(overrides.maxOldSpaceSizeMiB) ||
        overrides.maxOldSpaceSizeMiB < 16 ||
        overrides.maxOldSpaceSizeMiB >
          BUILD_WORKER_LIMITS.maxOldSpaceSizeMiB)) ||
    (overrides.resultBytes !== undefined &&
      (!Number.isSafeInteger(overrides.resultBytes) ||
        overrides.resultBytes < 1 ||
        overrides.resultBytes > BUILD_WORKER_LIMITS.resultBytes))
  ) {
    throw workerError("received invalid private test limits.");
  }
}

function workerError(message: string, cause?: unknown) {
  return new RtifactError(`Build worker ${message}`, {
    code: "BUILD_FAILED",
    cause,
  });
}

function resolveWorkerEntrypoint(override?: string) {
  if (override) return path.resolve(override);
  const current = fileURLToPath(import.meta.url);
  return fileURLToPath(
    new URL(
      path.extname(current) === ".ts"
        ? "./build-worker-main.ts"
        : "./build-worker-main.js",
      import.meta.url,
    ),
  );
}

function controlledNodeArguments(entrypoint: string, heapMiB: number) {
  const arguments_ = [`--max-old-space-size=${heapMiB}`];
  if (path.extname(entrypoint) === ".ts") {
    arguments_.push("--import", pathToFileURL(require.resolve("tsx")).href);
  }
  arguments_.push(entrypoint);
  return arguments_;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWorkerResult(value: string): WorkerResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw workerError("returned malformed control data.", error);
  }
  if (!isRecord(parsed) || typeof parsed.ok !== "boolean") {
    throw workerError("returned an invalid result.");
  }
  if (parsed.ok === false) {
    if (
      !isRecord(parsed.error) ||
      typeof parsed.error.code !== "string" ||
      !/^[A-Z][A-Z0-9_]{0,63}$/.test(parsed.error.code) ||
      typeof parsed.error.message !== "string"
    ) {
      throw workerError("returned an invalid failure result.");
    }
    return {
      ok: false,
      error: {
        code: parsed.error.code,
        message: sanitizeDiagnostic(
          parsed.error.message,
          BUILD_WORKER_LIMITS.diagnosticBytes,
        ),
      },
    };
  }
  if (
    (parsed.kind !== "file" && parsed.kind !== "directory") ||
    typeof parsed.relativePath !== "string" ||
    typeof parsed.files !== "number" ||
    !Number.isSafeInteger(parsed.files) ||
    typeof parsed.bytes !== "number" ||
    !Number.isSafeInteger(parsed.bytes) ||
    !Array.isArray(parsed.warnings) ||
    parsed.warnings.some((warning) => typeof warning !== "string")
  ) {
    throw workerError("returned invalid prepared-output metadata.");
  }
  if (
    parsed.metrics !== undefined &&
    (!isRecord(parsed.metrics) ||
      !Number.isSafeInteger(parsed.metrics.peakRssBytes) ||
      !Number.isSafeInteger(parsed.metrics.peakHeapBytes) ||
      (parsed.metrics.peakRssBytes as number) < 0 ||
      (parsed.metrics.peakHeapBytes as number) < 0)
  ) {
    throw workerError("returned invalid resource metrics.");
  }
  return parsed as unknown as WorkerSuccess;
}

function sanitizeWarnings(warnings: string[]) {
  if (warnings.length > BUILD_WORKER_LIMITS.warningCount) {
    throw workerError("returned too many warnings.");
  }
  let total = 0;
  for (const warning of warnings) {
    const bytes = Buffer.byteLength(warning);
    if (bytes > BUILD_WORKER_LIMITS.warningBytes) {
      throw workerError("returned an oversized warning.");
    }
    total += bytes;
  }
  if (total > BUILD_WORKER_LIMITS.warningTotalBytes) {
    throw workerError("returned oversized warnings.");
  }
  return warnings.map((warning) =>
    sanitizeDiagnostic(warning, BUILD_WORKER_LIMITS.warningBytes),
  );
}

async function inspectPreparedDirectory(directory: string) {
  let files = 0;
  let bytes = 0;
  const visit = async (current: string): Promise<void> => {
    const directory = await opendir(current);
    for await (const entry of directory) {
      const candidate = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        throw workerError("prepared a symbolic link.");
      }
      if (entry.isDirectory()) {
        await visit(candidate);
        continue;
      }
      const fileStat = await lstat(candidate, { bigint: true });
      if (!entry.isFile() || !fileStat.isFile() || fileStat.isSymbolicLink()) {
        throw workerError("prepared an unsupported directory entry.");
      }
      if (fileStat.size > BigInt(BUILD_RESOURCE_LIMITS.outputFileBytes)) {
        throw workerError("prepared an oversized output file.");
      }
      files += 1;
      bytes += Number(fileStat.size);
      if (files > BUILD_RESOURCE_LIMITS.files) {
        throw workerError("prepared too many output files.");
      }
      if (bytes > BUILD_RESOURCE_LIMITS.outputBytes) {
        throw workerError("prepared an oversized output directory.");
      }
    }
  };
  await visit(directory);
  return { files, bytes };
}

async function validatePreparedOutput(
  workspace: string,
  job: BuildJob,
  result: WorkerSuccess,
): Promise<PreparedOutput> {
  if (
    !result.relativePath ||
    result.relativePath.includes("\0") ||
    path.isAbsolute(result.relativePath)
  ) {
    throw workerError("returned an unsafe prepared-output path.");
  }
  const preparedPath = path.resolve(workspace, result.relativePath);
  const relative = path.relative(workspace, preparedPath);
  if (relative === ".." || relative.startsWith(`..${path.sep}`)) {
    throw workerError("returned a prepared output outside its workspace.");
  }
  const workspaceRealPath = await realpath(workspace);
  const preparedRealPath = await realpath(preparedPath);
  const physicalRelative = path.relative(workspaceRealPath, preparedRealPath);
  if (
    physicalRelative === ".." ||
    physicalRelative.startsWith(`..${path.sep}`)
  ) {
    throw workerError("returned a prepared output outside its workspace.");
  }
  let ancestor = workspace;
  for (const segment of relative.split(path.sep).slice(0, -1)) {
    ancestor = path.join(ancestor, segment);
    if ((await lstat(ancestor)).isSymbolicLink()) {
      throw workerError(
        "returned a prepared output with a symbolic-link ancestor.",
      );
    }
  }
  const expectedKind = job.kind === "directory" ? "directory" : "file";
  if (result.kind !== expectedKind) {
    throw workerError("returned the wrong prepared-output kind.");
  }
  const warnings = sanitizeWarnings(result.warnings);
  const preparedStat = await lstat(preparedPath, { bigint: true });
  if (result.kind === "file") {
    if (preparedStat.isSymbolicLink() || !preparedStat.isFile()) {
      throw workerError("did not prepare a regular file.");
    }
    const bytes = Number(preparedStat.size);
    if (bytes > BUILD_RESOURCE_LIMITS.artifactBytes || result.files !== 1) {
      throw workerError("prepared an invalid file artifact.");
    }
    if (result.bytes !== bytes) {
      throw workerError("returned file metadata that does not match disk.");
    }
    return { ...result, warnings, workspace, path: preparedPath };
  }
  if (preparedStat.isSymbolicLink() || !preparedStat.isDirectory()) {
    throw workerError("did not prepare a directory.");
  }
  const measured = await inspectPreparedDirectory(preparedPath);
  if (measured.files !== result.files || measured.bytes !== result.bytes) {
    throw workerError("returned directory metadata that does not match disk.");
  }
  return { ...result, warnings, workspace, path: preparedPath };
}

export async function cleanupPreparedOutput(
  prepared: Pick<PreparedOutput, "workspace"> | undefined,
  failure?: Error,
) {
  if (!prepared) return;
  try {
    await rm(prepared.workspace, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  } catch (error) {
    if (!failure) throw error;
    failure.message += `\nWorker cleanup also failed.`;
  }
}

export async function runBuildJob(
  job: BuildJob,
  overrides: BuildWorkerTestOverrides = {},
): Promise<PreparedOutput> {
  validateTestOverrides(overrides);
  const workspace = await mkdtemp(path.join(os.tmpdir(), "rtifact-job-"));
  let prepared: PreparedOutput | undefined;
  try {
    const request = JSON.stringify({ ...job, workspace });
    if (Buffer.byteLength(request) > BUILD_WORKER_LIMITS.requestBytes) {
      throw workerError("request exceeds the protocol limit.");
    }
    const entrypoint = resolveWorkerEntrypoint(overrides.workerEntrypoint);
    const timeoutMs = overrides.timeoutMs ?? BUILD_WORKER_LIMITS.timeoutMs;
    const resultBytes =
      overrides.resultBytes ?? BUILD_WORKER_LIMITS.resultBytes;
    const heapMiB =
      overrides.maxOldSpaceSizeMiB ?? BUILD_WORKER_LIMITS.maxOldSpaceSizeMiB;
    const child = spawn(
      process.execPath,
      controlledNodeArguments(entrypoint, heapMiB),
      {
        cwd: workspace,
        shell: false,
        windowsHide: true,
        stdio: ["pipe", "ignore", "ignore", "pipe"],
      },
    );
    let control = Buffer.alloc(0);
    let protocolOverflow = false;
    const controlStream = child.stdio[3];
    if (!controlStream || !child.stdin) {
      child.kill("SIGKILL");
      throw workerError("process pipes are unavailable.");
    }
    controlStream.on("data", (chunk: Buffer) => {
      if (protocolOverflow) return;
      if (control.length + chunk.length > resultBytes) {
        protocolOverflow = true;
        child.kill("SIGKILL");
        return;
      }
      control = Buffer.concat([control, chunk]);
    });

    const closed = new Promise<{
      code: number | null;
      signal: NodeJS.Signals | null;
    }>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolve({ code, signal }));
    });
    child.stdin.end(request);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    const status = await closed.finally(() => clearTimeout(timer));
    if (timedOut) throw workerError(`timed out after ${timeoutMs} ms.`);
    if (protocolOverflow)
      throw workerError("result exceeds the protocol limit.");
    if (status.code !== 0 || status.signal) {
      throw workerError(
        `exited before completing${status.signal ? ` (${status.signal})` : ` (code ${status.code})`}.`,
      );
    }
    if (control.length === 0) throw workerError("returned no result.");
    const result = parseWorkerResult(control.toString("utf8"));
    if (!result.ok) {
      throw new RtifactError(result.error.message, { code: result.error.code });
    }
    prepared = await validatePreparedOutput(workspace, job, result);
    return prepared;
  } catch (error) {
    const failure =
      error instanceof Error ? error : workerError("failed.", error);
    await cleanupPreparedOutput({ workspace }, failure);
    throw failure;
  }
}
