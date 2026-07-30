import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { readEmbeddedPayload } from "../../src/single-file.js";
import { invoke, makeFixture, readAsset } from "../helpers.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const examples: [string, string, string, boolean?][] = [
  ["Techspec.jsx", "github", "Session architecture"],
  ["APIDocs.jsx", "github-dark", "Open API Atlas", true],
  ["TaxCalculator.jsx", "material", "Illustrative Tax Estimator"],
  ["SaaS.jsx", "catppuccin", "Nimbus"],
  ["Analytics.jsx", "one-dark", "Platform operations"],
  ["Editorial.jsx", "obsidian-minimal", "Field Notes"],
];

test("builds every documented example in file and directory modes", async (t) => {
  const fixture = await makeFixture("yolojsx-examples-");
  t.after(() => rm(fixture, { recursive: true, force: true }));

  for (const [
    filename,
    theme,
    expectedText,
    hasCodePanel = false,
  ] of examples) {
    const basename = path.basename(filename, ".jsx");
    const fileOutput = path.join(fixture, `${basename}.html`);
    const fileResult = await invoke(
      [path.join(repository, "examples", filename), "--theme", theme],
      { cwd: fixture },
    );
    assert.equal(
      fileResult.exitCode,
      0,
      `${filename} file mode: ${fileResult.stderr}`,
    );
    const payload = readEmbeddedPayload(await readFile(fileOutput, "utf8"));
    assert.match(payload.script, new RegExp(expectedText), filename);
    assert.match(payload.script, /components/, filename);
    assert.match(payload.styles.join("\n"), /--background:/, filename);
    assert.doesNotMatch(payload.styles.join("\n"), /--yolo-|\.yolo-/, filename);
    if (hasCodePanel) {
      const css = payload.styles.join("\n");
      assert.match(
        css,
        /pre>code\{(?=[^}]*color:inherit)(?=[^}]*background:(?:transparent|0 0))[^}]*\}/,
      );
      assert.match(payload.script, /language-json/);
      assert.match(payload.script, /dangerouslySetInnerHTML/);
    }

    const directoryOutput = path.join(fixture, `${basename}-dist`);
    const directoryResult = await invoke(
      [
        path.join(repository, "examples", filename),
        "--theme",
        theme,
        "--out-dir",
        directoryOutput,
      ],
      { cwd: fixture },
    );
    assert.equal(
      directoryResult.exitCode,
      0,
      `${filename} directory mode: ${directoryResult.stderr}`,
    );
    const directoryScript = await readAsset(directoryOutput, ".js");
    assert.match(directoryScript, new RegExp(expectedText), filename);
    assert.match(directoryScript, /components/, filename);
    const directoryThemeCss = await readAsset(directoryOutput, ".css");
    assert.match(directoryThemeCss, /--background:/, filename);
    assert.doesNotMatch(directoryThemeCss, /--yolo-|\.yolo-/, filename);
    if (hasCodePanel) {
      assert.match(
        directoryThemeCss,
        /pre>code\{(?=[^}]*color:inherit)(?=[^}]*background:(?:transparent|0 0))[^}]*\}/,
      );
      assert.match(directoryScript, /language-json/);
      assert.match(directoryScript, /dangerouslySetInnerHTML/);
    }
  }
});
