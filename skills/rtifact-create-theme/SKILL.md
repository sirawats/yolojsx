---
name: rtifact-create-theme
description: Create, revise, build, and validate custom Rtifact theme modules (.ts or .jsx) from screenshots, websites, brand assets, or design specifications. Use when Codex must derive a palette and visual system, author a valid ThemeDefinition default export, add optional branded React components, or fix custom-theme provenance, schema, contrast, or build errors.
---

# Rtifact theme creator

Create one compact theme module that gives Rtifact artifacts coherent global styling. Export a valid theme definition by default; add named React components only when the artifact will actually reuse them.

## Required workflow

1. Inspect the supplied visual or textual source. For images, sample or estimate colors from representative large regions; treat small highlights as decorative until they pass the semantic contrast contract. Extract canvas, surfaces, text, muted text, primary control, accent, link, focus, selection, status, typography, radius, and shadow choices.
2. When named brand components are needed, also extract only the relevant logo treatment, navigation and mobile behavior, hero/callout layout, footer/legal pattern, and responsive states.
3. Choose semantic colors by role, not by visual prominence. A brand color may be decorative without being safe for controls or text.
4. Read the contract and contrast matrix in the complete example below before writing the module.
5. Keep the default export free of browser globals and secrets. Named components may use React hooks normally.
6. Import named components from the theme module in the artifact; `--theme` applies only the default export.
7. Build with `rtifact App.jsx --theme ./brand-theme.jsx --output App.html`. Fix every diagnostic and rebuild until it succeeds.
8. Inspect the rendered artifact when visual fidelity matters. A successful build proves compatibility, not visual quality.

## Complete minimum theme

Every field shown below is required unless marked optional. Do not replace required values with comments or ellipses.

```jsx
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
  id: "brand-dark", // lowercase kebab-case; unique when installed
  name: "Brand Dark",
  appearance: "dark", // exactly "light" or "dark"
  description: "Dark editorial adaptation of Brand.",
  source: {
    name: "Brand reference image",
    url: "./brand-reference.png", // path, public URL, or descriptive URN for a prompt-only brief
    revision: "captured 2026-08-01",
    license: "User-supplied reference; rights not assessed",
  },
  colors: {
    canvas: C.canvas,
    surface: C.surface,
    surfaceRaised: C.raised,
    text: C.text,
    textMuted: C.muted,
    border: C.border,
    primary: C.primary,
    primaryText: C.primaryText,
    primaryAccent: C.primary, // optional; defaults to primary
    primaryAccentHover: "#ebc97c", // optional; defaults to primaryAccent
    link: C.primary, // optional; defaults to primary
    focus: C.primary,
    selection: C.primary,
    selectionText: C.primaryText,
    codeBackground: "#080b0f",
  },
  typography: {
    sans: "Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Georgia, serif", // optional; defaults to sans
    mono: '"SFMono-Regular", Consolas, monospace',
  },
  rhythm: {
    lineHeight: 1.6,
    headingWeight: 600,
    letterSpacing: "-0.01em",
    contentMeasure: "76rem",
  },
  components: {
    buttonPadding: 18,
    buttonShadow: "0 4px 18px rgb(0 0 0 / 0.3)",
    cardBorderWidth: 1, // optional; defaults to 1
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
};
```

The built-in light/dark status palettes are used when `status` is omitted. Override only roles the brand genuinely needs:

```jsx
status: {
  danger: {
    seed: "#d8574d",
    foreground: "#ffd5d0",
    background: "#5b1f1b",
    border: "#d8574d",
  },
},
```

## Contrast contract

Rtifact rejects invalid six-digit hex colors and these failing pairs:

| Role                     | Pair                                                      | Minimum |
| ------------------------ | --------------------------------------------------------- | ------: |
| Body                     | `text` / `canvas`                                         |   4.5:1 |
| Surface                  | `text` / `surface`                                        |   4.5:1 |
| Muted                    | `textMuted` / `canvas`                                    |     3:1 |
| Link                     | `link` / `canvas`                                         |   4.5:1 |
| Filled control           | `primaryText` / `primary`                                 |   4.5:1 |
| Accent                   | `primaryAccent` and hover / `surface` and `surfaceRaised` |     3:1 |
| Focus and primary border | `focus` / `canvas`, `surface`, and `surfaceRaised`        |     3:1 |
| Link border hover        | `link` / `surface` and `surfaceRaised`                    |     3:1 |
| Selection                | `selectionText` / `selection`                             |   4.5:1 |
| Status                   | each `foreground` / `background`                          |   4.5:1 |

`primary`, `primaryAccent`, and `link` may be different. Use that escape hatch when one brand color cannot satisfy every role. For example, keep a dark red as a decorative token in named components while using accessible gold for `primary` and `primaryAccent`.

## Optional named components

Export only repeated brand structures. Prefer two small components over a speculative library:

```jsx
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
      <h2 id={`${id}-title`} className="font-heading text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
```

Import them relative to the artifact source:

```jsx
import { BrandPage, BrandSection } from "./brand-theme.jsx";
```

Do not add navigation, drawers, heroes, footers, or wrappers unless the artifact needs them. Let Ant Design inherit the generated theme; do not add an application `ConfigProvider` or `.ant-*` overrides.

## Failure guide

- `missing provenance.*`: `provenance` is the CLI's internal name for `source`; fill all four `source` fields exactly as shown. For a prompt-only brief, use a descriptive URL such as `urn:rtifact-source:user-supplied-brand-brief`.
- `insufficient primary control contrast`: change `primaryText`, `primary`, or both.
- `insufficient primary accent contrast`: set a separate `primaryAccent` and optionally `primaryAccentHover`.
- `insufficient selection contrast`: change `selectionText`, `selection`, or both.
- `insufficient primary border contrast`: `focus` is unsafe on a surface.
- `insufficient primary border hover contrast`: `link` is unsafe on a surface.
- `invalid semantic color`: use a full `#rrggbb` value; shorthand, alpha hex, CSS variables, and named colors are invalid in the theme definition.

Build after the minimum default export works, then add named components. This isolates schema and contrast failures from application JSX failures.

## Final check

- Complete `source` provenance and valid kebab-case `id`.
- Exact `light` or `dark` appearance.
- Every required field present; all semantic colors are `#rrggbb`.
- Every contrast pair above passes.
- No top-level `window`, `document`, or `localStorage`.
- No unnecessary dependencies or application `ConfigProvider`.
- Every imported React Icon name exists in the selected icon subpackage.
- If present, navigation collapses accessibly on mobile and the page footer stays at the bottom on short pages.
- Reusable named components remain content-agnostic; keep subject-specific layout in the artifact.
- Artifact imports named exports normally and builds with `--theme`.
- Rendered page remains legible, responsive, keyboard accessible, and faithful to the source.
