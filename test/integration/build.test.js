import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { makeFixture, invoke, readAsset, writeFixture } from "../helpers.js";

test("builds a standalone React, Tailwind, and Ant Design app", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `import { Button } from "antd";
export default function Home() {
  return <main className="min-h-screen p-8"><Button type="primary">Standalone</Button></main>;
}`,
  });

  const result = await invoke(["Home.jsx", "--out-dir", "dist"], {
    cwd: fixture,
  });
  assert.equal(result.exitCode, 0, result.stderr);
  assert.match(result.stdout, /Output: .*dist/);

  const output = path.join(fixture, "dist");
  const html = await readFile(path.join(output, "index.html"), "utf8");
  const css = await readAsset(output, ".css");
  const javascript = await readAsset(output, ".js");
  assert.match(html, /\.\/assets\/index-/);
  assert.match(css, /\.min-h-screen\{/);
  assert.match(css, /\.p-8\{/);
  assert.match(javascript, /Standalone/);
  assert.match(javascript, /anticon/);
  const markerName = ".yolojsx-output.json";
  assert.ok((await readdir(output)).includes(markerName));
  const marker = JSON.parse(
    await readFile(path.join(output, markerName), "utf8"),
  );
  assert.equal(marker.tool, "yolojsx");
  assert.equal(marker.formatVersion, 1);
  assert.match(marker.packageVersion, /^\d+\.\d+\.\d+/);
});

test("preserves relative imports, assets, local packages, base, and config isolation", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "pages/Home.jsx": `import Child from "../components/Child.jsx";
import logo from "../logo.svg";
import message from "local-message";
export default function Home() {
  return <><img src={logo} /><Child />{message}</>;
}`,
    "components/Child.jsx": `export default function Child() { return <div className="font-bold tracking-[0.17em]">Relative child</div>; }`,
    "logo.svg": `<svg xmlns="http://www.w3.org/2000/svg"><text>fixture-logo</text></svg>`,
    "node_modules/local-message/package.json": `{"name":"local-message","version":"1.0.0","type":"module","exports":"./index.js"}`,
    "node_modules/local-message/index.js": `export default "Local dependency";`,
    "vite.config.js": `throw new Error("UNRELATED_CONFIG_EXECUTED");`,
  });

  const result = await invoke(
    ["pages/Home.jsx", "--out-dir", "site", "--base", "/application/"],
    { cwd: fixture },
  );
  assert.equal(result.exitCode, 0, result.stderr);

  const output = path.join(fixture, "site");
  const html = await readFile(path.join(output, "index.html"), "utf8");
  const css = await readAsset(output, ".css");
  const javascript = await readAsset(output, ".js");
  assert.match(html, /\/application\/assets\/index-/);
  assert.match(css, /\.font-bold\{/);
  assert.ok(css.includes(".tracking-\\[0\\.17em\\]"));
  assert.match(javascript, /Relative child/);
  assert.match(javascript, /Local dependency/);
  assert.match(javascript, /data:image\/svg\+xml;base64/);
  assert.doesNotMatch(result.stderr, /UNRELATED_CONFIG_EXECUTED/);
});
