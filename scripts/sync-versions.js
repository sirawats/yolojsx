import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const targets = [
  {
    file: "package-lock.json",
    fields: [["version"], ["packages", "", "version"]],
  },
  { file: ".codex-plugin/plugin.json", fields: [["version"]] },
  { file: ".claude-plugin/plugin.json", fields: [["version"]] },
  { file: "gemini-extension.json", fields: [["version"]] },
];

function getValue(document, fields) {
  return fields.reduce((value, field) => value?.[field], document);
}

function setValue(document, fields, value) {
  const parent = fields
    .slice(0, -1)
    .reduce((current, field) => current[field], document);
  parent[fields.at(-1)] = value;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function syncVersions(root = repository, { check = false } = {}) {
  const version = (await readJson(path.join(root, "package.json"))).version;
  const changed = [];
  const mismatches = [];

  for (const target of targets) {
    const file = path.join(root, target.file);
    const document = await readJson(file);
    const staleFields = target.fields.filter(
      (fields) => getValue(document, fields) !== version,
    );
    if (staleFields.length === 0) {
      continue;
    }

    mismatches.push(target.file);
    if (!check) {
      for (const fields of staleFields) {
        setValue(document, fields, version);
      }
      await writeFile(
        file,
        await format(JSON.stringify(document), { parser: "json" }),
        "utf8",
      );
      changed.push(target.file);
    }
  }

  if (check && mismatches.length > 0) {
    throw new Error(
      `Version ${version} is not synchronized in: ${mismatches.join(", ")}`,
    );
  }

  return { version, changed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
    process.stderr.write("Usage: node scripts/sync-versions.js [--check]\n");
    process.exitCode = 1;
  } else {
    try {
      const { version, changed } = await syncVersions(repository, {
        check: args[0] === "--check",
      });
      process.stdout.write(
        args[0] === "--check"
          ? `Version ${version} is synchronized.\n`
          : `Synchronized version ${version} in ${changed.length} file(s).\n`,
      );
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
