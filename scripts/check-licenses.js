import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const lockfilePath = path.join(repository, "package-lock.json");

const lock = JSON.parse(await readFile(lockfilePath, "utf8"));
const counts = {};
const details = {};
let total = 0;

for (const [pkgPath, pkg] of Object.entries(lock.packages || {})) {
  if (pkgPath === "") {
    continue;
  }
  total += 1;
  let lic = pkg.license;
  if (Array.isArray(lic)) {
    lic = lic.join(", ");
  } else if (typeof lic === "object" && lic !== null) {
    lic = lic.type;
  }
  lic = lic || "UNKNOWN";

  counts[lic] = (counts[lic] || 0) + 1;
  if (!details[lic]) {
    details[lic] = [];
  }
  details[lic].push(pkgPath.replace(/^node_modules\//, ""));
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
