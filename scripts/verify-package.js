import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { npmCommand, run } from "./process.js";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = await mkdtemp(path.join(os.tmpdir(), "yolojsx-package-verify-"));
const packDirectory = path.join(temporary, "pack");
const extractDirectory = path.join(temporary, "extract");
const workDirectory = path.join(temporary, "work");

function runCli(packageDirectory, args, expectedStatus = 0) {
  return run(process.execPath, [path.join(packageDirectory, "bin/yolojsx.js"), ...args], {
    cwd: workDirectory,
    expectedStatus,
  });
}

try {
  await Promise.all([
    mkdir(packDirectory),
    mkdir(extractDirectory),
    mkdir(workDirectory),
  ]);

  const packed = run(
    npmCommand,
    ["pack", "--json", "--pack-destination", packDirectory],
    {
      cwd: repository,
      env: { npm_config_cache: path.join(temporary, "npm-cache") },
    },
  );
  const [{ filename }] = JSON.parse(packed.stdout);
  run("tar", ["-xzf", path.join(packDirectory, filename), "-C", extractDirectory]);

  const packageDirectory = path.join(extractDirectory, "package");
  await symlink(
    path.join(repository, "node_modules"),
    path.join(packageDirectory, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await writeFile(
    path.join(workDirectory, "Home.jsx"),
    `import { Button } from "antd";
export default () => <main className="p-8"><Button>Package verification</Button></main>;
`,
    "utf8",
  );

  runCli(packageDirectory, ["--version"]);
  runCli(packageDirectory, ["Home.jsx"]);
  runCli(packageDirectory, ["Home.jsx", "--single-file"]);
  runCli(packageDirectory, [
    "Home.jsx",
    "--single-file",
    "--output",
    "index.html",
  ]);
  runCli(packageDirectory, ["pack", "dist", "--output", "packed.html"]);

  const refused = runCli(packageDirectory, ["Home.jsx", "--single-file"], 1);
  if (!refused.stderr.includes("--force")) {
    throw new Error("Non-interactive overwrite did not provide --force guidance.");
  }
  runCli(packageDirectory, ["Home.jsx", "--single-file", "--force"]);

  const moduleUrl = pathToFileURL(path.join(packageDirectory, "src/single-file.js"));
  const { readEmbeddedPayload } = await import(moduleUrl.href);
  for (const name of ["Home.html", "index.html", "packed.html"]) {
    const payload = readEmbeddedPayload(
      await readFile(path.join(workDirectory, name), "utf8"),
    );
    if (
      !payload.script.includes("Package verification") ||
      !payload.styles.join("\n").includes(".p-8{")
    ) {
      throw new Error(`Packed payload verification failed: ${name}`);
    }
  }

  process.stdout.write("Packed artifact verification passed.\n");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
