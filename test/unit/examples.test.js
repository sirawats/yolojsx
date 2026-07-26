import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const examplesDirectory = path.join(repository, "examples");

test("packaged examples rely on CLI-managed theme styling", async () => {
  const filenames = (await readdir(examplesDirectory))
    .filter((name) => name.endsWith(".jsx"))
    .sort();
  assert.ok(filenames.length > 0);

  for (const filename of filenames) {
    const source = await readFile(
      path.join(examplesDirectory, filename),
      "utf8",
    );
    assert.doesNotMatch(source, /import\s+[^;]*["'][^"']+\.css["']/, filename);
    assert.doesNotMatch(
      source,
      /\b(?:ConfigProvider|StyleProvider)\b/,
      filename,
    );
    assert.doesNotMatch(
      source,
      /className\s*=\s*(?:["'`][^"'`]*\byolo-|{[^}]*["'`][^"'`]*\byolo-)/,
      filename,
    );
    assert.doesNotMatch(source, /\byolo-(?:surface|muted|reading)\b/, filename);
    assert.doesNotMatch(
      source,
      /(?:bg|text|border|ring)-\[#(?:[0-9a-f]{3}){1,2}\]/i,
      filename,
    );
    assert.doesNotMatch(
      source,
      /(?:color|backgroundColor|borderColor)\s*:\s*["']#[0-9a-f]{3,8}["']/i,
      filename,
    );
    assert.doesNotMatch(source, /className\s*=\s*["'][^"']*![a-z]/, filename);
    assert.doesNotMatch(source, /--css\b/, filename);
  }
});
