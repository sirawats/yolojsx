/** @satisfies {import("./src/themes.js").ThemeDefinition} */
export default {
  id: "odyssey",
  name: "Odyssey",
  appearance: "light",
  description:
    "A Mediterranean epic theme inspired by Aegean skies, sunlit golden dunes, Spartan crimson, and dark bronze armor.",
  source: {
    name: "Odyssey Reference Image",
    url: "urn:rtifact-source:user-supplied-reference-image",
    revision: "captured 2026-08-05",
    license: "User-supplied reference; rights not assessed",
  },
  colors: {
    canvas: "#f4ebda",
    surface: "#fdfaf3",
    surfaceRaised: "#ffffff",
    text: "#1b1816",
    textMuted: "#5c5043",
    border: "#aa8556",
    primary: "#992626",
    primaryText: "#ffffff",
    primaryAccent: "#992626",
    primaryAccentHover: "#7a1e1e",
    link: "#1d548c",
    focus: "#1d548c",
    selection: "#f5d796",
    selectionText: "#1b1816",
    codeBackground: "#eae0cb",
  },
  status: {
    success: {
      seed: "#3b7a33",
      foreground: "#194414",
      background: "#e3f2e0",
      border: "#3b7a33",
    },
    warning: {
      seed: "#b36b00",
      foreground: "#5c3700",
      background: "#fef1d6",
      border: "#b36b00",
    },
    danger: {
      seed: "#992626",
      foreground: "#571414",
      background: "#fae6e6",
      border: "#992626",
    },
    info: {
      seed: "#1d548c",
      foreground: "#0f3154",
      background: "#e1ecf7",
      border: "#1d548c",
    },
  },
  typography: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    heading: 'Cinzel, Georgia, "Times New Roman", serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  },
  rhythm: {
    lineHeight: 1.6,
    headingWeight: 700,
    letterSpacing: "-0.012em",
    contentMeasure: "74rem",
  },
  components: {
    buttonPadding: 20,
    buttonShadow: "0 2px 6px rgb(27 24 22 / 0.12)",
    cardBorderWidth: 1,
    cardPadding: 24,
    cardHeaderHeight: 56,
    menuItemHeight: 40,
    menuItemMargin: 4,
    segmentedPadding: 3,
    tabGutter: 28,
    titleMarginTop: "1.25em",
    titleMarginBottom: "0.5em",
    inputPaddingInline: 14,
    inputPaddingBlock: 6,
  },
  radius: {
    small: "0.25rem",
    medium: "0.5rem",
    large: "0.875rem",
  },
  shadow: "0 12px 32px rgb(27 24 22 / 0.12)",
  controlHeight: 38,
  css: `
    :not(pre) > code,
    kbd {
      padding: 0.18em 0.45em;
      margin-inline: 0.15em;
      font-size: 0.88em;
    }
  `,
};
