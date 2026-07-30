import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { readEmbeddedPayload } from "../../src/single-file.js";
import { loadPrismThemeCatalog } from "../../src/prism-themes.js";
import { THEMES } from "../../src/themes.js";
import { invoke, makeFixture, readAsset, writeFixture } from "../helpers.js";

test("builds every fixed preset with global, Tailwind, and Ant Design styling", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Catalog.jsx": `import { Alert, Button, Space, Typography } from "antd";
export default function Catalog() {
  return <main className="min-h-screen bg-background p-8 text-foreground">
    <h1>Theme catalog</h1><Typography.Text type="secondary">Semantic global styles</Typography.Text>
    <section className="mt-4 rounded-lg border border-border bg-card p-4">
      <Space wrap>
        <Button>Default</Button><Button type="primary">Primary</Button>
        <Button type="text">Text</Button><Button type="link">Link</Button>
        <Button ghost>Ghost</Button><Button danger>Danger</Button>
        <Button disabled>Disabled</Button>
      </Space>
    </section>
    <Alert type="success" title="Ready" />
  </main>;
}`,
  });

  for (const theme of THEMES) {
    const outputName = `site-${theme.id}`;
    const result = await invoke(
      ["Catalog.jsx", "--theme", theme.id, "--out-dir", outputName],
      { cwd: fixture },
    );
    assert.equal(result.exitCode, 0, `${theme.id}: ${result.stderr}`);
    const output = path.join(fixture, outputName);
    const css = await readAsset(output, ".css");
    const javascript = await readAsset(output, ".js");
    assert.match(css, /\.bg-background\{/i, theme.id);
    assert.match(css, /\.text-foreground\{/i, theme.id);
    assert.match(css, /\.bg-card\{/i, theme.id);
    assert.match(css, /\.border-border\{/i, theme.id);
    assert.match(css, /--heading-weight:/, theme.id);
    assert.match(css, /@layer antd/, theme.id);
    assert.match(css, /box-sizing:border-box/, theme.id);
    assert.match(javascript, /Theme catalog/, theme.id);
    assert.match(javascript, /components/, theme.id);
    assert.match(javascript, /colorPrimary/, theme.id);
    assert.match(javascript, /defaultHoverBg/, theme.id);
    assert.match(javascript, /defaultActiveBg/, theme.id);
    assert.match(javascript, /defaultBgDisabled/, theme.id);
    assert.doesNotMatch(css, /\.bg-yolo-|\.text-yolo-|\.yolo-/i, theme.id);
    assert.doesNotMatch(css, /\.ant-[\w-]+\s*\{/i, theme.id);
    assert.doesNotMatch(css, /antd\/dist\/reset|reset\.css/, theme.id);
    assert.doesNotMatch(css, /prefers-color-scheme/, theme.id);
  }
});

test("applies custom CSS after the preset with CSS-first utilities and local assets in both modes", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Custom.jsx": `import { Button } from "antd";
export default () => <main className="custom-card bg-brand content-auto p-8"><Button>Custom</Button></main>;`,
    "styles/custom.css": `@theme { --color-brand: #7346a8; }
:root { --primary: #7346a8; }
@layer components {
  .custom-card { background-image: url("./mark.svg"); border: 3px solid var(--primary); }
}
@utility content-auto { content-visibility: auto; }`,
    "styles/mark.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><circle cx="4" cy="4" r="4" fill="#7346a8"/></svg>`,
  });

  const directory = await invoke(
    [
      "Custom.jsx",
      "--theme",
      "material-light",
      "--css",
      "styles/custom.css",
      "--out-dir",
      "site",
    ],
    { cwd: fixture },
  );
  assert.equal(directory.exitCode, 0, directory.stderr);
  const directoryCss = await readAsset(path.join(fixture, "site"), ".css");
  assert.match(directoryCss, /\.bg-brand\{/);
  assert.match(directoryCss, /\.content-auto\{/);
  assert.match(directoryCss, /\.custom-card\{/);
  assert.match(directoryCss, /data:image\/svg\+xml/);
  assert.ok(
    directoryCss.lastIndexOf("--primary:#7346a8") >
      directoryCss.indexOf("--primary:#6750a4"),
    "custom semantic variables should follow preset variables",
  );

  const packaged = await invoke(
    [
      "Custom.jsx",
      "--theme",
      "material-light",
      "--css",
      "styles/custom.css",
      "--output",
      "Custom.html",
    ],
    { cwd: fixture },
  );
  assert.equal(packaged.exitCode, 0, packaged.stderr);
  const payload = readEmbeddedPayload(
    await readFile(path.join(fixture, "Custom.html"), "utf8"),
  );
  const packagedCss = payload.styles.join("\n");
  assert.match(packagedCss, /\.bg-brand\{/);
  assert.match(packagedCss, /\.content-auto\{/);
  assert.match(packagedCss, /data:image\/svg\+xml/);
  assert.match(payload.script, /Custom/);
});

test("lists themes and resolves aliases through the CLI", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Alias.jsx": `export default () => <div className="p-4">Alias</div>;`,
  });

  const listing = await invoke(["themes"], { cwd: fixture });
  assert.equal(listing.exitCode, 0, listing.stderr);
  assert.equal(
    listing.stdout,
    `${THEMES.map((theme) => theme.id).join("\n")}\n`,
  );

  const optionListing = await invoke(["--themes"], { cwd: fixture });
  assert.equal(optionListing.exitCode, 0, optionListing.stderr);
  assert.equal(optionListing.stdout, listing.stdout);

  const lightAlias = await invoke(
    ["Alias.jsx", "--theme", "material", "--out-dir", "material"],
    { cwd: fixture },
  );
  assert.equal(lightAlias.exitCode, 0, lightAlias.stderr);
  const lightCss = await readAsset(path.join(fixture, "material"), ".css");
  assert.match(lightCss, /--background:#fffbfe/);
  assert.doesNotMatch(lightCss, /prefers-color-scheme/);

  const alias = await invoke(["Alias.jsx", "--theme", "onedark"], {
    cwd: fixture,
  });
  assert.equal(alias.exitCode, 0, alias.stderr);
  assert.ok(await readFile(path.join(fixture, "Alias.html"), "utf8"));
});

test("lists themes discovered from PrismJS and Prism Themes", async () => {
  const catalog = await loadPrismThemeCatalog();
  assert.ok(catalog.has("prism"));
  assert.ok(catalog.has("vsc-dark-plus"));
  assert.ok([...catalog.keys()].every((name) => !name.endsWith(".min")));

  const listing = await invoke(["prism-themes"]);
  assert.equal(listing.exitCode, 0, listing.stderr);
  assert.equal(listing.stdout, `${[...catalog.keys()].join("\n")}\n`);

  const optionListing = await invoke(["--prism-themes"]);
  assert.equal(optionListing.exitCode, 0, optionListing.stderr);
  assert.equal(optionListing.stdout, listing.stdout);
});
