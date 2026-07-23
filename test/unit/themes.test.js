import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createThemeRuntime, resolveThemeStylesheet } from "../../src/theme-css.js";
import {
  FIXED_THEMES,
  THEMES,
  renderThemeCatalog,
  resolveTheme,
  validateThemeCatalog,
} from "../../src/themes.js";

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
    for (const value of Object.values(theme.semantic.colors).flatMap((entry) =>
      typeof entry === "string"
        ? [entry]
        : Object.values(entry).flatMap((pair) => Object.values(pair)),
    )) {
      assert.match(stylesheet, new RegExp(value.replace("#", "#")), `${theme.id}: ${value}`);
    }
    assert.match(stylesheet, new RegExp(`${theme.semantic.controlHeight}px`));
    assert.match(stylesheet, new RegExp(`${theme.semantic.rhythm.contentMeasure}`));
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
  assert.match(material, /--yolo-control-height: 40px/);
  assert.match(github, /BlinkMacSystemFont/);
  assert.match(github, /--yolo-control-height: 30px/);
  assert.match(foundation, /--color-yolo-primary/);
  assert.match(foundation, /button:not\(\[class\]\)/);
  assert.match(foundation, /:not\(pre\) > code, kbd/);
  assert.match(foundation, /pre > code[\s\S]*background: transparent[\s\S]*color: inherit/);
  assert.doesNotMatch(material, /\.workspace|\.markdown-source-view|\.view-content/);
});

test("theme discovery describes fixed modes, light aliases, and provenance", () => {
  const output = renderThemeCatalog();
  assert.match(output, /github-light \(fixed light; aliases: github\)/);
  assert.match(output, /material-light \(fixed light; aliases: material\)/);
  assert.match(output, /one-dark \(fixed dark; aliases: onedark\)/);
  assert.match(output, /Inspiration: Minimal for Obsidian 8\.2\.0/);
  assert.match(output, /no upstream CSS is bundled/);
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
