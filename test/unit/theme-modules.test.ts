import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  loadThemeModule,
  resolveThemeSelection,
} from "../../src/theme-modules.js";
import { makeFixture, writeFixture } from "../helpers.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const defaultDefinition = await readFile(
  path.join(repository, "src/themes/default.jsx"),
  "utf8",
);

test("resolves presets before local theme modules", async () => {
  const selected = await resolveThemeSelection("default", repository);
  assert.equal(selected.theme.id, "default");
  assert.equal(selected.source, undefined);
});

test("loads TypeScript and JSX theme definitions through Vite", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "base.jsx": defaultDefinition,
    "company.ts": `import base from "./base.js";
export default { ...base, id: "company-ts", name: "Company TS", aliases: [] };`,
    "company.jsx": `import { Button } from "antd";
import { LuPlane } from "react-icons/lu";
import base from "./base.js";
export function CompanyPanel() {
  return <Button><LuPlane aria-hidden="true" />Company</Button>;
}
export default { ...base, id: "company-jsx", name: "Company JSX", aliases: [] };`,
  });

  const typescript = await resolveThemeSelection("company.ts", fixture);
  assert.equal(typescript.theme.id, "company-ts");
  assert.equal(typescript.source, path.join(fixture, "company.ts"));

  const jsx = await resolveThemeSelection("./company.jsx", fixture);
  assert.equal(jsx.theme.id, "company-jsx");
  assert.equal(jsx.source, path.join(fixture, "company.jsx"));
});

test("reports missing, invalid, and unloadable theme definitions", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "base.ts": defaultDefinition,
    "missing.ts": "export const value = 1;",
    "invalid.ts": `import base from "./base.ts";
export default { ...base, colors: { ...base.colors, primary: "red" } };`,
    "syntax.jsx": "export default <;",
  });

  await assert.rejects(
    loadThemeModule(path.join(fixture, "missing.ts"), fixture),
    /default-export a theme definition object.*missing\.ts/,
  );
  await assert.rejects(
    loadThemeModule(path.join(fixture, "invalid.ts"), fixture),
    /invalid semantic color: primary/,
  );
  await assert.rejects(
    loadThemeModule(path.join(fixture, "syntax.jsx"), fixture),
    /Could not load theme module.*syntax\.jsx/,
  );
  await assert.rejects(
    resolveThemeSelection("missing", fixture),
    /Unknown theme: missing.*yolojsx themes/,
  );
});
