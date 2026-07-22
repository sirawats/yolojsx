import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs, USAGE } from "../../src/args.js";

test("parses the documented build options", () => {
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
      outDir: "public/app",
      base: "/demo/",
      singleFile: false,
      output: undefined,
      force: true,
    },
  );
});

test("parses direct single-file and pack commands", () => {
  assert.deepEqual(parseArgs(["Home.jsx", "--single-file"]), {
    action: "build",
    entry: "Home.jsx",
    outDir: "dist",
    base: "./",
    singleFile: true,
    output: undefined,
    force: false,
  });
  assert.deepEqual(
    parseArgs(["Home.jsx", "--single-file", "--output", "index.html"]),
    {
      action: "build",
      entry: "Home.jsx",
      outDir: "dist",
      base: "./",
      singleFile: true,
      output: "index.html",
      force: false,
    },
  );
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

test("rejects missing, multiple, and unknown arguments", () => {
  assert.throws(() => parseArgs([]), /JSX entry file is required/);
  assert.throws(() => parseArgs(["A.jsx", "B.jsx"]), /Exactly one/);
  assert.throws(() => parseArgs(["A.jsx", "--wat"]), /Unknown option/);
  assert.throws(() => parseArgs(["pack", "dist"]), /requires --output/);
  assert.throws(() => parseArgs(["--output", "index.html", "A.jsx"]), /requires --single-file/);
  assert.throws(
    () => parseArgs(["A.jsx", "--single-file", "--out-dir", "site"]),
    /cannot be combined/,
  );
  assert.throws(
    () => parseArgs(["pack", "dist", "--output", "x.html", "--base", "./"]),
    /does not accept/,
  );
  assert.match(USAGE, /--out-dir/);
  assert.match(USAGE, /yolojsx pack/);
});
