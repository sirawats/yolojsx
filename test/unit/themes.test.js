import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createThemeRuntime, resolveThemeStylesheet } from "../../src/theme-css.js";
import {
  ANT_DESIGN_COMPONENT_NAMES,
  FIXED_THEMES,
  THEME_CSS_PROPERTIES,
  THEMES,
  renderThemeCatalog,
  resolveTheme,
  validateThemeCatalog,
} from "../../src/themes.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("validates the complete immutable theme catalog", async () => {
  assert.equal(validateThemeCatalog(), true);
  assert.equal(FIXED_THEMES.length, 21);
  assert.equal(THEMES.length, 21);
  assert.ok(THEMES.every(Object.isFrozen));
  assert.equal(resolveTheme("onedark").id, "one-dark");
  for (const theme of THEMES) {
    const stylesheet = await readFile(resolveThemeStylesheet(theme), "utf8");
    assert.match(stylesheet, new RegExp(`Original yolojsx theme: ${theme.id}`));
    assert.match(stylesheet, /@import "\.\/foundation\.css"/);
    for (const [key, property] of Object.entries(THEME_CSS_PROPERTIES.colors)) {
      const value = theme.semantic.colors[key];
      assert.match(
        stylesheet,
        new RegExp(`${escapeRegExp(property)}:\\s*${escapeRegExp(value)}`),
        `${theme.id}: ${property}`,
      );
    }
    for (const [status, properties] of Object.entries(THEME_CSS_PROPERTIES.status)) {
      for (const [field, property] of Object.entries(properties)) {
        const value = theme.semantic.colors.status[status][field];
        assert.match(
          stylesheet,
          new RegExp(`${escapeRegExp(property)}:\\s*${escapeRegExp(value)}`),
          `${theme.id}: ${property}`,
        );
      }
    }
    assert.match(
      stylesheet,
      new RegExp(`${THEME_CSS_PROPERTIES.controlHeight}:\\s*${theme.semantic.controlHeight}px`),
    );
    assert.match(
      stylesheet,
      new RegExp(`${THEME_CSS_PROPERTIES.rhythm.contentMeasure}:\\s*${theme.semantic.rhythm.contentMeasure}`),
    );
    assert.doesNotMatch(stylesheet, /--yolo-|\.yolo-|\.ant-/);
    assert.deepEqual(Object.keys(theme.antDesign.components), [...ANT_DESIGN_COMPONENT_NAMES]);
  }
});

test("family aliases always resolve to fixed light presets", async () => {
  const aliases = {
    github: "github-light",
    material: "material-light",
    solarized: "solarized-light",
    gruvbox: "gruvbox-light",
    everforest: "everforest-light",
    catppuccin: "catppuccin-latte",
    "obsidian-minimal": "obsidian-minimal-light",
    "obsidian-baseline": "obsidian-baseline-light",
  };
  for (const [alias, canonical] of Object.entries(aliases)) {
    const theme = resolveTheme(alias);
    const css = await readFile(resolveThemeStylesheet(theme), "utf8");
    assert.equal(theme.id, canonical);
    assert.equal(theme.appearance, "light");
    assert.equal(createThemeRuntime(theme).config.algorithm, "light");
    assert.match(css, /color-scheme: light/);
    assert.doesNotMatch(css, /prefers-color-scheme/);
  }
});

test("stored presets include typography, density, and original semantic values", async () => {
  const material = await readFile(resolveThemeStylesheet(resolveTheme("material-light")), "utf8");
  const github = await readFile(resolveThemeStylesheet(resolveTheme("github-light")), "utf8");
  const foundation = await readFile(resolveThemeStylesheet(resolveTheme("default")).replace("default.css", "foundation.css"), "utf8");
  assert.match(material, /Roboto/);
  assert.match(material, /--control-height: 40px/);
  assert.match(github, /BlinkMacSystemFont/);
  assert.match(github, /--control-height: 30px/);
  assert.match(foundation, /--color-background/);
  assert.match(foundation, /--color-muted-foreground/);
  assert.match(foundation, /--color-primary-foreground/);
  assert.match(foundation, /--color-border/);
  assert.match(foundation, /button:not\(\[class\]\)/);
  assert.match(foundation, /:not\(pre\) > code, kbd/);
  assert.match(foundation, /pre > code[\s\S]*background: transparent[\s\S]*color: inherit/);
  assert.doesNotMatch(foundation, /--color-yolo-|\.yolo-/);
  assert.doesNotMatch(material, /\.workspace|\.markdown-source-view|\.view-content/);
});

test("uses official serializable Ant Design component configuration", () => {
  const github = resolveTheme("github-light").antDesign;
  const material = resolveTheme("material-light").antDesign;
  assert.equal(github.cssVar, true);
  assert.equal(material.cssVar, true);
  assert.equal(github.token.controlHeight, 30);
  assert.equal(material.token.controlHeight, 40);
  assert.equal(github.components.Button.paddingInline, 12);
  assert.equal(material.components.Button.paddingInline, 24);
  assert.notEqual(github.components.Card.bodyPadding, material.components.Card.bodyPadding);
  assert.equal(material.components.Button.ghostBg, "transparent");
  assert.ok(material.components.Button.defaultHoverBg);
  assert.ok(material.components.Button.defaultActiveBg);
  assert.ok(material.components.Button.defaultBgDisabled);
  assert.doesNotThrow(() => JSON.stringify(createThemeRuntime(resolveTheme("material"))));

  const missing = structuredClone(resolveTheme("default"));
  delete missing.antDesign.components.Button;
  assert.throws(
    () => validateThemeCatalog([missing]),
    /unsupported Ant Design component configuration/,
  );

  const unsupported = structuredClone(resolveTheme("default"));
  unsupported.antDesign.components.Unknown = {};
  assert.throws(
    () => validateThemeCatalog([unsupported]),
    /unsupported Ant Design component configuration/,
  );
});

test("theme discovery prints only canonical theme names", () => {
  const output = renderThemeCatalog();
  assert.equal(output, `${THEMES.map((theme) => theme.id).join("\n")}\n`);
  assert.doesNotMatch(output, /Available|aliases|Inspiration|\(|:/);
});

test("the shipped notice covers every reviewed source and revision", async () => {
  const notice = await readFile(new URL("../../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");
  for (const theme of THEMES) {
    if (theme.provenance.name === "yolojsx") {
      continue;
    }
    assert.match(notice, new RegExp(theme.provenance.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(notice, new RegExp(theme.provenance.revision.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(notice, /not affiliated with or endorsed/);
});
