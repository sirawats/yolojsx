import { YoloJsxError } from "./errors.js";

import defaultDef from "./themes/default.js";
import githubLightDef from "./themes/github-light.js";
import githubDarkDef from "./themes/github-dark.js";
import githubDarkDimmedDef from "./themes/github-dark-dimmed.js";
import materialLightDef from "./themes/material-light.js";
import materialDarkDef from "./themes/material-dark.js";
import oneDarkDef from "./themes/one-dark.js";
import solarizedLightDef from "./themes/solarized-light.js";
import solarizedDarkDef from "./themes/solarized-dark.js";
import gruvboxLightDef from "./themes/gruvbox-light.js";
import gruvboxDarkDef from "./themes/gruvbox-dark.js";
import everforestLightDef from "./themes/everforest-light.js";
import everforestDarkDef from "./themes/everforest-dark.js";
import catppuccinLatteDef from "./themes/catppuccin-latte.js";
import catppuccinFrappeDef from "./themes/catppuccin-frappe.js";
import catppuccinMacchiatoDef from "./themes/catppuccin-macchiato.js";
import catppuccinMochaDef from "./themes/catppuccin-mocha.js";
import obsidianMinimalLightDef from "./themes/obsidian-minimal-light.js";
import obsidianMinimalDarkDef from "./themes/obsidian-minimal-dark.js";
import obsidianBaselineLightDef from "./themes/obsidian-baseline-light.js";
import obsidianBaselineDarkDef from "./themes/obsidian-baseline-dark.js";

const NON_ENDORSEMENT =
  "This is an original yolojsx adaptation. It is not affiliated with or endorsed by the referenced project.";

const LIGHT_STATUS = Object.freeze({
  success: { foreground: "#14532d", background: "#dcfce7", seed: "#52c41a" },
  warning: { foreground: "#713f12", background: "#fef3c7", seed: "#faad14" },
  danger: { foreground: "#7f1d1d", background: "#fee2e2", seed: "#ff4d4f" },
  info: { foreground: "#1e3a8a", background: "#dbeafe", seed: "#1677ff" },
});

const DARK_STATUS = Object.freeze({
  success: { foreground: "#bbf7d0", background: "#14532d", seed: "#49aa19" },
  warning: { foreground: "#fef3c7", background: "#713f12", seed: "#d89614" },
  danger: { foreground: "#fecaca", background: "#7f1d1d", seed: "#dc4446" },
  info: { foreground: "#dbeafe", background: "#1e3a8a", seed: "#1677ff" },
});

export const THEME_CSS_PROPERTIES = Object.freeze({
  colors: Object.freeze({
    canvas: "--background",
    surface: "--card",
    surfaceRaised: "--popover",
    text: "--foreground",
    textMuted: "--muted-foreground",
    border: "--border",
    primary: "--primary",
    primaryText: "--primary-foreground",
    focus: "--ring",
    selection: "--selection",
    selectionText: "--selection-foreground",
    codeBackground: "--code",
  }),
  status: Object.freeze({
    success: Object.freeze({
      seed: "--success",
      foreground: "--success-foreground",
      background: "--success-background",
    }),
    warning: Object.freeze({
      seed: "--warning",
      foreground: "--warning-foreground",
      background: "--warning-background",
    }),
    danger: Object.freeze({
      seed: "--danger",
      foreground: "--danger-foreground",
      background: "--danger-background",
    }),
    info: Object.freeze({
      seed: "--info",
      foreground: "--info-foreground",
      background: "--info-background",
    }),
  }),
  typography: Object.freeze({
    sans: "--font-body",
    mono: "--font-code",
  }),
  radius: Object.freeze({
    small: "--theme-radius-sm",
    medium: "--theme-radius-md",
    large: "--theme-radius-lg",
  }),
  rhythm: Object.freeze({
    lineHeight: "--body-line-height",
    headingWeight: "--heading-weight",
    letterSpacing: "--heading-tracking",
    contentMeasure: "--content-measure",
  }),
  shadow: "--card-shadow",
  controlHeight: "--control-height",
});

export const ANT_DESIGN_COMPONENT_NAMES = Object.freeze([
  "Button",
  "Card",
  "Input",
  "Layout",
  "Menu",
  "Segmented",
  "Tabs",
  "Typography",
]);

const REQUIRED_COMPONENT_TOKENS = Object.freeze({
  Button: Object.freeze([
    "primaryColor",
    "defaultColor",
    "defaultBg",
    "defaultBorderColor",
    "defaultHoverBg",
    "defaultHoverColor",
    "defaultActiveBg",
    "defaultActiveColor",
    "defaultGhostColor",
    "ghostBg",
    "solidTextColor",
    "textTextColor",
    "textTextHoverColor",
    "textTextActiveColor",
    "defaultBgDisabled",
  ]),
  Card: Object.freeze([
    "headerBg",
    "bodyPadding",
    "headerPadding",
    "actionsBg",
  ]),
  Input: Object.freeze([
    "paddingInline",
    "paddingBlock",
    "addonBg",
    "hoverBorderColor",
    "activeBorderColor",
    "activeShadow",
  ]),
  Layout: Object.freeze(["bodyBg", "headerBg", "headerColor", "siderBg"]),
  Menu: Object.freeze([
    "itemColor",
    "itemHoverColor",
    "itemSelectedColor",
    "itemBg",
    "itemHoverBg",
    "itemSelectedBg",
  ]),
  Segmented: Object.freeze([
    "itemColor",
    "itemHoverColor",
    "itemSelectedBg",
    "itemSelectedColor",
    "trackBg",
  ]),
  Tabs: Object.freeze([
    "cardBg",
    "inkBarColor",
    "itemColor",
    "itemHoverColor",
    "itemSelectedColor",
  ]),
  Typography: Object.freeze(["titleMarginTop", "titleMarginBottom"]),
});

function createAntDesignComponents({
  colors,
  controlHeight,
  radius,
  shadow,
  status,
  definition,
}) {
  const radiusPixels = Number.parseFloat(radius.medium) * 16;
  const comp = definition.components;
  return {
    Button: {
      fontWeight: definition.rhythm.headingWeight,
      defaultShadow: comp.buttonShadow,
      primaryShadow: comp.buttonShadow,
      dangerShadow: comp.buttonShadow,
      primaryColor: colors.primaryText,
      defaultColor: colors.text,
      defaultBg: colors.surface,
      defaultBorderColor: colors.border,
      dangerColor: status.danger.foreground,
      defaultHoverBg: colors.surfaceRaised,
      defaultHoverColor: colors.primary,
      defaultHoverBorderColor: colors.primary,
      defaultActiveBg: colors.codeBackground,
      defaultActiveColor: colors.primary,
      defaultActiveBorderColor: colors.primary,
      defaultGhostColor: colors.text,
      ghostBg: "transparent",
      defaultGhostBorderColor: colors.border,
      solidTextColor: colors.primaryText,
      textTextColor: colors.text,
      textTextHoverColor: colors.primary,
      textTextActiveColor: colors.primary,
      textHoverBg: colors.codeBackground,
      linkHoverBg: "transparent",
      paddingInline: comp.buttonPadding,
      paddingInlineLG: comp.buttonPadding + 4,
      paddingInlineSM: Math.max(comp.buttonPadding - 4, 8),
      defaultBgDisabled: colors.codeBackground,
      dashedBgDisabled: colors.codeBackground,
    },
    Card: {
      headerBg: colors.surface,
      headerHeight: comp.cardHeaderHeight,
      headerHeightSM: comp.cardHeaderHeight - 8,
      bodyPadding: comp.cardPadding,
      bodyPaddingSM: Math.max(comp.cardPadding - 8, 12),
      headerPadding: comp.cardPadding,
      headerPaddingSM: Math.max(comp.cardPadding - 8, 12),
      actionsBg: colors.surface,
      extraColor: colors.textMuted,
      boxShadowTertiary: shadow,
    },
    Input: {
      paddingInline: comp.inputPaddingInline,
      paddingInlineSM: Math.max(comp.inputPaddingInline - 2, 8),
      paddingInlineLG: comp.inputPaddingInline + 2,
      paddingBlock: comp.inputPaddingBlock,
      paddingBlockSM: Math.max(comp.inputPaddingBlock - 1, 2),
      paddingBlockLG: comp.inputPaddingBlock + 2,
      addonBg: colors.codeBackground,
      hoverBorderColor: colors.primary,
      activeBorderColor: colors.primary,
      activeShadow: `0 0 0 2px ${colors.selection}`,
      hoverBg: colors.surface,
      activeBg: colors.surface,
    },
    Layout: {
      bodyBg: colors.canvas,
      headerBg: colors.surface,
      headerColor: colors.text,
      headerHeight: Math.max(controlHeight + 24, 56),
      headerPadding: "0 24px",
      footerBg: colors.surface,
      siderBg: colors.surface,
      triggerBg: colors.surfaceRaised,
      triggerColor: colors.text,
      lightSiderBg: colors.surface,
      lightTriggerBg: colors.surfaceRaised,
      lightTriggerColor: colors.text,
    },
    Menu: {
      groupTitleColor: colors.textMuted,
      itemBorderRadius: radiusPixels,
      subMenuItemBorderRadius: radiusPixels,
      itemColor: colors.textMuted,
      itemHoverColor: colors.text,
      itemSelectedColor: colors.primary,
      subMenuItemSelectedColor: colors.primary,
      itemDisabledColor: colors.textMuted,
      dangerItemColor: status.danger.foreground,
      dangerItemHoverColor: status.danger.foreground,
      dangerItemSelectedColor: status.danger.foreground,
      dangerItemActiveBg: status.danger.background,
      dangerItemSelectedBg: status.danger.background,
      itemBg: colors.surface,
      itemHoverBg: colors.codeBackground,
      subMenuItemBg: colors.surface,
      itemActiveBg: colors.codeBackground,
      itemSelectedBg: colors.selection,
      itemHeight: comp.menuItemHeight,
      itemMarginInline: comp.menuItemMargin,
      itemMarginBlock: comp.menuItemMargin,
      popupBg: colors.surfaceRaised,
    },
    Segmented: {
      itemColor: colors.textMuted,
      itemHoverColor: colors.text,
      itemHoverBg: colors.surfaceRaised,
      itemActiveBg: colors.codeBackground,
      itemSelectedBg: colors.surface,
      itemSelectedColor: colors.text,
      trackPadding: comp.segmentedPadding,
      trackBg: colors.codeBackground,
    },
    Tabs: {
      cardBg: colors.codeBackground,
      inkBarColor: colors.primary,
      horizontalItemGutter: comp.tabGutter,
      itemColor: colors.textMuted,
      itemActiveColor: colors.primary,
      itemHoverColor: colors.primary,
      itemSelectedColor: colors.primary,
    },
    Typography: {
      titleMarginTop: comp.titleMarginTop,
      titleMarginBottom: comp.titleMarginBottom,
    },
  };
}

function originalAdaptation(source) {
  return Object.freeze({
    ...source,
    attribution: `Visual principles and palette relationships were reviewed from ${source.name}; no upstream CSS is included.`,
    nonEndorsement: NON_ENDORSEMENT,
  });
}

function fixedTheme(definition) {
  const {
    id,
    name,
    description,
    appearance,
    source,
    aliases = [],
    colors,
    typography,
    rhythm,
    radius,
    shadow,
    controlHeight,
  } = definition;
  const defaultStatus = appearance === "dark" ? DARK_STATUS : LIGHT_STATUS;
  const status = definition.status
    ? Object.fromEntries(
        Object.entries(defaultStatus).map(([key, def]) => [
          key,
          definition.status[key] ?? def,
        ]),
      )
    : defaultStatus;
  const semantic = {
    colors: {
      ...colors,
      status,
    },
    typography,
    rhythm,
    radius,
    shadow,
    controlHeight,
  };
  return {
    id,
    name,
    description,
    aliases,
    mode: "fixed",
    appearance,
    semantic,
    antDesign: {
      algorithm: appearance,
      cssVar: true,
      token: {
        colorPrimary: colors.primary,
        colorInfo: colors.primary,
        colorSuccess: status.success.seed,
        colorWarning: status.warning.seed,
        colorError: status.danger.seed,
        colorBgBase: colors.canvas,
        colorBgLayout: colors.canvas,
        colorBgContainer: colors.surface,
        colorBgElevated: colors.surfaceRaised,
        colorText: colors.text,
        colorTextSecondary: colors.textMuted,
        colorBorder: colors.border,
        colorLink: colors.primary,
        borderRadius: Number.parseFloat(radius.medium) * 16,
        controlHeight,
        fontFamily: typography.sans,
        fontFamilyCode: typography.mono,
        fontWeightStrong: rhythm.headingWeight,
        lineHeight: rhythm.lineHeight,
        boxShadow: shadow,
      },
      components: createAntDesignComponents({
        colors,
        controlHeight,
        radius,
        shadow,
        status,
        definition,
      }),
    },
    provenance: originalAdaptation(source),
  };
}

const DEFINITIONS = [
  defaultDef,
  githubLightDef,
  githubDarkDef,
  githubDarkDimmedDef,
  materialLightDef,
  materialDarkDef,
  oneDarkDef,
  solarizedLightDef,
  solarizedDarkDef,
  gruvboxLightDef,
  gruvboxDarkDef,
  everforestLightDef,
  everforestDarkDef,
  catppuccinLatteDef,
  catppuccinFrappeDef,
  catppuccinMacchiatoDef,
  catppuccinMochaDef,
  obsidianMinimalLightDef,
  obsidianMinimalDarkDef,
  obsidianBaselineLightDef,
  obsidianBaselineDarkDef,
];

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

export const DEFAULT_THEME_ID = "default";
export const FIXED_THEMES = Object.freeze(
  DEFINITIONS.map(fixedTheme).map(deepFreeze),
);
export const THEMES = FIXED_THEMES;

const REQUIRED_COLORS = [
  "canvas",
  "surface",
  "surfaceRaised",
  "text",
  "textMuted",
  "border",
  "primary",
  "primaryText",
  "focus",
  "selection",
  "selectionText",
  "codeBackground",
];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function linearChannel(value) {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(first, second) {
  const luminance = (color) => {
    const channels = [1, 3, 5].map((index) =>
      linearChannel(Number.parseInt(color.slice(index, index + 2), 16)),
    );
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function requireContrast(theme, label, foreground, background, minimum) {
  if (contrastRatio(foreground, background) < minimum) {
    throw new Error(`${theme.id} has insufficient ${label} contrast.`);
  }
}

export function validateThemeCatalog(themes = THEMES) {
  const ids = new Set();
  const names = new Set();
  const aliases = new Set();
  for (const theme of themes) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(theme.id) || ids.has(theme.id)) {
      throw new Error(`Invalid or duplicate theme id: ${theme.id}`);
    }
    ids.add(theme.id);
    if (!theme.name || names.has(theme.name)) {
      throw new Error(`Missing or duplicate theme name: ${theme.name}`);
    }
    names.add(theme.name);
    for (const alias of theme.aliases) {
      if (ids.has(alias) || aliases.has(alias)) {
        throw new Error(`Duplicate theme alias: ${alias}`);
      }
      aliases.add(alias);
    }
    const provenance = theme.provenance;
    for (const field of [
      "name",
      "url",
      "revision",
      "license",
      "attribution",
      "nonEndorsement",
    ]) {
      if (!provenance?.[field]) {
        throw new Error(`${theme.id} is missing provenance.${field}.`);
      }
    }
    if (
      theme.mode !== "fixed" ||
      !["light", "dark"].includes(theme.appearance)
    ) {
      throw new Error(`${theme.id} has an invalid mode or appearance.`);
    }
    const colors = theme.semantic?.colors;
    for (const key of REQUIRED_COLORS) {
      if (!HEX_COLOR.test(colors?.[key] ?? "")) {
        throw new Error(`${theme.id} has an invalid semantic color: ${key}.`);
      }
    }
    for (const status of ["success", "warning", "danger", "info"]) {
      const pair = colors.status?.[status];
      if (
        !HEX_COLOR.test(pair?.foreground ?? "") ||
        !HEX_COLOR.test(pair?.background ?? "")
      ) {
        throw new Error(`${theme.id} has an invalid ${status} status pair.`);
      }
      requireContrast(
        theme,
        `${status} status`,
        pair.foreground,
        pair.background,
        4.5,
      );
    }
    requireContrast(theme, "body text", colors.text, colors.canvas, 4.5);
    requireContrast(theme, "surface text", colors.text, colors.surface, 4.5);
    requireContrast(theme, "muted text", colors.textMuted, colors.canvas, 3);
    requireContrast(
      theme,
      "primary control",
      colors.primaryText,
      colors.primary,
      4.5,
    );
    requireContrast(theme, "focus indicator", colors.focus, colors.canvas, 3);
    requireContrast(
      theme,
      "selection",
      colors.selectionText,
      colors.selection,
      4.5,
    );
    const antDesign = theme.antDesign;
    if (
      !["light", "dark"].includes(antDesign?.algorithm) ||
      antDesign.cssVar !== true ||
      !antDesign.token ||
      !antDesign.components
    ) {
      throw new Error(`${theme.id} is missing Ant Design configuration.`);
    }
    const componentNames = Object.keys(antDesign.components).sort();
    if (
      componentNames.length !== ANT_DESIGN_COMPONENT_NAMES.length ||
      componentNames.some(
        (name, index) => name !== [...ANT_DESIGN_COMPONENT_NAMES].sort()[index],
      )
    ) {
      throw new Error(
        `${theme.id} has unsupported Ant Design component configuration.`,
      );
    }
    for (const [componentName, requiredTokens] of Object.entries(
      REQUIRED_COMPONENT_TOKENS,
    )) {
      const component = antDesign.components[componentName];
      for (const tokenName of requiredTokens) {
        const value = component?.[tokenName];
        if (
          value === undefined ||
          !["string", "number", "boolean"].includes(typeof value)
        ) {
          throw new Error(
            `${theme.id} has an invalid Ant Design ${componentName}.${tokenName} token.`,
          );
        }
      }
      for (const value of Object.values(component)) {
        if (!["string", "number", "boolean"].includes(typeof value)) {
          throw new Error(
            `${theme.id} has a non-serializable Ant Design ${componentName} token.`,
          );
        }
      }
    }
    for (const field of ["sans", "mono"]) {
      if (!theme.semantic.typography?.[field]) {
        throw new Error(`${theme.id} is missing typography.${field}.`);
      }
    }
    for (const field of [
      "lineHeight",
      "headingWeight",
      "letterSpacing",
      "contentMeasure",
    ]) {
      if (theme.semantic.rhythm?.[field] === undefined) {
        throw new Error(`${theme.id} is missing rhythm.${field}.`);
      }
    }
  }
  return true;
}

const registry = new Map();
for (const theme of THEMES) {
  registry.set(theme.id, theme);
  for (const alias of theme.aliases) {
    registry.set(alias, theme);
  }
}

export function resolveTheme(themeId = DEFAULT_THEME_ID) {
  const theme = registry.get(themeId);
  if (!theme) {
    throw new YoloJsxError(
      `Unknown theme: ${themeId}. Run \`yolojsx themes\` to list available themes.`,
      { code: "UNKNOWN_THEME" },
    );
  }
  return theme;
}

export function renderThemeCatalog() {
  return `${THEMES.map((theme) => theme.id).join("\n")}\n`;
}

export function renderThemeCss(theme) {
  const { colors, typography, rhythm, radius, shadow, controlHeight } =
    theme.semantic;
  const status = colors.status;
  return `/* Original yolojsx theme: ${theme.id}. No upstream CSS is included. */
:root {
  color-scheme: ${theme.appearance};
  --background: ${colors.canvas};
  --card: ${colors.surface};
  --popover: ${colors.surfaceRaised};
  --foreground: ${colors.text};
  --muted-foreground: ${colors.textMuted};
  --border: ${colors.border};
  --primary: ${colors.primary};
  --primary-foreground: ${colors.primaryText};
  --ring: ${colors.focus};
  --selection: ${colors.selection};
  --selection-foreground: ${colors.selectionText};
  --code: ${colors.codeBackground};
  --success: ${status.success.seed};
  --success-foreground: ${status.success.foreground};
  --success-background: ${status.success.background};
  --warning: ${status.warning.seed};
  --warning-foreground: ${status.warning.foreground};
  --warning-background: ${status.warning.background};
  --danger: ${status.danger.seed};
  --danger-foreground: ${status.danger.foreground};
  --danger-background: ${status.danger.background};
  --info: ${status.info.seed};
  --info-foreground: ${status.info.foreground};
  --info-background: ${status.info.background};
  --font-body: ${typography.sans};
  --font-code: ${typography.mono};
  --theme-radius-sm: ${radius.small};
  --theme-radius-md: ${radius.medium};
  --theme-radius-lg: ${radius.large};
  --card-shadow: ${shadow};
  --control-height: ${controlHeight}px;
  --body-line-height: ${rhythm.lineHeight};
  --heading-weight: ${rhythm.headingWeight};
  --heading-tracking: ${rhythm.letterSpacing};
  --content-measure: ${rhythm.contentMeasure};
}
`;
}

validateThemeCatalog();
