import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseArgs, USAGE } from "../../src/args.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

test("defaults JSX builds to a named HTML file", () => {
  assert.deepEqual(parseArgs(["Home.jsx"]), {
    action: "build",
    entry: "Home.jsx",
    outputMode: "file",
    outDir: undefined,
    base: "./",
    output: undefined,
    theme: "default",
    force: false,
    deprecatedSingleFile: false,
    selfContained: false,
  });
  assert.deepEqual(
    parseArgs([
      "Home.jsx",
      "--output",
      "public/index.html",
      "--theme=./company-theme.jsx",
    ]),
    {
      action: "build",
      entry: "Home.jsx",
      outputMode: "file",
      outDir: undefined,
      base: "./",
      output: "public/index.html",
      theme: "./company-theme.jsx",
      force: false,
      deprecatedSingleFile: false,
      selfContained: false,
    },
  );
});

test("selects directory mode only from an explicit output directory", () => {
  assert.deepEqual(
    parseArgs([
      "Home.jsx",
      "--out-dir",
      "public/app",
      "--base=/demo/",
      "--force",
    ]),
    {
      action: "build",
      entry: "Home.jsx",
      outputMode: "directory",
      outDir: "public/app",
      base: "/demo/",
      output: undefined,
      theme: "default",
      force: true,
      deprecatedSingleFile: false,
      selfContained: false,
    },
  );
});

test("parses deprecated single-file, theme discovery, and pack commands", () => {
  const singleFile = parseArgs(["Home.jsx", "--single-file"]);
  const selfContained = parseArgs(["Home.jsx", "--self-contained"]);
  assert.equal(singleFile.action, "build");
  assert.equal(selfContained.action, "build");
  if (singleFile.action !== "build" || selfContained.action !== "build") {
    assert.fail("Expected build arguments.");
  }
  assert.equal(singleFile.deprecatedSingleFile, true);
  assert.equal(selfContained.selfContained, true);
  assert.deepEqual(parseArgs(["themes"]), { action: "themes" });
  assert.deepEqual(parseArgs(["--themes"]), { action: "themes" });
  assert.deepEqual(parseArgs(["prism-themes"]), { action: "prism-themes" });
  assert.deepEqual(parseArgs(["--prism-themes"]), { action: "prism-themes" });
  assert.deepEqual(parseArgs(["pack", "dist", "--output=index.html"]), {
    action: "pack",
    inputDir: "dist",
    output: "index.html",
    force: false,
  });
});

test("supports help and version without an entry", () => {
  assert.equal(parseArgs(["--help"]).action, "help");
  assert.equal(parseArgs(["--version"]).action, "version");
});

test("keeps the documented CLI help synchronized with runtime usage", async () => {
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const documentedUsage = readme.match(/## CLI\s+```text\n([\s\S]*?)\n```/);
  assert.equal(documentedUsage?.[1], USAGE);
});

test("rejects invalid modes, duplicate values, and action-specific options", () => {
  assert.throws(() => parseArgs([]), /JSX or TSX entry file is required/);
  assert.throws(() => parseArgs(["A.jsx", "B.jsx"]), /Exactly one/);
  assert.throws(() => parseArgs(["A.jsx", "--wat"]), /Unknown option/);
  assert.throws(
    () => parseArgs(["A.jsx", "--base", "/app/"]),
    /requires directory mode/,
  );
  assert.throws(
    () => parseArgs(["A.jsx", "--output", "a.html", "--out-dir", "site"]),
    /cannot be combined/,
  );
  assert.throws(
    () => parseArgs(["A.jsx", "--single-file", "--out-dir", "site"]),
    /cannot be combined/,
  );
  assert.throws(
    () => parseArgs(["A.jsx", "--self-contained", "--out-dir", "site"]),
    /cannot be combined/,
  );
  assert.throws(
    () => parseArgs(["A.jsx", "--theme", "github", "--theme", "material"]),
    /only be specified once/,
  );
  const unresolvedTheme = parseArgs(["A.jsx", "--theme", "missing"]);
  assert.equal(unresolvedTheme.action, "build");
  if (unresolvedTheme.action === "build") {
    assert.equal(unresolvedTheme.theme, "missing");
  }
  assert.throws(() => parseArgs(["themes", "--force"]), /does not accept/);
  assert.throws(() => parseArgs(["--themes", "--force"]), /does not accept/);
  assert.throws(
    () => parseArgs(["prism-themes", "--force"]),
    /does not accept/,
  );
  assert.throws(() => parseArgs(["pack", "dist"]), /requires --output/);
  assert.throws(
    () => parseArgs(["pack", "dist", "--output", "x.html", "--css", "x.css"]),
    /Unknown option: --css/,
  );
  assert.throws(
    () => parseArgs(["A.jsx", "--css", "x.css"]),
    /Unknown option: --css/,
  );
  assert.throws(
    () => parseArgs(["pack", "dist", "--output", "x.html", "--self-contained"]),
    /does not accept --self-contained/,
  );
  assert.match(USAGE, /CDN-backed compressed HTML file by default/);
  assert.match(USAGE, /--self-contained/);
  assert.match(USAGE, /yolojsx themes/);
  assert.match(USAGE, /--themes/);
  assert.match(USAGE, /yolojsx prism-themes/);
  assert.match(USAGE, /--prism-themes/);
  assert.match(USAGE, /--out-dir/);
  assert.match(USAGE, /\.ts\/\.jsx module/);
  assert.doesNotMatch(USAGE, /--css/);
});
