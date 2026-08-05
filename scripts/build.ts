import { chmod, cp, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./process.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const output = path.join(repository, "lib");

await rm(output, { recursive: true, force: true });
run(
  process.execPath,
  [
    path.join(repository, "node_modules/typescript/bin/tsc"),
    "--project",
    path.join(repository, "tsconfig.build.json"),
  ],
  { cwd: repository },
);
const srcThemesDir = path.join(repository, "src/themes");
const destThemesDir = path.join(output, "themes");
const entries = await readdir(srcThemesDir);
for (const entry of entries) {
  if (entry.endsWith(".jsx") || entry === "foundation.css") {
    await cp(path.join(srcThemesDir, entry), path.join(destThemesDir, entry));
  }
}
await chmod(path.join(output, "bin.js"), 0o755);
