import { YoloJsxError } from "./errors.js";

const NON_ENDORSEMENT =
  "This is an original yolojsx adaptation. It is not affiliated with or endorsed by the referenced project.";

const LIGHT_STATUS = Object.freeze({
  success: { foreground: "#14532d", background: "#dcfce7" },
  warning: { foreground: "#713f12", background: "#fef3c7" },
  danger: { foreground: "#7f1d1d", background: "#fee2e2" },
  info: { foreground: "#1e3a8a", background: "#dbeafe" },
});

const DARK_STATUS = Object.freeze({
  success: { foreground: "#bbf7d0", background: "#14532d" },
  warning: { foreground: "#fef3c7", background: "#713f12" },
  danger: { foreground: "#fecaca", background: "#7f1d1d" },
  info: { foreground: "#dbeafe", background: "#1e3a8a" },
});

const SOURCES = Object.freeze({
  default: {
    name: "yolojsx",
    url: "https://github.com/sirawats/yolo-jsx",
    revision: "0.1.0",
    license: "MIT",
  },
  github: {
    name: "Primer Primitives",
    url: "https://github.com/primer/primitives",
    revision: "v11.9.0",
    license: "MIT",
  },
  material: {
    name: "Material Web",
    url: "https://github.com/material-components/material-web",
    revision: "v2.4.1",
    license: "Apache-2.0",
  },
  oneDark: {
    name: "Atom One Dark syntax",
    url: "https://github.com/atom/one-dark-syntax",
    revision: "v1.3.0",
    license: "MIT",
  },
  solarized: {
    name: "Solarized",
    url: "https://github.com/altercation/solarized",
    revision: "v1.0.0-beta.2",
    license: "MIT",
  },
  gruvbox: {
    name: "Gruvbox",
    url: "https://github.com/morhetz/gruvbox",
    revision: "v2.0.0",
    license: "MIT",
  },
  everforest: {
    name: "Everforest",
    url: "https://github.com/sainnhe/everforest",
    revision: "2.0.0",
    license: "MIT",
  },
  catppuccin: {
    name: "Catppuccin Palette",
    url: "https://github.com/catppuccin/palette",
    revision: "v1.8.0",
    license: "MIT",
  },
  minimal: {
    name: "Minimal for Obsidian",
    url: "https://github.com/kepano/obsidian-minimal",
    revision: "8.2.0",
    license: "MIT",
  },
  baseline: {
    name: "Baseline for Obsidian",
    url: "https://github.com/aaaaalexis/obsidian-baseline",
    revision: "3.2.11",
    license: "MIT",
  },
});

const TYPOGRAPHY = Object.freeze({
  sans: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  mono: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace",
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
      foreground: "--success",
      background: "--success-background",
    }),
    warning: Object.freeze({
      foreground: "--warning",
      background: "--warning-background",
    }),
    danger: Object.freeze({
      foreground: "--danger",
      background: "--danger-background",
    }),
    info: Object.freeze({
      foreground: "--info",
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

const VISUAL_PROFILES = Object.freeze({
  github: {
    typography: { sans: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif", mono: "ui-monospace, \"SFMono-Regular\", Consolas, monospace" },
    rhythm: { lineHeight: 1.5, headingWeight: 600, letterSpacing: "-0.012em", contentMeasure: "80rem" },
  },
  material: {
    typography: { sans: "Roboto, \"Noto Sans\", ui-sans-serif, system-ui, sans-serif", mono: "\"Roboto Mono\", ui-monospace, monospace" },
    rhythm: { lineHeight: 1.55, headingWeight: 500, letterSpacing: "-0.006em", contentMeasure: "76rem" },
  },
  editor: {
    typography: { sans: "Inter, ui-sans-serif, system-ui, sans-serif", mono: "\"JetBrains Mono\", \"SFMono-Regular\", Consolas, monospace" },
    rhythm: { lineHeight: 1.48, headingWeight: 600, letterSpacing: "-0.015em", contentMeasure: "78rem" },
  },
  warm: {
    typography: { sans: "\"Avenir Next\", Avenir, ui-sans-serif, system-ui, sans-serif", mono: "ui-monospace, \"SFMono-Regular\", Consolas, monospace" },
    rhythm: { lineHeight: 1.6, headingWeight: 650, letterSpacing: "-0.01em", contentMeasure: "74rem" },
  },
  catppuccin: {
    typography: { sans: "Inter, ui-sans-serif, system-ui, sans-serif", mono: "\"Fira Code\", ui-monospace, monospace" },
    rhythm: { lineHeight: 1.55, headingWeight: 650, letterSpacing: "-0.014em", contentMeasure: "78rem" },
  },
  minimal: {
    typography: { sans: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif", mono: "ui-monospace, \"SFMono-Regular\", Consolas, monospace" },
    rhythm: { lineHeight: 1.68, headingWeight: 600, letterSpacing: "-0.018em", contentMeasure: "68rem" },
  },
  baseline: {
    typography: { sans: "\"Source Sans 3\", \"Segoe UI\", ui-sans-serif, system-ui, sans-serif", mono: "\"Source Code Pro\", ui-monospace, monospace" },
    rhythm: { lineHeight: 1.62, headingWeight: 650, letterSpacing: "-0.012em", contentMeasure: "72rem" },
  },
  default: {
    typography: TYPOGRAPHY,
    rhythm: { lineHeight: 1.55, headingWeight: 650, letterSpacing: "-0.012em", contentMeasure: "76rem" },
  },
});

const COMPONENT_PROFILES = Object.freeze({
  default: Object.freeze({
    buttonPadding: 16,
    buttonShadow: "0 1px 2px rgb(15 23 42 / 0.14)",
    cardPadding: 24,
    cardHeaderHeight: 56,
    menuItemHeight: 40,
    menuItemMargin: 4,
    segmentedPadding: 2,
    tabGutter: 28,
    titleMarginTop: "1.2em",
    titleMarginBottom: "0.5em",
    inputPaddingInline: 11,
    inputPaddingBlock: 4,
  }),
  github: Object.freeze({
    buttonPadding: 12,
    buttonShadow: "0 1px 0 rgb(31 35 40 / 0.12)",
    cardPadding: 16,
    cardHeaderHeight: 44,
    menuItemHeight: 32,
    menuItemMargin: 2,
    segmentedPadding: 2,
    tabGutter: 24,
    titleMarginTop: "1em",
    titleMarginBottom: "0.4em",
    inputPaddingInline: 10,
    inputPaddingBlock: 3,
  }),
  material: Object.freeze({
    buttonPadding: 24,
    buttonShadow: "0 2px 4px rgb(29 27 32 / 0.2)",
    cardPadding: 24,
    cardHeaderHeight: 64,
    menuItemHeight: 44,
    menuItemMargin: 6,
    segmentedPadding: 4,
    tabGutter: 32,
    titleMarginTop: "1.3em",
    titleMarginBottom: "0.6em",
    inputPaddingInline: 16,
    inputPaddingBlock: 8,
  }),
  editor: Object.freeze({
    buttonPadding: 14,
    buttonShadow: "none",
    cardPadding: 18,
    cardHeaderHeight: 46,
    menuItemHeight: 34,
    menuItemMargin: 3,
    segmentedPadding: 2,
    tabGutter: 24,
    titleMarginTop: "1em",
    titleMarginBottom: "0.4em",
    inputPaddingInline: 10,
    inputPaddingBlock: 4,
  }),
  warm: Object.freeze({
    buttonPadding: 18,
    buttonShadow: "0 1px 3px rgb(60 56 54 / 0.16)",
    cardPadding: 22,
    cardHeaderHeight: 54,
    menuItemHeight: 38,
    menuItemMargin: 4,
    segmentedPadding: 3,
    tabGutter: 28,
    titleMarginTop: "1.25em",
    titleMarginBottom: "0.55em",
    inputPaddingInline: 12,
    inputPaddingBlock: 5,
  }),
  catppuccin: Object.freeze({
    buttonPadding: 18,
    buttonShadow: "0 2px 5px rgb(17 24 39 / 0.18)",
    cardPadding: 22,
    cardHeaderHeight: 54,
    menuItemHeight: 38,
    menuItemMargin: 4,
    segmentedPadding: 3,
    tabGutter: 28,
    titleMarginTop: "1.15em",
    titleMarginBottom: "0.5em",
    inputPaddingInline: 12,
    inputPaddingBlock: 5,
  }),
  minimal: Object.freeze({
    buttonPadding: 14,
    buttonShadow: "none",
    cardPadding: 18,
    cardHeaderHeight: 48,
    menuItemHeight: 34,
    menuItemMargin: 2,
    segmentedPadding: 2,
    tabGutter: 22,
    titleMarginTop: "1.4em",
    titleMarginBottom: "0.55em",
    inputPaddingInline: 10,
    inputPaddingBlock: 4,
  }),
  baseline: Object.freeze({
    buttonPadding: 18,
    buttonShadow: "0 1px 3px rgb(37 36 34 / 0.12)",
    cardPadding: 24,
    cardHeaderHeight: 56,
    menuItemHeight: 40,
    menuItemMargin: 4,
    segmentedPadding: 3,
    tabGutter: 30,
    titleMarginTop: "1.3em",
    titleMarginBottom: "0.55em",
    inputPaddingInline: 12,
    inputPaddingBlock: 5,
  }),
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
  Card: Object.freeze(["headerBg", "bodyPadding", "headerPadding", "actionsBg"]),
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

function visualFamilyFor(id) {
  if (id.startsWith("github-")) return "github";
  if (id.startsWith("material-")) return "material";
  if (id === "one-dark") return "editor";
  if (id.startsWith("solarized-") || id.startsWith("gruvbox-") || id.startsWith("everforest-")) return "warm";
  if (id.startsWith("catppuccin-")) return "catppuccin";
  if (id.startsWith("obsidian-minimal-")) return "minimal";
  if (id.startsWith("obsidian-baseline-")) return "baseline";
  return "default";
}

function visualProfileFor(id) {
  return VISUAL_PROFILES[visualFamilyFor(id)];
}

function componentProfileFor(id) {
  return COMPONENT_PROFILES[visualFamilyFor(id)];
}

function createAntDesignComponents({
  colors,
  controlHeight,
  radius,
  shadow,
  status,
  visualProfile,
  componentProfile,
}) {
  const radiusPixels = Number.parseFloat(radius.medium) * 16;
  return {
    Button: {
      fontWeight: visualProfile.rhythm.headingWeight,
      defaultShadow: componentProfile.buttonShadow,
      primaryShadow: componentProfile.buttonShadow,
      dangerShadow: componentProfile.buttonShadow,
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
      paddingInline: componentProfile.buttonPadding,
      paddingInlineLG: componentProfile.buttonPadding + 4,
      paddingInlineSM: Math.max(componentProfile.buttonPadding - 4, 8),
      defaultBgDisabled: colors.codeBackground,
      dashedBgDisabled: colors.codeBackground,
    },
    Card: {
      headerBg: colors.surface,
      headerHeight: componentProfile.cardHeaderHeight,
      headerHeightSM: componentProfile.cardHeaderHeight - 8,
      bodyPadding: componentProfile.cardPadding,
      bodyPaddingSM: Math.max(componentProfile.cardPadding - 8, 12),
      headerPadding: componentProfile.cardPadding,
      headerPaddingSM: Math.max(componentProfile.cardPadding - 8, 12),
      actionsBg: colors.surface,
      extraColor: colors.textMuted,
      boxShadowTertiary: shadow,
    },
    Input: {
      paddingInline: componentProfile.inputPaddingInline,
      paddingInlineSM: Math.max(componentProfile.inputPaddingInline - 2, 8),
      paddingInlineLG: componentProfile.inputPaddingInline + 2,
      paddingBlock: componentProfile.inputPaddingBlock,
      paddingBlockSM: Math.max(componentProfile.inputPaddingBlock - 1, 2),
      paddingBlockLG: componentProfile.inputPaddingBlock + 2,
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
      itemHeight: componentProfile.menuItemHeight,
      itemMarginInline: componentProfile.menuItemMargin,
      itemMarginBlock: componentProfile.menuItemMargin,
      popupBg: colors.surfaceRaised,
    },
    Segmented: {
      itemColor: colors.textMuted,
      itemHoverColor: colors.text,
      itemHoverBg: colors.surfaceRaised,
      itemActiveBg: colors.codeBackground,
      itemSelectedBg: colors.surface,
      itemSelectedColor: colors.text,
      trackPadding: componentProfile.segmentedPadding,
      trackBg: colors.codeBackground,
    },
    Tabs: {
      cardBg: colors.codeBackground,
      inkBarColor: colors.primary,
      horizontalItemGutter: componentProfile.tabGutter,
      itemColor: colors.textMuted,
      itemActiveColor: colors.primary,
      itemHoverColor: colors.primary,
      itemSelectedColor: colors.primary,
    },
    Typography: {
      titleMarginTop: componentProfile.titleMarginTop,
      titleMarginBottom: componentProfile.titleMarginBottom,
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

function fixedTheme({
  id,
  name,
  description,
  appearance,
  source,
  aliases = [],
  colors,
  radius = { small: "0.375rem", medium: "0.625rem", large: "0.875rem" },
  shadow = "0 12px 32px rgb(15 23 42 / 0.12)",
  controlHeight = 32,
}) {
  const status = appearance === "dark" ? DARK_STATUS : LIGHT_STATUS;
  const visualProfile = visualProfileFor(id);
  const componentProfile = componentProfileFor(id);
  const semantic = {
    colors: {
      ...colors,
      status,
    },
    typography: visualProfile.typography,
    rhythm: visualProfile.rhythm,
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
        colorSuccess: status.success.foreground,
        colorWarning: status.warning.foreground,
        colorError: status.danger.foreground,
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
        fontFamily: visualProfile.typography.sans,
        fontFamilyCode: visualProfile.typography.mono,
        fontWeightStrong: visualProfile.rhythm.headingWeight,
        lineHeight: visualProfile.rhythm.lineHeight,
        boxShadow: shadow,
      },
      components: createAntDesignComponents({
        colors,
        controlHeight,
        radius,
        shadow,
        status,
        visualProfile,
        componentProfile,
      }),
    },
    provenance: originalAdaptation(source),
  };
}

const fixed = [
  fixedTheme({
    id: "default", name: "Default", appearance: "light", source: SOURCES.default,
    description: "A clear neutral canvas with confident blue interactions.",
    colors: { canvas: "#f8fafc", surface: "#ffffff", surfaceRaised: "#ffffff", text: "#0f172a", textMuted: "#475569", border: "#cbd5e1", primary: "#0958d9", primaryText: "#ffffff", focus: "#2563eb", selection: "#bfdbfe", selectionText: "#172554", codeBackground: "#e2e8f0" },
  }),
  fixedTheme({
    id: "github-light", name: "GitHub Light", aliases: ["github"], appearance: "light", source: SOURCES.github,
    description: "A crisp forge-inspired light interface with compact surfaces.",
    colors: { canvas: "#f6f8fa", surface: "#ffffff", surfaceRaised: "#ffffff", text: "#1f2328", textMuted: "#59636e", border: "#d0d7de", primary: "#0969da", primaryText: "#ffffff", focus: "#0969da", selection: "#b6d7fe", selectionText: "#111827", codeBackground: "#eff2f5" },
    radius: { small: "0.25rem", medium: "0.375rem", large: "0.625rem" }, controlHeight: 30,
  }),
  fixedTheme({
    id: "github-dark", name: "GitHub Dark", appearance: "dark", source: SOURCES.github,
    description: "A high-contrast forge-inspired dark interface.",
    colors: { canvas: "#0d1117", surface: "#161b22", surfaceRaised: "#21262d", text: "#f0f6fc", textMuted: "#9da7b1", border: "#3d444d", primary: "#58a6ff", primaryText: "#07101f", focus: "#58a6ff", selection: "#264f78", selectionText: "#ffffff", codeBackground: "#21262d" },
    radius: { small: "0.25rem", medium: "0.375rem", large: "0.625rem" }, controlHeight: 30,
  }),
  fixedTheme({
    id: "github-dark-dimmed", name: "GitHub Dark Dimmed", appearance: "dark", source: SOURCES.github,
    description: "A softened charcoal forge-inspired fixed dark variant.",
    colors: { canvas: "#22272e", surface: "#2d333b", surfaceRaised: "#373e47", text: "#f0f3f6", textMuted: "#adbac7", border: "#545d68", primary: "#6cb6ff", primaryText: "#0f1b28", focus: "#6cb6ff", selection: "#316dca", selectionText: "#ffffff", codeBackground: "#373e47" },
    radius: { small: "0.25rem", medium: "0.375rem", large: "0.625rem" }, controlHeight: 30,
  }),
  fixedTheme({
    id: "material-light", name: "Material Light", aliases: ["material"], appearance: "light", source: SOURCES.material,
    description: "A tonal light surface system with rounded, deliberate controls.",
    colors: { canvas: "#fffbfe", surface: "#fffbfe", surfaceRaised: "#f3edf7", text: "#1d1b20", textMuted: "#49454f", border: "#79747e", primary: "#6750a4", primaryText: "#ffffff", focus: "#6750a4", selection: "#eaddff", selectionText: "#21005d", codeBackground: "#f3edf7" },
    radius: { small: "0.5rem", medium: "0.75rem", large: "1.25rem" }, shadow: "0 3px 10px rgb(29 27 32 / 0.16)", controlHeight: 40,
  }),
  fixedTheme({
    id: "material-dark", name: "Material Dark", appearance: "dark", source: SOURCES.material,
    description: "A tonal dark surface system with luminous violet accents.",
    colors: { canvas: "#1c1b1f", surface: "#242126", surfaceRaised: "#2f2b32", text: "#e6e1e5", textMuted: "#cac4d0", border: "#938f99", primary: "#d0bcff", primaryText: "#27134f", focus: "#d0bcff", selection: "#4f378b", selectionText: "#f5efff", codeBackground: "#2f2b32" },
    radius: { small: "0.5rem", medium: "0.75rem", large: "1.25rem" }, shadow: "0 3px 12px rgb(0 0 0 / 0.42)", controlHeight: 40,
  }),
  fixedTheme({
    id: "one-dark", name: "One Dark", aliases: ["onedark"], appearance: "dark", source: SOURCES.oneDark,
    description: "A focused editor-dark adaptation with cool blue interactions.",
    colors: { canvas: "#282c34", surface: "#21252b", surfaceRaised: "#303640", text: "#e5e9f0", textMuted: "#abb2bf", border: "#4b5263", primary: "#61afef", primaryText: "#15202b", focus: "#61afef", selection: "#3e4451", selectionText: "#ffffff", codeBackground: "#1f2329" },
  }),
  fixedTheme({
    id: "solarized-light", name: "Solarized Light", aliases: ["solarized"], appearance: "light", source: SOURCES.solarized,
    description: "A warm low-glare light canvas with cyan-blue structure.",
    colors: { canvas: "#fdf6e3", surface: "#fffdf5", surfaceRaised: "#ffffff", text: "#073642", textMuted: "#586e75", border: "#c8c2ad", primary: "#006d83", primaryText: "#ffffff", focus: "#006d83", selection: "#d7e6bd", selectionText: "#073642", codeBackground: "#eee8d5" },
  }),
  fixedTheme({
    id: "solarized-dark", name: "Solarized Dark", appearance: "dark", source: SOURCES.solarized,
    description: "A deep teal low-glare dark canvas with cyan interactions.",
    colors: { canvas: "#002b36", surface: "#073642", surfaceRaised: "#0c4552", text: "#fdf6e3", textMuted: "#b8c4bd", border: "#43646b", primary: "#5ccfc5", primaryText: "#002b36", focus: "#5ccfc5", selection: "#1f5864", selectionText: "#ffffff", codeBackground: "#073642" },
  }),
  fixedTheme({
    id: "gruvbox-light", name: "Gruvbox Light", aliases: ["gruvbox"], appearance: "light", source: SOURCES.gruvbox,
    description: "A warm parchment adaptation with earthy red interactions.",
    colors: { canvas: "#fbf1c7", surface: "#fff8d8", surfaceRaised: "#ffffff", text: "#3c3836", textMuted: "#665c54", border: "#bdae93", primary: "#9d0006", primaryText: "#ffffff", focus: "#9d0006", selection: "#d5c4a1", selectionText: "#282828", codeBackground: "#ebdbb2" },
  }),
  fixedTheme({
    id: "gruvbox-dark", name: "Gruvbox Dark", appearance: "dark", source: SOURCES.gruvbox,
    description: "A warm charcoal adaptation with amber-orange interactions.",
    colors: { canvas: "#282828", surface: "#32302f", surfaceRaised: "#3c3836", text: "#fbf1c7", textMuted: "#d5c4a1", border: "#665c54", primary: "#fabd2f", primaryText: "#282828", focus: "#fabd2f", selection: "#504945", selectionText: "#ffffff", codeBackground: "#1d2021" },
  }),
  fixedTheme({
    id: "everforest-light", name: "Everforest Light", aliases: ["everforest"], appearance: "light", source: SOURCES.everforest,
    description: "A gentle botanical light canvas with calm green interactions.",
    colors: { canvas: "#fdf6e3", surface: "#fffbef", surfaceRaised: "#ffffff", text: "#3a4a44", textMuted: "#5f6f68", border: "#bdc9b8", primary: "#3a7460", primaryText: "#ffffff", focus: "#3a7460", selection: "#d5e2c8", selectionText: "#25352f", codeBackground: "#e7ead9" },
  }),
  fixedTheme({
    id: "everforest-dark", name: "Everforest Dark", appearance: "dark", source: SOURCES.everforest,
    description: "A soft forest-dark canvas with moss-green interactions.",
    colors: { canvas: "#2d353b", surface: "#343f44", surfaceRaised: "#3d484d", text: "#f0ead3", textMuted: "#c5c0aa", border: "#5c6a72", primary: "#a7c080", primaryText: "#1e292e", focus: "#a7c080", selection: "#475258", selectionText: "#ffffff", codeBackground: "#252d32" },
  }),
  fixedTheme({
    id: "catppuccin-latte", name: "Catppuccin Latte", aliases: ["catppuccin"], appearance: "light", source: SOURCES.catppuccin,
    description: "A creamy light adaptation with lavender-blue interactions.",
    colors: { canvas: "#eff1f5", surface: "#ffffff", surfaceRaised: "#ffffff", text: "#4c4f69", textMuted: "#6c6f85", border: "#bcc0cc", primary: "#1e66f5", primaryText: "#ffffff", focus: "#1e66f5", selection: "#c6d0f5", selectionText: "#303446", codeBackground: "#e6e9ef" },
  }),
  fixedTheme({
    id: "catppuccin-frappe", name: "Catppuccin Frappé", appearance: "dark", source: SOURCES.catppuccin,
    description: "A muted blue-gray fixed dark adaptation.",
    colors: { canvas: "#303446", surface: "#383c4f", surfaceRaised: "#414559", text: "#f2d5cf", textMuted: "#c6d0f5", border: "#626880", primary: "#8caaee", primaryText: "#18202f", focus: "#8caaee", selection: "#51576d", selectionText: "#ffffff", codeBackground: "#292c3c" },
  }),
  fixedTheme({
    id: "catppuccin-macchiato", name: "Catppuccin Macchiato", appearance: "dark", source: SOURCES.catppuccin,
    description: "A balanced blue-violet fixed dark adaptation.",
    colors: { canvas: "#24273a", surface: "#2d3146", surfaceRaised: "#363a4f", text: "#f4dbd6", textMuted: "#cad3f5", border: "#5b6078", primary: "#8aadf4", primaryText: "#151b2b", focus: "#8aadf4", selection: "#494d64", selectionText: "#ffffff", codeBackground: "#1e2030" },
  }),
  fixedTheme({
    id: "catppuccin-mocha", name: "Catppuccin Mocha", appearance: "dark", source: SOURCES.catppuccin,
    description: "A rich violet-charcoal dark adaptation with blue interactions.",
    colors: { canvas: "#1e1e2e", surface: "#282839", surfaceRaised: "#313244", text: "#f5e0dc", textMuted: "#cdd6f4", border: "#585b70", primary: "#89b4fa", primaryText: "#111827", focus: "#89b4fa", selection: "#45475a", selectionText: "#ffffff", codeBackground: "#181825" },
  }),
  fixedTheme({
    id: "obsidian-minimal-light", name: "Obsidian Minimal Light", aliases: ["obsidian-minimal"], appearance: "light", source: SOURCES.minimal,
    description: "An original restrained reading canvas inspired by Minimal's rhythm.",
    colors: { canvas: "#f7f7f5", surface: "#ffffff", surfaceRaised: "#ffffff", text: "#202020", textMuted: "#5f5f5b", border: "#d5d5d0", primary: "#4b50a8", primaryText: "#ffffff", focus: "#4b50a8", selection: "#d9daf5", selectionText: "#202044", codeBackground: "#ecece8" },
    radius: { small: "0.25rem", medium: "0.375rem", large: "0.5rem" }, shadow: "0 8px 24px rgb(32 32 32 / 0.08)",
  }),
  fixedTheme({
    id: "obsidian-minimal-dark", name: "Obsidian Minimal Dark", appearance: "dark", source: SOURCES.minimal,
    description: "An original restrained dark reading canvas inspired by Minimal's rhythm.",
    colors: { canvas: "#1f1f1f", surface: "#282828", surfaceRaised: "#313131", text: "#f1f1ef", textMuted: "#b9b9b3", border: "#4b4b48", primary: "#a9acf5", primaryText: "#17172b", focus: "#a9acf5", selection: "#46476c", selectionText: "#ffffff", codeBackground: "#181818" },
    radius: { small: "0.25rem", medium: "0.375rem", large: "0.5rem" }, shadow: "0 8px 24px rgb(0 0 0 / 0.3)",
  }),
  fixedTheme({
    id: "obsidian-baseline-light", name: "Obsidian Baseline Light", aliases: ["obsidian-baseline"], appearance: "light", source: SOURCES.baseline,
    description: "An original typographic light canvas inspired by Baseline's hierarchy.",
    colors: { canvas: "#faf9f7", surface: "#ffffff", surfaceRaised: "#ffffff", text: "#252422", textMuted: "#625f5a", border: "#d7d2cb", primary: "#245b78", primaryText: "#ffffff", focus: "#245b78", selection: "#cde5ef", selectionText: "#183342", codeBackground: "#eeeae4" },
    radius: { small: "0.25rem", medium: "0.5rem", large: "0.75rem" },
  }),
  fixedTheme({
    id: "obsidian-baseline-dark", name: "Obsidian Baseline Dark", appearance: "dark", source: SOURCES.baseline,
    description: "An original typographic dark canvas inspired by Baseline's hierarchy.",
    colors: { canvas: "#202224", surface: "#292c2f", surfaceRaised: "#32363a", text: "#f1efeb", textMuted: "#c3beb6", border: "#50565b", primary: "#8fc4df", primaryText: "#102936", focus: "#8fc4df", selection: "#3d5c6c", selectionText: "#ffffff", codeBackground: "#191b1d" },
    radius: { small: "0.25rem", medium: "0.5rem", large: "0.75rem" },
  }),
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
export const FIXED_THEMES = Object.freeze(fixed.map(deepFreeze));
export const THEMES = FIXED_THEMES;

const REQUIRED_COLORS = [
  "canvas", "surface", "surfaceRaised", "text", "textMuted", "border",
  "primary", "primaryText", "focus", "selection", "selectionText", "codeBackground",
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
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
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
    for (const field of ["name", "url", "revision", "license", "attribution", "nonEndorsement"]) {
      if (!provenance?.[field]) {
        throw new Error(`${theme.id} is missing provenance.${field}.`);
      }
    }
    if (theme.mode !== "fixed" || !["light", "dark"].includes(theme.appearance)) {
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
      if (!HEX_COLOR.test(pair?.foreground ?? "") || !HEX_COLOR.test(pair?.background ?? "")) {
        throw new Error(`${theme.id} has an invalid ${status} status pair.`);
      }
      requireContrast(theme, `${status} status`, pair.foreground, pair.background, 4.5);
    }
    requireContrast(theme, "body text", colors.text, colors.canvas, 4.5);
    requireContrast(theme, "surface text", colors.text, colors.surface, 4.5);
    requireContrast(theme, "muted text", colors.textMuted, colors.canvas, 3);
    requireContrast(theme, "primary control", colors.primaryText, colors.primary, 4.5);
    requireContrast(theme, "focus indicator", colors.focus, colors.canvas, 3);
    requireContrast(theme, "selection", colors.selectionText, colors.selection, 4.5);
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
      componentNames.some((name, index) => name !== [...ANT_DESIGN_COMPONENT_NAMES].sort()[index])
    ) {
      throw new Error(`${theme.id} has unsupported Ant Design component configuration.`);
    }
    for (const [componentName, requiredTokens] of Object.entries(REQUIRED_COMPONENT_TOKENS)) {
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
          throw new Error(`${theme.id} has a non-serializable Ant Design ${componentName} token.`);
        }
      }
    }
    for (const field of ["sans", "mono"]) {
      if (!theme.semantic.typography?.[field]) {
        throw new Error(`${theme.id} is missing typography.${field}.`);
      }
    }
    for (const field of ["lineHeight", "headingWeight", "letterSpacing", "contentMeasure"]) {
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

validateThemeCatalog();
