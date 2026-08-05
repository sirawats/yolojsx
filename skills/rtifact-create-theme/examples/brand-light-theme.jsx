/**
 * Example: Minimal light theme
 *
 * A complete, valid ThemeDefinition for a light brand with a teal primary.
 * Shows how light-mode surfaces and muted text must still meet contrast.
 *
 * Build this with:
 *   rtifact MyArtifact.jsx --theme ./brand-light-theme.jsx --output out.html
 */

// Palette — group raw values so they can be reused across roles.
const C = {
  canvas: "#f8f7f4",
  surface: "#ffffff",
  raised: "#f0eeea",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#d5d1ca",
  primary: "#0e7a6e",
  primaryText: "#ffffff",
};

export default {
  id: "brand-light",
  name: "Brand Light",
  appearance: "light",
  description: "Clean light variant of Brand with a teal primary.",

  source: {
    name: "Brand style guide v3",
    url: "urn:rtifact-source:brand-style-guide-v3",
    revision: "2026-08-01",
    license: "Internal brand assets",
  },

  colors: {
    canvas: C.canvas,
    surface: C.surface,
    surfaceRaised: C.raised,
    text: C.text, // #1a1a1a / #f8f7f4 → ~17:1 ✓
    textMuted: C.muted, // #6b6b6b / #f8f7f4 → ~5.3:1 ✓ (3:1 minimum)
    border: C.border,

    primary: C.primary, // #0e7a6e
    primaryText: C.primaryText, // #ffffff / #0e7a6e → ~4.6:1 ✓

    // `primaryAccent` on light surfaces: #0e7a6e on #fff → ~4.6:1 > 3:1 ✓
    // No need to separate primaryAccent in this example.

    link: C.primary, // #0e7a6e / #f8f7f4 → ~4.6:1 ✓
    focus: C.primary, // same; 3:1 minimum on all surfaces ✓

    selection: "#b2e0da", // Teal wash for selection background
    selectionText: "#0a2e2a", // Dark teal text on selection → ~12:1 ✓

    codeBackground: "#edeae5",
  },

  typography: {
    sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    // heading omitted → defaults to sans
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },

  rhythm: {
    lineHeight: 1.55,
    headingWeight: 700,
    letterSpacing: "0em",
    contentMeasure: "72rem",
  },

  components: {
    buttonPadding: 16,
    buttonShadow: "0 2px 8px rgb(0 0 0 / 0.08)",
    cardPadding: 24,
    cardHeaderHeight: 52,
    menuItemHeight: 40,
    menuItemMargin: 2,
    segmentedPadding: 2,
    tabGutter: 24,
    titleMarginTop: "1.1em",
    titleMarginBottom: "0.45em",
    inputPaddingInline: 12,
    inputPaddingBlock: 5,
  },

  radius: { small: "0.375rem", medium: "0.625rem", large: "1rem" },

  shadow: "0 4px 24px rgb(0 0 0 / 0.08)",
  controlHeight: 36,
};
