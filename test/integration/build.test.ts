import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { readEmbeddedPayload } from "../../src/single-file.js";
import { makeFixture, invoke, readAsset, writeFixture } from "../helpers.js";

test("builds a standalone React, Tailwind, and Ant Design app", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `import { Button } from "antd";
import icon from "./icon.svg";
export const YOLOJSX = { title: "Fixture application", icon };
export default function Home() {
  return <main className="min-h-screen p-8"><Button type="primary">Standalone</Button></main>;
}`,
    "icon.svg": `<svg xmlns="http://www.w3.org/2000/svg"><text>fixture-icon</text></svg>`,
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
  assert.match(javascript, /Fixture application/);
  assert.match(javascript, /data:image\/svg\+xml;base64/);
  assert.match(javascript, /anticon/);
  assert.ok(javascript.length < 500_000);
  assert.doesNotMatch(javascript, /ant-table|ant-picker|ant-upload/);
  const markerName = ".yolojsx-output.json";
  assert.ok((await readdir(output)).includes(markerName));
  const marker = JSON.parse(
    await readFile(path.join(output, markerName), "utf8"),
  ) as { tool: string; formatVersion: number; packageVersion: string };
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

test("builds apps using supplied icons and Prism packages without local installations", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `import { LuCalculator } from "react-icons/lu";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

export const YOLOJSX = { prismTheme: "prism" };

const highlightCode = (element) => {
  if (element) Prism.highlightElement(element);
};

export default function App() {
  const code = '{"tax":100}';
  return (
    <main className="supplied-dep-test">
      <LuCalculator />
      <pre className="language-json line-numbers">
        <code ref={highlightCode} className="language-json">{code}</code>
      </pre>
    </main>
  );
}`,
  });

  const dirResult = await invoke(["App.jsx", "--out-dir", "dist"], {
    cwd: fixture,
  });
  assert.equal(dirResult.exitCode, 0, dirResult.stderr);
  const output = path.join(fixture, "dist");
  const javascript = await readAsset(output, ".js");
  const stylesheet = await readAsset(output, ".css");
  assert.match(javascript, /supplied-dep-test/);
  assert.match(javascript, /tax/);
  assert.match(javascript, /line-numbers-rows/);
  assert.match(javascript, /yolojsxPrismTheme/);
  assert.match(javascript, /@layer components/);
  assert.match(javascript, /background:\s*transparent/);
  assert.match(javascript, /token\.keyword/);
  assert.match(javascript, /#f5f2f0/);
  assert.match(
    stylesheet,
    /pre\.line-numbers\s*>\s*code\s*\{[^}]*font:\s*inherit/,
  );

  const fileResult = await invoke(["App.jsx", "--output", "App.html"], {
    cwd: fixture,
  });
  assert.equal(fileResult.exitCode, 0, fileResult.stderr);
  const html = await readFile(path.join(fixture, "App.html"), "utf8");
  const payload = readEmbeddedPayload(html);
  assert.match(payload.script, /supplied-dep-test/);
  assert.match(payload.script, /tax/);
  assert.match(payload.script, /line-numbers-rows/);
  assert.match(payload.script, /yolojsxPrismTheme/);
  assert.match(payload.script, /token\.keyword/);
  assert.match(payload.script, /#f5f2f0/);
  assert.match(
    payload.styles.join("\n"),
    /pre\.line-numbers\s*>\s*code\s*\{[^}]*font:\s*inherit/,
  );
});

test("warns and uses the default Prism theme for an unknown name", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Unknown.jsx": `export const YOLOJSX = { prismTheme: "missing" };
export default () => <pre>Unknown</pre>;`,
    "Dynamic.jsx": `const prismTheme = "prism";
export const YOLOJSX = { prismTheme };
export default () => <pre>Dynamic</pre>;`,
  });

  const unknown = await invoke(["Unknown.jsx"], { cwd: fixture });
  assert.equal(unknown.exitCode, 0, unknown.stderr);
  assert.match(unknown.stderr, /Unknown Prism theme "missing"/);
  assert.match(unknown.stderr, /using "prism"/);
  assert.match(unknown.stderr, /yolojsx prism-themes/);
  const payload = readEmbeddedPayload(
    await readFile(path.join(fixture, "Unknown.html"), "utf8"),
  );
  assert.match(payload.script, /#f5f2f0/);

  const directory = await invoke(["Unknown.jsx", "--out-dir", "unknown-dist"], {
    cwd: fixture,
  });
  assert.equal(directory.exitCode, 0, directory.stderr);
  assert.match(directory.stderr, /Unknown Prism theme "missing"/);
  assert.match(
    await readAsset(path.join(fixture, "unknown-dist"), ".js"),
    /#f5f2f0/,
  );

  const dynamic = await invoke(["Dynamic.jsx"], { cwd: fixture });
  assert.equal(dynamic.exitCode, 1);
  assert.match(dynamic.stderr, /YOLOJSX\.prismTheme must be a string literal/);
});
