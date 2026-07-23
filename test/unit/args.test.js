import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseArgs, USAGE } from "../../src/args.js";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("defaults JSX builds to a named HTML file", () => {
  assert.deepEqual(parseArgs(["Home.jsx"]), {
    action: "build",
    entry: "Home.jsx",
    outputMode: "file",
    outDir: undefined,
    base: "./",
    output: undefined,
    theme: "default",
    css: undefined,
    force: false,
    deprecatedSingleFile: false,
  });
  assert.deepEqual(
    parseArgs(["Home.jsx", "--output", "public/index.html", "--theme=github", "--css", "app.css"]),
    {
      action: "build",
      entry: "Home.jsx",
      outputMode: "file",
      outDir: undefined,
      base: "./",
      output: "public/index.html",
      theme: "github",
      css: "app.css",
      force: false,
      deprecatedSingleFile: false,
    },
  );
});

test("selects directory mode only from an explicit output directory", () => {
  assert.deepEqual(
    parseArgs(["Home.jsx", "--out-dir", "public/app", "--base=/demo/", "--force"]),
    {
      action: "build",
      entry: "Home.jsx",
      outputMode: "directory",
      outDir: "public/app",
      base: "/demo/",
      output: undefined,
      theme: "default",
      css: undefined,
      force: true,
      deprecatedSingleFile: false,
    },
  );
});

test("parses deprecated single-file, theme discovery, and pack commands", () => {
  assert.equal(parseArgs(["Home.jsx", "--single-file"]).deprecatedSingleFile, true);
  assert.deepEqual(parseArgs(["themes"]), { action: "themes" });
  assert.deepEqual(parseArgs(["--themes"]), { action: "themes" });
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
  assert.throws(() => parseArgs([]), /JSX entry file is required/);
  assert.throws(() => parseArgs(["A.jsx", "B.jsx"]), /Exactly one/);
  assert.throws(() => parseArgs(["A.jsx", "--wat"]), /Unknown option/);
  assert.throws(() => parseArgs(["A.jsx", "--base", "/app/"]), /requires directory mode/);
  assert.throws(() => parseArgs(["A.jsx", "--output", "a.html", "--out-dir", "site"]), /cannot be combined/);
  assert.throws(() => parseArgs(["A.jsx", "--single-file", "--out-dir", "site"]), /cannot be combined/);
  assert.throws(() => parseArgs(["A.jsx", "--theme", "github", "--theme", "material"]), /only be specified once/);
  assert.throws(() => parseArgs(["A.jsx", "--theme", "missing"]), /yolojsx themes/);
  assert.throws(() => parseArgs(["themes", "--force"]), /does not accept/);
  assert.throws(() => parseArgs(["--themes", "--force"]), /does not accept/);
  assert.throws(() => parseArgs(["pack", "dist"]), /requires --output/);
  assert.throws(() => parseArgs(["pack", "dist", "--output", "x.html", "--css", "x.css"]), /does not accept --css/);
  assert.match(USAGE, /HTML file by default/);
  assert.match(USAGE, /yolojsx themes/);
  assert.match(USAGE, /--themes/);
  assert.match(USAGE, /--out-dir/);
});
