import path from "node:path";
import { fileURLToPath } from "node:url";
import { npmCommand, printResult, run } from "./process.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const commands = [
  ["run", "version:check"],
  ["run", "format:check"],
  ["run", "lint"],
  ["test"],
  ["run", "check"],
  ["run", "pack:check"],
  ["run", "verify:package"],
];

for (const args of commands) {
  printResult(run(npmCommand, args, { cwd: repository }));
}

process.stdout.write("Local verification passed.\n");
