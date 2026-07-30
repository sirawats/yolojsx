import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { theme as antTheme } from "antd";
import {
  createThemeRuntime,
  resolveFoundationStylesheet,
} from "../../src/theme-css.js";
import {
  ANT_DESIGN_COMPONENT_NAMES,
  FIXED_THEMES,
  THEME_CSS_PROPERTIES,
  THEMES,
  contrastRatio,
  renderThemeCatalog,
  renderThemeCss,
  resolveTheme,
  validateThemeCatalog,
} from "../../src/themes.js";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compositeColor(foreground: string, background: string) {
  const rgba = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(
    foreground,
  );
  if (!rgba) {
    return foreground;
  }
  const alpha = Number(rgba[4]);
  const backgroundChannels = [1, 3, 5].map((index) =>
    Number.parseInt(background.slice(index, index + 2), 16),
  );
  return `#${rgba
    .slice(1, 4)
    .map(Number)
    .map((channel, index) =>
      Math.round(channel * alpha + backgroundChannels[index] * (1 - alpha))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

test("validates the complete immutable theme catalog", async () => {
  assert.equal(validateThemeCatalog(), true);
  assert.equal(FIXED_THEMES.length, 21);
  assert.equal(THEMES.length, 21);
  assert.ok(THEMES.every(Object.isFrozen));
  assert.equal(resolveTheme("onedark").id, "one-dark");
  for (const theme of THEMES) {
    const stylesheet = renderThemeCss(theme);
    assert.match(stylesheet, new RegExp(`Original yolojsx theme: ${theme.id}`));
    for (const key of Object.keys(
      THEME_CSS_PROPERTIES.colors,
    ) as (keyof typeof THEME_CSS_PROPERTIES.colors)[]) {
      const property = THEME_CSS_PROPERTIES.colors[key];
      const value = theme.semantic.colors[key];
      assert.match(
        stylesheet,
        new RegExp(`${escapeRegExp(property)}:\\s*${escapeRegExp(value)}`),
        `${theme.id}: ${property}`,
      );
    }
    for (const status of Object.keys(
      THEME_CSS_PROPERTIES.status,
    ) as (keyof typeof THEME_CSS_PROPERTIES.status)[]) {
      const properties = THEME_CSS_PROPERTIES.status[status];
      for (const field of Object.keys(
        properties,
      ) as (keyof typeof properties)[]) {
        const property = properties[field];
        const value = theme.semantic.colors.status[status][field];
        assert.match(
          stylesheet,
          new RegExp(`${escapeRegExp(property)}:\\s*${escapeRegExp(value)}`),
          `${theme.id}: ${property}`,
        );
      }
    }
    for (const field of Object.keys(
      THEME_CSS_PROPERTIES.typography,
    ) as (keyof typeof THEME_CSS_PROPERTIES.typography)[]) {
      const property = THEME_CSS_PROPERTIES.typography[field];
      assert.match(
        stylesheet,
        new RegExp(
          `${escapeRegExp(property)}:\\s*${escapeRegExp(theme.semantic.typography[field])}`,
        ),
        `${theme.id}: ${property}`,
      );
    }
    assert.match(
      stylesheet,
      new RegExp(
        `${THEME_CSS_PROPERTIES.controlHeight}:\\s*${theme.semantic.controlHeight}px`,
      ),
    );
    assert.match(
      stylesheet,
      new RegExp(
        `${THEME_CSS_PROPERTIES.rhythm.contentMeasure}:\\s*${theme.semantic.rhythm.contentMeasure}`,
      ),
    );
    assert.doesNotMatch(stylesheet, /--yolo-|\.yolo-|\.ant-/);
    assert.deepEqual(Object.keys(theme.antDesign.components), [
      ...ANT_DESIGN_COMPONENT_NAMES,
    ]);
    const statuses = {
      Info: "info",
      Success: "success",
      Warning: "warning",
      Error: "danger",
    } as const;
    for (const [token, status] of Object.entries(statuses)) {
      const values = theme.semantic.colors.status[status];
      assert.equal(theme.antDesign.token[`color${token}Bg`], values.background);
      assert.equal(theme.antDesign.token[`color${token}Border`], values.border);
      assert.equal(
        theme.antDesign.token[`color${token}Text`],
        values.foreground,
      );
    }
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
    const css = renderThemeCss(theme);
    assert.equal(theme.id, canonical);
    assert.equal(theme.appearance, "light");
    assert.equal(createThemeRuntime(theme).config.algorithm, "light");
    assert.match(css, /color-scheme: light/);
    assert.doesNotMatch(css, /prefers-color-scheme/);
  }
});

test("stored presets include typography, density, and original semantic values", async () => {
  const material = renderThemeCss(resolveTheme("material-light"));
  const github = renderThemeCss(resolveTheme("github-light"));
  const foundation = await readFile(resolveFoundationStylesheet(), "utf8");
  assert.match(material, /Roboto/);
  assert.match(material, /--control-height: 40px/);
  assert.match(github, /BlinkMacSystemFont/);
  assert.match(github, /--control-height: 32px/);
  assert.match(foundation, /--color-background/);
  assert.match(foundation, /--color-muted-foreground/);
  assert.match(foundation, /--color-primary-foreground/);
  assert.match(foundation, /--font-heading:\s*var\(--font-title\)/);
  assert.match(foundation, /--color-border/);
  assert.match(foundation, /button:not\(\[class\]\)/);
  assert.match(foundation, /:not\(pre\) > code,\s*kbd/);
  assert.match(
    foundation,
    /pre > code[\s\S]*background: transparent[\s\S]*color: inherit/,
  );
  assert.doesNotMatch(foundation, /--color-yolo-|\.yolo-/);
  assert.doesNotMatch(
    material,
    /\.workspace|\.markdown-source-view|\.view-content/,
  );
});

test("theme families express distinct structural identities", () => {
  const borderlessCards = new Set([
    "material-light",
    "material-dark",
    "one-dark",
    "everforest-light",
    "everforest-dark",
    "catppuccin-latte",
    "catppuccin-frappe",
    "catppuccin-macchiato",
    "catppuccin-mocha",
    "obsidian-minimal-light",
    "obsidian-minimal-dark",
  ]);
  for (const theme of THEMES) {
    const card = theme.antDesign.components.Card;
    assert.equal(
      card.lineWidth,
      borderlessCards.has(theme.id) ? 0 : 1,
      `${theme.id} card separation`,
    );
    if (card.lineWidth === 0) {
      assert.notEqual(
        theme.semantic.colors.surface,
        theme.semantic.colors.canvas,
        `${theme.id} borderless card surface`,
      );
    }
  }

  assert.equal(resolveTheme("github-light").semantic.controlHeight, 32);
  assert.equal(resolveTheme("solarized-light").semantic.controlHeight, 34);
  assert.equal(resolveTheme("everforest-light").semantic.controlHeight, 36);
  assert.equal(resolveTheme("material-light").semantic.controlHeight, 40);
  assert.equal(resolveTheme("gruvbox-light").semantic.shadow, "none");
  assert.equal(resolveTheme("obsidian-minimal-light").semantic.shadow, "none");
  assert.notEqual(
    resolveTheme("everforest-light").semantic.typography.heading,
    resolveTheme("everforest-light").semantic.typography.sans,
  );
  assert.notEqual(
    resolveTheme("obsidian-baseline-light").semantic.typography.heading,
    resolveTheme("obsidian-baseline-light").semantic.typography.sans,
  );
});

test("uses official serializable Ant Design component configuration", () => {
  const github = resolveTheme("github-light").antDesign;
  const material = resolveTheme("material-light").antDesign;
  assert.deepEqual(github.cssVar, {});
  assert.deepEqual(material.cssVar, {});
  assert.equal(github.token.controlHeight, 32);
  assert.equal(material.token.controlHeight, 40);
  assert.equal(github.components.Button.paddingInline, 14);
  assert.equal(material.components.Button.paddingInline, 24);
  const coloredBorders = new Set([
    "github-light",
    "github-dark",
    "github-dark-dimmed",
    "everforest-light",
    "everforest-dark",
  ]);
  const neutralBorders = new Set([
    "obsidian-baseline-light",
    "obsidian-baseline-dark",
  ]);
  for (const theme of THEMES) {
    for (const status of Object.values(theme.semantic.colors.status) as {
      border: string;
      seed: string;
      background: string;
    }[]) {
      if (coloredBorders.has(theme.id)) {
        assert.equal(status.border, status.seed, `${theme.id} colored border`);
      } else if (neutralBorders.has(theme.id)) {
        assert.equal(
          status.border,
          theme.semantic.colors.border,
          `${theme.id} neutral border`,
        );
      } else {
        assert.equal(
          status.border,
          status.background,
          `${theme.id} borderless`,
        );
      }
    }
  }
  assert.notEqual(
    github.components.Card.bodyPadding,
    material.components.Card.bodyPadding,
  );
  assert.equal(material.components.Button.ghostBg, "transparent");
  assert.ok(material.components.Button.defaultHoverBg);
  assert.ok(material.components.Button.defaultActiveBg);
  assert.ok(material.components.Button.defaultBgDisabled);
  assert.doesNotThrow(() =>
    JSON.stringify(createThemeRuntime(resolveTheme("material"))),
  );

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

  const lowContrastPrimaryBorder = structuredClone(resolveTheme("one-dark"));
  lowContrastPrimaryBorder.antDesign.token.colorPrimaryBorder =
    lowContrastPrimaryBorder.semantic.colors.surface;
  assert.throws(
    () => validateThemeCatalog([lowContrastPrimaryBorder]),
    /insufficient primary border contrast/,
  );
});

test("maps semantic colors to matching Ant Design roles", () => {
  for (const theme of THEMES) {
    const { colors } = theme.semantic;
    const { components, token } = theme.antDesign;
    assert.equal(token.colorPrimaryBorder, colors.focus);
    assert.equal(token.colorPrimaryBorderHover, colors.link);
    assert.equal(components.Slider.trackBg, colors.primaryAccent);
    assert.equal(components.Slider.trackHoverBg, colors.primaryAccentHover);
    assert.equal(components.Slider.handleColor, colors.primaryAccent);
    assert.equal(components.Progress.defaultColor, colors.primaryAccent);
    assert.equal(
      components.Notification.progressBg,
      `linear-gradient(90deg, ${colors.primaryAccentHover}, ${colors.primaryAccent})`,
    );
    assert.equal(components.Input.activeShadow, `0 0 0 2px ${colors.focus}`);
    assert.equal(components.Menu.itemSelectedBg, colors.selection);
    assert.equal(components.Menu.itemSelectedColor, colors.selectionText);
    assert.ok(contrastRatio(components.Slider.trackBg, colors.surface) >= 3);
    assert.ok(
      contrastRatio(components.Slider.trackHoverBg, colors.surfaceRaised) >= 3,
    );
    const algorithm =
      theme.appearance === "dark"
        ? antTheme.darkAlgorithm
        : antTheme.defaultAlgorithm;
    const resolved = antTheme.getDesignToken({ algorithm, token });
    const rail = compositeColor(
      resolved.colorFillTertiary,
      resolved.colorBgContainer,
    );
    const hoverRail = compositeColor(
      resolved.colorFillSecondary,
      resolved.colorBgContainer,
    );
    assert.ok(contrastRatio(components.Slider.trackBg, rail) >= 3);
    assert.ok(contrastRatio(components.Slider.trackHoverBg, hoverRail) >= 3);
  }
});

test("theme discovery prints only canonical theme names", () => {
  const output = renderThemeCatalog();
  assert.equal(output, `${THEMES.map((theme) => theme.id).join("\n")}\n`);
  assert.doesNotMatch(output, /Available|aliases|Inspiration|\(|:/);
});

test("the shipped notice covers every reviewed source and revision", async () => {
  const notice = await readFile(
    new URL("../../THIRD_PARTY_NOTICES.md", import.meta.url),
    "utf8",
  );
  for (const theme of THEMES) {
    if (theme.provenance.name === "yolojsx") {
      continue;
    }
    assert.match(
      notice,
      new RegExp(theme.provenance.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
    assert.match(
      notice,
      new RegExp(
        theme.provenance.revision.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      ),
    );
  }
  assert.match(notice, /not affiliated with or endorsed/);
});
