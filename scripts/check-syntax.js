import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./process.js";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roots = ["bin", "src", "test", "scripts"];

async function collectJavaScript(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectJavaScript(file, files);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(file);
    }
  }
  return files;
}

const files = (
  await Promise.all(roots.map((root) => collectJavaScript(path.join(repository, root))))
).flat();

for (const file of files.sort()) {
  run(process.execPath, ["--check", file], { cwd: repository });
}

process.stdout.write(`Checked ${files.length} JavaScript files.\n`);
