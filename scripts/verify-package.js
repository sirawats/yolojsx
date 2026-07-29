import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { npmCommand, run } from "./process.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const temporary = await mkdtemp(
  path.join(os.tmpdir(), "yolojsx-package-verify-"),
);
const packDirectory = path.join(temporary, "pack");
const extractDirectory = path.join(temporary, "extract");
const workDirectory = path.join(temporary, "work");
const globalBinDirectory = path.join(temporary, "global", "bin");

function runCli(packageDirectory, args, expectedStatus = 0) {
  return run(
    process.execPath,
    [path.join(packageDirectory, "bin/yolojsx.js"), ...args],
    {
      cwd: workDirectory,
      expectedStatus,
    },
  );
}

try {
  await Promise.all([
    mkdir(packDirectory),
    mkdir(extractDirectory),
    mkdir(workDirectory),
    mkdir(globalBinDirectory, { recursive: true }),
  ]);

  const packed = run(
    npmCommand,
    ["pack", "--json", "--dry-run=false", "--pack-destination", packDirectory],
    {
      cwd: repository,
      env: { npm_config_cache: path.join(temporary, "npm-cache") },
    },
  );
  const [{ filename }] = JSON.parse(packed.stdout);
  run("tar", [
    "-xzf",
    path.join(packDirectory, filename),
    "-C",
    extractDirectory,
  ]);

  const packageDirectory = path.join(extractDirectory, "package");
  const packagedRootFiles = new Set(await readdir(packageDirectory));
  for (const name of [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "THIRD_PARTY_NOTICES.md",
  ]) {
    if (!packagedRootFiles.has(name)) {
      throw new Error(`Packed artifact omits required document: ${name}`);
    }
  }
  for (const name of [
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "DEPENDENCY_REVIEW.md",
    "NPM_PUBLISHING_GUIDE.md",
    "OPEN_SOURCE_CHECKLIST.md",
    "RELEASING.md",
    "SECURITY.md",
    "SUPPORT.md",
    "docs",
  ]) {
    if (packagedRootFiles.has(name)) {
      throw new Error(
        `Packed artifact includes repository-only material: ${name}`,
      );
    }
  }
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
  runCli(packageDirectory, ["themes"]);
  runCli(packageDirectory, ["--themes"]);
  runCli(packageDirectory, ["Home.jsx"]);
  runCli(packageDirectory, ["Home.jsx", "--output", "index.html"]);
  runCli(packageDirectory, [
    "Home.jsx",
    "--self-contained",
    "--output",
    "offline.html",
  ]);
  runCli(packageDirectory, ["Home.jsx", "--out-dir", "dist"]);
  runCli(packageDirectory, ["pack", "dist", "--output", "packed.html"]);

  const refused = runCli(packageDirectory, ["Home.jsx"], 1);
  if (!refused.stderr.includes("--force")) {
    throw new Error(
      "Non-interactive overwrite did not provide --force guidance.",
    );
  }
  runCli(packageDirectory, ["Home.jsx", "--force"]);
  const legacy = runCli(packageDirectory, [
    "Home.jsx",
    "--single-file",
    "--output",
    "legacy.html",
  ]);
  if (!legacy.stderr.includes("deprecated")) {
    throw new Error(
      "The compatibility alias did not emit a deprecation warning.",
    );
  }

  const themeFiles = (
    await readdir(path.join(packageDirectory, "src/themes"))
  ).filter((name) => name.endsWith(".js") || name.endsWith(".css"));
  if (themeFiles.length !== 22 || !themeFiles.includes("foundation.css")) {
    throw new Error(
      `Packed theme catalog is incomplete: ${themeFiles.length} files.`,
    );
  }
  await readFile(path.join(packageDirectory, "THIRD_PARTY_NOTICES.md"), "utf8");
  for (const name of themeFiles) {
    const stylesheet = await readFile(
      path.join(packageDirectory, "src/themes", name),
      "utf8",
    );
    if (/\.workspace|\.markdown-source-view|\.view-content/.test(stylesheet)) {
      throw new Error(
        `Packed theme asset contains an Obsidian selector: ${name}`,
      );
    }
    if (/--yolo-|\.yolo-/.test(stylesheet)) {
      throw new Error(
        `Packed theme asset contains a removed branded styling API: ${name}`,
      );
    }
    if (/\.ant-[a-z0-9_-]+/i.test(stylesheet)) {
      throw new Error(
        `Packed theme asset patches an Ant Design selector: ${name}`,
      );
    }
  }

  const packagedExamples = (
    await readdir(path.join(packageDirectory, "examples"))
  ).filter((name) => name.endsWith(".jsx"));
  for (const name of packagedExamples) {
    const source = await readFile(
      path.join(packageDirectory, "examples", name),
      "utf8",
    );
    if (
      /import\s+[^;]*["'][^"']+\.css["']/.test(source) ||
      /\byolo-(?:surface|muted|reading|canvas|text|primary|border)\b/.test(
        source,
      )
    ) {
      throw new Error(
        `Packed example contains application theme plumbing: ${name}`,
      );
    }
  }

  const globalExecutable = path.join(globalBinDirectory, "yolojsx");
  await symlink(
    path.join(packageDirectory, "bin/yolojsx.js"),
    globalExecutable,
    "file",
  );
  if (process.platform === "win32") {
    run(process.execPath, [globalExecutable, "--version"], {
      cwd: workDirectory,
    });
  } else {
    run(globalExecutable, ["--version"], { cwd: workDirectory });
  }

  const npmBinDirectory = path.join(workDirectory, "node_modules", ".bin");
  await mkdir(npmBinDirectory, { recursive: true });
  const npmExecutable = path.join(npmBinDirectory, "yolojsx");
  await symlink(
    path.join(packageDirectory, "bin/yolojsx.js"),
    npmExecutable,
    "file",
  );
  if (process.platform === "win32") {
    run(process.execPath, [npmExecutable, "themes"], { cwd: workDirectory });
    run(process.execPath, [npmExecutable, "--themes"], { cwd: workDirectory });
  } else {
    run(npmExecutable, ["themes"], { cwd: workDirectory });
    run(npmExecutable, ["--themes"], { cwd: workDirectory });
  }

  const moduleUrl = pathToFileURL(
    path.join(packageDirectory, "src/single-file.js"),
  );
  const { readEmbeddedPayload } = await import(moduleUrl.href);
  for (const name of [
    "Home.html",
    "index.html",
    "legacy.html",
    "offline.html",
    "packed.html",
  ]) {
    const payload = readEmbeddedPayload(
      await readFile(path.join(workDirectory, name), "utf8"),
    );
    if (
      !payload.script.includes("Package verification") ||
      !payload.script.includes("components") ||
      !payload.styles.join("\n").includes(".p-8{")
    ) {
      throw new Error(`Packed payload verification failed: ${name}`);
    }
    const expectsCdn = name !== "offline.html" && name !== "packed.html";
    if (Boolean(payload.importMap) !== expectsCdn) {
      throw new Error(`Unexpected runtime delivery mode: ${name}`);
    }
  }

  const artifactBytes = (await stat(path.join(workDirectory, "Home.html")))
    .size;
  const artifactBudget = 100_000;
  if (artifactBytes > artifactBudget) {
    throw new Error(
      `Default themed artifact is ${artifactBytes} bytes, above the ${artifactBudget}-byte release budget.`,
    );
  }
  process.stdout.write(
    `Default themed/provider artifact: ${artifactBytes} bytes (budget ${artifactBudget}).\n`,
  );
  const selfContainedBytes = (
    await stat(path.join(workDirectory, "offline.html"))
  ).size;
  const selfContainedBudget = 500_000;
  if (selfContainedBytes > selfContainedBudget) {
    throw new Error(
      `Self-contained themed artifact is ${selfContainedBytes} bytes, above the ${selfContainedBudget}-byte release budget.`,
    );
  }

  process.stdout.write("Packed artifact verification passed.\n");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
