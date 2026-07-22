import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  resolveAndValidateEntry,
  resolveAndValidateHtmlOutput,
  resolveAndValidateInputDirectory,
  resolveAndValidateOutput,
} from "../../src/paths.js";
import { makeFixture, writeFixture } from "../helpers.js";

test("resolves valid entry and output paths from cwd", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, { "src/Home.jsx": "export default () => null;" });

  const entry = await resolveAndValidateEntry("src/Home.jsx", fixture);
  const output = await resolveAndValidateOutput("site", fixture, entry);
  assert.equal(output, path.join(fixture, "site"));
});

test("resolves pack inputs and single-file output names", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "pages/Home.jsx": "export default () => null;",
    "dist/index.html": "<!doctype html>",
  });

  const entry = await resolveAndValidateEntry("pages/Home.jsx", fixture);
  assert.equal(
    await resolveAndValidateHtmlOutput(undefined, fixture, { entry }),
    path.join(fixture, "Home.html"),
  );
  assert.equal(
    await resolveAndValidateHtmlOutput("public/index.html", fixture, { entry }),
    path.join(fixture, "public/index.html"),
  );

  const inputDirectory = await resolveAndValidateInputDirectory("dist", fixture);
  await assert.rejects(
    resolveAndValidateHtmlOutput("dist/packed.html", fixture, { inputDirectory }),
    /inside its input directory/,
  );
  await assert.rejects(
    resolveAndValidateHtmlOutput("output.txt", fixture, { entry }),
    /must end in .html/,
  );
});

test("rejects invalid entries and dangerous output paths", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "src/Home.jsx": "export default () => null;",
    "src/Home.tsx": "export default () => null;",
  });

  await assert.rejects(
    resolveAndValidateEntry("src/Home.tsx", fixture),
    /must be a .jsx file/,
  );
  const entry = await resolveAndValidateEntry("src/Home.jsx", fixture);
  await assert.rejects(
    resolveAndValidateOutput(".", fixture, entry),
    /current working directory/,
  );
  await assert.rejects(
    resolveAndValidateOutput("src", fixture, entry),
    /contains the source entry/,
  );
});
