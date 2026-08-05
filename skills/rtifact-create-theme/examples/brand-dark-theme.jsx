/**
 * Example: Minimal dark theme
 *
 * A complete, valid ThemeDefinition for a dark editorial brand.
 * Every required field is present; optional fields are annotated.
 *
 * Build this with:
 *   rtifact MyArtifact.jsx --theme ./brand-dark-theme.jsx --output out.html
 *
 * Then verify contrast and visual fidelity in a browser before shipping.
 */

// Palette — group raw values so they can be reused across roles.
const C = {
  canvas: "#0b0f14",
  surface: "#141a22",
  raised: "#1c2430",
  text: "#f4f0e6",
  muted: "#aeb8c5",
  border: "#465262",
  primary: "#d7b56d",
  primaryText: "#111318",
};

export default {
  id: "brand-dark", // Lowercase kebab-case, unique when installed.
  name: "Brand Dark",
  appearance: "dark", // Exactly "light" or "dark".
  description: "Dark editorial adaptation of Brand.",
  prismTheme: "one-dark", // Optional; use a name from `rtifact prism-themes`.
  tableStyle: "striped", // Optional: "rows", "grid", or "striped".

  // Provenance is required. For a prompt-only brief, use a descriptive URN:
  //   url: "urn:rtifact-source:user-supplied-brand-brief"
  source: {
    name: "Brand reference image",
    url: "./brand-reference.png",
    revision: "captured 2026-08-01",
    license: "User-supplied reference; rights not assessed",
  },

  colors: {
    // --- Required surface and text roles ---
    canvas: C.canvas, // Page background
    surface: C.surface, // Card / panel background
    surfaceRaised: C.raised, // Elevated popover / drawer background
    text: C.text, // Primary body text (4.5:1 on canvas and surface)
    textMuted: C.muted, // Secondary text (3:1 on canvas)
    border: C.border, // Dividers, input outlines, card edges

    // --- Required control roles ---
    primary: C.primary, // Filled control background
    primaryText: C.primaryText, // Text on filled primary controls (4.5:1 on primary)

    // --- Optional accent/link overrides ---
    // Omit these to default to `primary`. Set separately when `primary` cannot
    // satisfy every contrast requirement simultaneously.
    primaryAccent: C.primary, // Hover highlights and active indicators (3:1 on surface)
    primaryAccentHover: "#ebc97c", // Hover state of accent

    link: C.primary, // Hyperlink color (4.5:1 on canvas, 3:1 on surface)

    // --- Required focus/selection ---
    focus: C.primary, // Focus ring (3:1 on canvas, surface, surfaceRaised)
    selection: C.primary, // Text-selection background
    selectionText: C.primaryText, // Text on selection (4.5:1 on selection)

    // --- Required code background ---
    codeBackground: "#080b0f",
  },

  typography: {
    sans: "Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Georgia, serif", // Optional; defaults to sans when omitted.
    mono: '"SFMono-Regular", Consolas, monospace',
  },

  rhythm: {
    lineHeight: 1.6,
    headingWeight: 600,
    letterSpacing: "-0.01em",
    contentMeasure: "76rem", // Max prose line width.
  },

  components: {
    buttonPadding: 18,
    buttonShadow: "0 4px 18px rgb(0 0 0 / 0.3)",
    cardBorderWidth: 1, // Optional; defaults to 1.
    cardPadding: 24,
    cardHeaderHeight: 56,
    menuItemHeight: 40,
    menuItemMargin: 4,
    segmentedPadding: 2,
    tabGutter: 28,
    titleMarginTop: "1.25em",
    titleMarginBottom: "0.5em",
    inputPaddingInline: 12,
    inputPaddingBlock: 5,
  },

  radius: { small: "0.25rem", medium: "0.5rem", large: "0.875rem" },

  shadow: "0 18px 48px rgb(0 0 0 / 0.35)",
  controlHeight: 38,

  // Optional raw CSS for selectors the structured tokens cannot express.
  // Rtifact places it after theme variables in @layer components.
  css: `
    .brand-section-title::after {
      display: block;
      width: 3rem;
      height: 0.2rem;
      margin-top: 0.5rem;
      background: var(--primary);
      content: "";
    }
  `,

  // Optional: override specific status roles.
  // Omit entirely to use the built-in dark status palette.
  // status: {
  //   danger: { seed: "#d8574d", foreground: "#ffd5d0", background: "#5b1f1b", border: "#d8574d" },
  // },
};

// ----- Optional named components -----
// Export only repeated brand structures; let artifact JSX import them normally:
//   import { BrandPage, BrandSection } from "./brand-dark-theme.jsx";
// Do NOT add an application ConfigProvider or .ant-* overrides here.

export function BrandPage({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}

export function BrandSection({ id, title, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-6xl px-5 py-14 sm:px-8"
    >
      <h2
        id={`${id}-title`}
        className="brand-section-title font-heading text-4xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
