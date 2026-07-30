import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { hasErrorCode } from "../src/errors.js";
import { run } from "./process.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const requiredFiles = [
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
];
const expectedPackageFiles = ["lib", "examples", ...requiredFiles];
const issues: string[] = [];

interface PackageJson {
  version: string;
  description: string;
  files?: string[];
  publishConfig?: { registry?: string };
  repository?: unknown;
  homepage?: unknown;
  bugs?: unknown;
  author?: unknown;
}

async function fileExists(relative: string) {
  try {
    return (await stat(path.join(repository, relative))).isFile();
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

for (const file of requiredFiles) {
  if (!(await fileExists(file))) {
    issues.push(`Missing required repository file: ${file}`);
  }
}

const packageJson = JSON.parse(
  await readFile(path.join(repository, "package.json"), "utf8"),
) as PackageJson;
for (const field of ["repository", "homepage", "bugs", "author"] as const) {
  if (!packageJson[field]) {
    issues.push(`package.json is missing ${field}.`);
  }
}
if (packageJson.publishConfig?.registry !== "https://registry.npmjs.org/") {
  issues.push(
    "package.json publishConfig.registry must target the public npm registry.",
  );
}
if (!/html/i.test(packageJson.description)) {
  issues.push(
    "package.json description should describe the default HTML output.",
  );
}
for (const file of expectedPackageFiles) {
  if (!packageJson.files?.includes(file)) {
    issues.push(`package.json files allowlist omits ${file}.`);
  }
}
for (const file of packageJson.files || []) {
  if (!expectedPackageFiles.includes(file)) {
    issues.push(
      `package.json files allowlist contains unexpected entry: ${file}.`,
    );
  }
}

const changelog = await readFile(path.join(repository, "CHANGELOG.md"), "utf8");
const escapedVersion = packageJson.version.replaceAll(".", "\\.");
const releaseHeading = new RegExp(
  `^##\\s+(?:\\[)?${escapedVersion}(?:\\])?(?:\\s|$)`,
  "m",
);
if (!releaseHeading.test(changelog)) {
  issues.push(
    `CHANGELOG.md has no release heading for ${packageJson.version}.`,
  );
}

const tracked = run("git", ["ls-files"], { cwd: repository })
  .stdout.trim()
  .split("\n")
  .filter(Boolean);
const forbiddenTracked = tracked.filter((file) =>
  /(^|\/)(?:node_modules|dist|lib)(?:\/|$)|\.tgz$|\.npmrc$|^[^/]+\.html$/i.test(
    file,
  ),
);
for (const file of forbiddenTracked) {
  issues.push(`Generated or sensitive file is tracked: ${file}`);
}

if (issues.length > 0) {
  process.stderr.write(
    `Local release checks found ${issues.length} blocker(s):\n${issues
      .map((issue) => `- ${issue}`)
      .join("\n")}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write("Local release checks passed.\n");
}
