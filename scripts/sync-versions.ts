import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import { formatError } from "../src/errors.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
type JsonObject = Record<string, unknown>;

const targets: { file: string; fields: string[][] }[] = [
  {
    file: "package-lock.json",
    fields: [["version"], ["packages", "", "version"]],
  },
  { file: ".codex-plugin/plugin.json", fields: [["version"]] },
  { file: ".claude-plugin/plugin.json", fields: [["version"]] },
  { file: "gemini-extension.json", fields: [["version"]] },
];

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValue(document: JsonObject, fields: string[]) {
  let value: unknown = document;
  for (const field of fields) {
    if (!isJsonObject(value)) return undefined;
    value = value[field];
  }
  return value;
}

function setValue(document: JsonObject, fields: string[], value: string) {
  const name = fields.at(-1);
  if (!name) throw new Error("Version field path must not be empty.");
  let parent = document;
  for (const field of fields.slice(0, -1)) {
    const child = parent[field];
    if (!isJsonObject(child)) {
      throw new Error(
        `Version field path is not an object: ${fields.join(".")}`,
      );
    }
    parent = child;
  }
  parent[name] = value;
}

async function readJson(file: string): Promise<JsonObject> {
  const value: unknown = JSON.parse(await readFile(file, "utf8"));
  if (!isJsonObject(value)) throw new Error(`${file} must contain an object.`);
  return value;
}

export async function syncVersions(
  root = repository,
  { check = false }: { check?: boolean } = {},
) {
  const version = (await readJson(path.join(root, "package.json"))).version;
  if (typeof version !== "string") {
    throw new Error("package.json version must be a string.");
  }
  const changed: string[] = [];
  const mismatches: string[] = [];

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
    process.stderr.write("Usage: tsx scripts/sync-versions.ts [--check]\n");
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
      process.stderr.write(`${formatError(error)}\n`);
      process.exitCode = 1;
    }
  }
}
