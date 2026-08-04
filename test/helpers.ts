import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCli } from "../src/cli.js";

interface InvokeOptions {
  cwd?: string;
  nodeVersion?: string;
  stdin?: NodeJS.ReadableStream & { isTTY?: boolean };
  confirmReplacement?: NonNullable<
    Parameters<typeof runCli>[1]
  >["confirmReplacement"];
  workerOverrides?: NonNullable<
    Parameters<typeof runCli>[1]
  >["workerOverrides"];
}

export async function makeFixture(prefix = "rtifact-test-") {
  const created = await mkdtemp(path.join(os.tmpdir(), prefix));
  return realpath(created);
}

export async function writeFixture(
  root: string,
  files: Record<string, string>,
) {
  await Promise.all(
    Object.entries(files).map(async ([relativePath, contents]) => {
      const file = path.join(root, relativePath);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, contents, "utf8");
    }),
  );
}

function createSink() {
  let contents = "";
  return {
    stream: {
      write(chunk: unknown) {
        contents += String(chunk);
        return true;
      },
    },
    read() {
      return contents;
    },
  };
}

export async function invoke(args: string[], options: InvokeOptions = {}) {
  const stdout = createSink();
  const stderr = createSink();
  const cliOptions: Parameters<typeof runCli>[1] = {
    cwd: options.cwd,
    nodeVersion: options.nodeVersion,
    stdout: stdout.stream,
    stderr: stderr.stream,
    workerOverrides: options.workerOverrides,
  };
  if (options.stdin) {
    cliOptions.stdin = options.stdin;
  }
  if (options.confirmReplacement) {
    cliOptions.confirmReplacement = options.confirmReplacement;
  }
  const exitCode = await runCli(args, cliOptions);
  return { exitCode, stdout: stdout.read(), stderr: stderr.read() };
}

export async function readAsset(output: string, extension: string) {
  const assets = await readdir(path.join(output, "assets"));
  const asset = assets.find((name) => name.endsWith(extension));
  if (!asset) {
    throw new Error(`No ${extension} asset found in ${output}`);
  }
  return readFile(path.join(output, "assets", asset), "utf8");
}
