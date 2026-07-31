import { chmod, cp, rm } from "node:fs/promises";
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
await cp(
  path.join(repository, "src/themes/foundation.css"),
  path.join(output, "themes/foundation.css"),
);
await chmod(path.join(output, "bin.js"), 0o755);
