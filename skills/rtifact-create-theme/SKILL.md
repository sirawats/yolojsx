---
name: rtifact-create-theme
description: Use when creating, revising, or fixing a custom Rtifact theme module (.ts or .jsx) — whether from a screenshot, website, brand hex colors, or a design specification. Also use when adding embedded custom CSS, debugging a contrast failure inside an Rtifact-built artifact, fixing a 'missing provenance' or schema error, adjusting a theme token value, inspecting a built artifact's visual quality, or exporting branded React components that ship alongside a ThemeDefinition. The work always targets a ThemeDefinition default export consumed by the Rtifact build system — not Tailwind config, MUI, Storybook themes, styled-components, or WCAG checks unrelated to an Rtifact theme.
---

# Rtifact theme creator

Create one compact theme module that gives Rtifact artifacts coherent global
styling. Export a valid theme definition by default; add named React components
only when the artifact will actually reuse them.

## References and examples

- **[references/schema.md](references/schema.md)** — Annotated field reference
  for every `ThemeDefinition` field: types, required/optional status, defaults,
  and a contrast-tooling tip. Read it when a field's requirement or allowed
  value is unclear.
- **[examples/brand-dark-theme.jsx](examples/brand-dark-theme.jsx)** — Complete
  annotated dark theme with palette grouping and optional named components.
  Start here for a dark-mode brand.
- **[examples/brand-light-theme.jsx](examples/brand-light-theme.jsx)** — Complete
  light theme showing cream canvas and teal primary with inline contrast
  annotations. Start here for a light-mode brand.

Read the relevant example before writing your module. Replace its palette and
`source` provenance; do not clone its specific color values.

---

## Phase 1: Before writing the module

1. **Inspect the source.** For images, sample or estimate colors from
   representative large regions; treat small highlights as decorative until they
   pass the semantic contrast contract. Extract canvas, surfaces, text, muted
   text, primary control, accent, link, focus, selection, status, typography,
   radius, and shadow choices. For verbal or hex-color briefs with no visual
   reference, map each supplied color to its semantic role directly — a vivid
   brand primary is typically safe for controls and interactive elements but
   usually needs a lightened or darkened variant for canvas surfaces.
2. **Choose semantic roles.** A brand color may be decorative without being safe
   for controls or text. Map each extracted color to its role, not its visual
   prominence.
3. **Decide on named components.** Only export repeated brand structures
   (page wrapper, section shell). Do not export navigation, heroes, footers, or
   layout primitives unless the artifact will import and reuse them.

---

## Phase 2: Write the module

Read [references/schema.md](references/schema.md) and the closest example
before writing. Keep the default export free of browser globals and secrets.
Named components may use React hooks normally.

Every field shown below is required unless marked optional. Do not replace
required values with comments or ellipses.

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
  css: ".brand-kicker { color: var(--primary); letter-spacing: 0.12em; }", // optional
};
```

The built-in light/dark status palettes are used when `status` is omitted.
Override only roles the brand genuinely needs:

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

### Optional embedded CSS

Use `css` only for theme-wide selectors or pseudo-elements that semantic tokens,
Ant Design component tokens, and focused Tailwind classes cannot express. Omit
it when those existing layers are enough.

```jsx
css: `
  .brand-kicker {
    color: var(--primary);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
`,
```

Rtifact places this raw string after theme variables in `@layer components` in
every JSX output mode. Reference semantic variables such as `var(--primary)`,
`var(--foreground)`, and `var(--code)`; do not add another `@layer` wrapper.
Keep Ant Design customization in `components` tokens rather than `.ant-*`
selectors. Malformed CSS fails the build through Vite's CSS diagnostic.

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

`primary`, `primaryAccent`, and `link` may be different. Use that escape hatch
when one brand color cannot satisfy every role.

**Finding a passing value:** compute contrast with the browser DevTools color
picker (eyedropper → check contrast), `colorjs.io`, or the APCA Contrast
Calculator. For normal 16 px text the WCAG AA threshold is 4.5:1; for large
text (≥ 18 px regular or ≥ 14 px bold) it drops to 3:1. See
[references/schema.md](references/schema.md) for the full per-field table.

## Optional named components

Export only repeated brand structures. Prefer two small components over a
speculative library:

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

Do not add navigation, drawers, heroes, footers, or wrappers unless the
artifact needs them. Let Ant Design inherit the generated theme; do not add an
application `ConfigProvider` or `.ant-*` overrides.

---

## Phase 3: Build and verify

Build with the default export first, before adding named components. This
isolates schema and contrast failures from application JSX failures.

```sh
rtifact MinimalApp.jsx --theme ./brand-theme.jsx --output MinimalApp.html
```

Fix every diagnostic and rebuild until it succeeds, then build the real
artifact. Do not switch output modes to evade a theme validation error. Inspect
the rendered artifact in a browser when visual fidelity matters — a successful
build proves compatibility, not visual quality.

---

## Failure guide

- `missing provenance.*`: `provenance` is the CLI's internal name for `source`;
  fill all four `source` fields exactly as shown. For a prompt-only brief use
  `urn:rtifact-source:user-supplied-brand-brief`.
- `insufficient primary control contrast`: change `primaryText`, `primary`, or
  both.
- `insufficient primary accent contrast`: set a separate `primaryAccent` and
  optionally `primaryAccentHover`.
- `insufficient selection contrast`: change `selectionText`, `selection`, or
  both.
- `insufficient primary border contrast`: `focus` is unsafe on a surface.
- `insufficient primary border hover contrast`: `link` is unsafe on a surface.
- `invalid semantic color`: use a full `#rrggbb` value; shorthand, alpha hex,
  CSS variables, and named colors are invalid in the theme definition.
- `invalid css property`: make `css` a string or omit it.
- CSS parser error: fix the malformed rule in `css` and retry the same build.

---

## Guardrails

- Do not read `node_modules` to understand Rtifact's theme system. The schema,
  contrast contract, and build interface are fully documented in this skill and
  its references. Internal source code is not a stable contract.
- Named components are trusted local code; do not use `window`, `document`, or
  `localStorage` at module top level in the default export.
- Never embed secrets in a theme module.

---

## Pre-flight checklist

Before handing off or committing a theme, verify these easy-to-miss items that
the build does **not** fully catch:

- [ ] Rendered page is legible and comfortable on mobile (not just desktop).
- [ ] Named components are content-agnostic; subject-specific layout stays in
      the artifact.
- [ ] `source` provenance filled; `id` is lowercase kebab-case and unique.
- [ ] No secrets embedded anywhere in the module.
- [ ] If navigation is included, it collapses accessibly on small screens and
      the footer stays at the bottom on short pages.
