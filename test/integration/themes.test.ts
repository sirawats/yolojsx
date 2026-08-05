import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { npmCommand, run } from "../../scripts/process.js";
import { readEmbeddedPayload } from "../../src/single-file.js";
import { loadPrismThemeCatalog } from "../../src/prism-themes.js";
import { THEMES } from "../../src/themes.js";
import { invoke, makeFixture, readAsset, writeFixture } from "../helpers.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const defaultDefinition = await readFile(
  path.join(repository, "src/themes/default.jsx"),
  "utf8",
);

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
    assert.doesNotMatch(
      css,
      /\.bg-rtifact-|\.text-rtifact-|\.rtifact-/i,
      theme.id,
    );
    assert.doesNotMatch(css, /\.ant-[\w-]+\s*\{/i, theme.id);
    assert.doesNotMatch(css, /antd\/dist\/reset|reset\.css/, theme.id);
    assert.doesNotMatch(css, /prefers-color-scheme/, theme.id);
  }
});

test("processes application-imported CSS and local assets in both modes", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Custom.jsx": `import { Button } from "antd";
import "./styles/custom.css";
export default () => <main className="custom-card content-auto p-8"><Button>Custom</Button></main>;`,
    "styles/custom.css": `.custom-card {
  background-image: url("./mark.svg");
  border: 3px solid #7346a8;
}
.content-auto { content-visibility: auto; }`,
    "styles/mark.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><circle cx="4" cy="4" r="4" fill="#7346a8"/></svg>`,
  });

  const directory = await invoke(
    ["Custom.jsx", "--theme", "material-light", "--out-dir", "site"],
    { cwd: fixture },
  );
  assert.equal(directory.exitCode, 0, directory.stderr);
  const directoryCss = await readAsset(path.join(fixture, "site"), ".css");
  assert.match(directoryCss, /\.content-auto\{/);
  assert.match(directoryCss, /\.custom-card\{/);
  assert.match(directoryCss, /data:image\/svg\+xml/);

  const packaged = await invoke(
    ["Custom.jsx", "--theme", "material-light", "--output", "Custom.html"],
    { cwd: fixture },
  );
  assert.equal(packaged.exitCode, 0, packaged.stderr);
  const payload = readEmbeddedPayload(
    await readFile(path.join(fixture, "Custom.html"), "utf8"),
  );
  const packagedCss = payload.styles.join("\n");
  assert.match(packagedCss, /\.content-auto\{/);
  assert.match(packagedCss, /data:image\/svg\+xml/);
  assert.match(payload.script, /Custom/);
});

test("builds TypeScript and JSX theme modules in every output mode", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "app/Home.jsx": `import { CompanyPanel } from "../brand/company-theme.jsx";
export default function Home() {
  return <main className="min-h-screen bg-background p-8"><CompanyPanel /></main>;
}`,
    "app/Plain.jsx": `export default () => <main className="bg-background p-8">Plain company theme</main>;`,
    "brand/base.ts": defaultDefinition,
    "brand/company-theme.ts": `import base from "./base.ts";
export default {
  ...base,
  id: "company-ts",
  name: "Company TS",
  aliases: [],
  colors: { ...base.colors, canvas: "#f0f7ff", primary: "#0057b8" },
};`,
    "brand/company-theme.jsx": `import { Button } from "antd";
import { LuPlane } from "react-icons/lu";
import base from "./base.ts";

export function CompanyPanel({ children = "Company panel" }) {
  return <section className="rounded-lg bg-card p-6 outline-[7px] outline-primary">
    <Button type="primary"><LuPlane aria-hidden="true" />{children}</Button>
  </section>;
}

export default {
  ...base,
  id: "company-jsx",
  name: "Company JSX",
  aliases: [],
  colors: { ...base.colors, canvas: "#f0f7ff", primary: "#0057b8" },
};`,
  });
  const app = path.join(fixture, "app");

  const directory = await invoke(
    ["Home.jsx", "--theme", "../brand/company-theme.jsx", "--out-dir", "site"],
    { cwd: app },
  );
  assert.equal(directory.exitCode, 0, directory.stderr);
  const directoryCss = await readAsset(path.join(app, "site"), ".css");
  const directoryScript = await readAsset(path.join(app, "site"), ".js");
  assert.match(directoryCss, /--primary:#0057b8/);
  assert.match(directoryCss, /outline-width:7px/);
  assert.match(directoryScript, /Company panel/);
  assert.match(directoryScript, /colorPrimary/);

  const file = await invoke(
    [
      "Plain.jsx",
      "--theme",
      "../brand/company-theme.ts",
      "--output",
      "Company.html",
    ],
    { cwd: app },
  );
  assert.equal(file.exitCode, 0, file.stderr);
  const filePayload = readEmbeddedPayload(
    await readFile(path.join(app, "Company.html"), "utf8"),
  );
  assert.match(filePayload.styles.join("\n"), /--primary:#0057b8/);
  assert.match(filePayload.script, /Plain company theme/);

  const selfContained = await invoke(
    [
      "Home.jsx",
      "--theme",
      "../brand/company-theme.jsx",
      "--self-contained",
      "--output",
      "CompanyOffline.html",
    ],
    { cwd: app },
  );
  assert.equal(selfContained.exitCode, 0, selfContained.stderr);
  const offlinePayload = readEmbeddedPayload(
    await readFile(path.join(app, "CompanyOffline.html"), "utf8"),
  );
  assert.equal(offlinePayload.importMap, undefined);
  assert.match(offlinePayload.styles.join("\n"), /outline-width:7px/);
  assert.match(offlinePayload.script, /Company panel/);
});

test("rejects invalid theme inputs before mutating output", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "Home.jsx": `export default () => <main>Theme failure</main>;`,
    "base.ts": defaultDefinition,
    "invalid.ts": `import base from "./base.ts";
export default { ...base, colors: { ...base.colors, primary: "invalid" } };`,
    "unsupported.tsx": "export default {};",
    "site/keep.txt": "preserve",
  });

  const invalid = await invoke(
    ["Home.jsx", "--theme", "invalid.ts", "--out-dir", "site", "--force"],
    { cwd: fixture },
  );
  assert.equal(invalid.exitCode, 1);
  assert.match(invalid.stderr, /invalid semantic color: primary/);
  assert.equal(
    await readFile(path.join(fixture, "site/keep.txt"), "utf8"),
    "preserve",
  );

  const unknown = await invoke(["Home.jsx", "--theme", "missing"], {
    cwd: fixture,
  });
  assert.equal(unknown.exitCode, 1);
  assert.match(unknown.stderr, /Unknown theme: missing/);
  assert.match(unknown.stderr, /rtifact themes/);

  const unsupported = await invoke(["Home.jsx", "--theme", "unsupported.tsx"], {
    cwd: fixture,
  });
  assert.equal(unsupported.exitCode, 1);
  assert.match(unsupported.stderr, /must be a .ts or .jsx file/);

  const removedCss = await invoke(["Home.jsx", "--css", "custom.css"], {
    cwd: fixture,
  });
  assert.equal(removedCss.exitCode, 1);
  assert.match(removedCss.stderr, /Unknown option: --css/);
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

test("forwards source CLI options through npm's argument separator", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const entry = path.join(fixture, "Forwarded.jsx");
  const output = path.join(fixture, "forwarded.html");
  await writeFixture(fixture, {
    "Forwarded.jsx": `export default () => <main>Forwarded</main>;`,
    "forwarded.html": "previous output",
  });

  const listing = run(npmCommand, ["run", "cli", "--", "--themes"], {
    cwd: repository,
  });
  assert.match(listing.stdout, /(?:^|\n)rtifact(?:\n|$)/);

  run(
    npmCommand,
    [
      "run",
      "cli",
      "--",
      entry,
      "--theme",
      "rtifact",
      "--output",
      output,
      "--force",
    ],
    { cwd: repository },
  );
  assert.notEqual(await readFile(output, "utf8"), "previous output");
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

test("builds single-file and directory outputs with custom theme embedded CSS", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `export default () => <main><code className="custom-code">const x = 1;</code></main>;`,
    "themes/embedded.jsx": `${defaultDefinition
      .replace('id: "default"', 'id: "embedded-custom"')
      .replace(
        "controlHeight: 32,",
        'controlHeight: 32, css: ":not(pre) > code { padding: 0.35em; border: 2px solid var(--primary); }",',
      )}`,
  });

  const directory = await invoke(
    ["App.jsx", "--theme", "./themes/embedded.jsx", "--out-dir", "dist"],
    { cwd: fixture },
  );
  assert.equal(directory.exitCode, 0, directory.stderr);
  const directoryCss = await readAsset(path.join(fixture, "dist"), ".css");
  assert.match(directoryCss, /padding:0?\.35em/);
  assert.match(directoryCss, /border:2px solid var\(--primary\)/);

  const singleFile = await invoke(
    ["App.jsx", "--theme", "./themes/embedded.jsx", "--output", "App.html"],
    { cwd: fixture },
  );
  assert.equal(singleFile.exitCode, 0, singleFile.stderr);
  const html = await readFile(path.join(fixture, "App.html"), "utf8");
  const payload = readEmbeddedPayload(html);
  assert.match(payload.styles.join("\n"), /padding:0?\.35em/);
});

test("reports actionable diagnostic when custom theme embedded CSS contains malformed syntax", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `export default () => <main>App</main>;`,
    "themes/broken-css.jsx": `${defaultDefinition
      .replace('id: "default"', 'id: "broken-css"')
      .replace(
        "controlHeight: 32,",
        'controlHeight: 32, css: "div { color: ;",',
      )}`,
  });

  const result = await invoke(
    ["App.jsx", "--theme", "./themes/broken-css.jsx"],
    { cwd: fixture },
  );
  assert.notEqual(
    result.exitCode,
    0,
    "Build should fail for malformed embedded CSS",
  );
  assert.match(result.stderr, /error|invalid|Unexpected|Unclosed|css/i);
});

test("preserves theme build isolation and scans custom theme source for CSS discovery without leaking across builds", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "App.jsx": `import { CustomWidget } from "./themes/first.jsx";
export default () => <main><CustomWidget /></main>;`,
    "themes/first.jsx": `export function CustomWidget() { return <div className="tracking-widest">Widget</div>; }
${defaultDefinition
  .replace('id: "default"', 'id: "first-theme"')
  .replace(
    "controlHeight: 32,",
    'controlHeight: 32, css: ".first-theme-rule { opacity: 0.99; }",',
  )}`,
    "themes/second.jsx": defaultDefinition
      .replace('id: "default"', 'id: "second-theme"')
      .replace(
        "controlHeight: 32,",
        'controlHeight: 32, css: ".second-theme-rule { opacity: 0.88; }",',
      ),
  });

  const firstBuild = await invoke(
    ["App.jsx", "--theme", "./themes/first.jsx", "--out-dir", "first-dist"],
    { cwd: fixture },
  );
  assert.equal(firstBuild.exitCode, 0, firstBuild.stderr);
  const firstCss = await readAsset(path.join(fixture, "first-dist"), ".css");
  assert.match(firstCss, /first-theme-rule/);
  assert.match(firstCss, /tracking-widest/);
  assert.doesNotMatch(firstCss, /second-theme-rule/);

  const secondBuild = await invoke(
    ["App.jsx", "--theme", "./themes/second.jsx", "--out-dir", "second-dist"],
    { cwd: fixture },
  );
  assert.equal(secondBuild.exitCode, 0, secondBuild.stderr);
  const secondCss = await readAsset(path.join(fixture, "second-dist"), ".css");
  assert.match(secondCss, /second-theme-rule/);
  assert.doesNotMatch(secondCss, /first-theme-rule/);
});
