import { mkdir, mkdtemp, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCli } from "../src/cli.js";

export async function makeFixture(prefix = "yolojsx-test-") {
  const created = await mkdtemp(path.join(os.tmpdir(), prefix));
  return realpath(created);
}

export async function writeFixture(root, files) {
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
      write(chunk) {
        contents += String(chunk);
        return true;
      },
    },
    read() {
      return contents;
    },
  };
}

export async function invoke(args, options = {}) {
  const stdout = createSink();
  const stderr = createSink();
  const cliOptions = {
    cwd: options.cwd,
    nodeVersion: options.nodeVersion,
    stdout: stdout.stream,
    stderr: stderr.stream,
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

export async function readAsset(output, extension) {
  const assets = await readdir(path.join(output, "assets"));
  const asset = assets.find((name) => name.endsWith(extension));
  if (!asset) {
    throw new Error(`No ${extension} asset found in ${output}`);
  }
  return readFile(path.join(output, "assets", asset), "utf8");
}
