import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { npmCommand, printResult, run } from "./process.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const temporary = await mkdtemp(path.join(os.tmpdir(), "rtifact-pack-check-"));

try {
  const result = run(npmCommand, ["pack", "--dry-run"], {
    cwd: repository,
    env: { npm_config_cache: path.join(temporary, "npm-cache") },
  });
  printResult(result);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
