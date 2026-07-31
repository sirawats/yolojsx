import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const lockfilePath = path.join(repository, "package-lock.json");

const lock: unknown = JSON.parse(await readFile(lockfilePath, "utf8"));
if (typeof lock !== "object" || lock === null || !("packages" in lock)) {
  throw new Error("package-lock.json must contain a packages object.");
}
const packages = lock.packages;
if (typeof packages !== "object" || packages === null) {
  throw new Error("package-lock.json packages must be an object.");
}
const counts: Record<string, number> = {};
const details: Record<string, string[]> = {};
let total = 0;

function licenseName(
  license: string | string[] | { type: string } | undefined,
): string {
  if (Array.isArray(license)) return license.join(", ");
  if (typeof license === "object" && license !== null) return license.type;
  return typeof license === "string" && license ? license : "UNKNOWN";
}

for (const [pkgPath, value] of Object.entries(packages)) {
  const pkg = value as {
    license?: string | string[] | { type: string };
  };
  if (pkgPath === "") {
    continue;
  }
  total += 1;
  const license = licenseName(pkg.license);

  counts[license] = (counts[license] || 0) + 1;
  if (!details[license]) {
    details[license] = [];
  }
  details[license].push(pkgPath.replace(/^node_modules\//, ""));
}

process.stdout.write(`Total lockfile dependencies: ${total}\n`);
process.stdout.write(`License counts: ${JSON.stringify(counts, null, 2)}\n`);
process.stdout.write(
  `Non-MIT packages: ${JSON.stringify(
    Object.fromEntries(Object.entries(details).filter(([k]) => k !== "MIT")),
    null,
    2,
  )}\n`,
);
