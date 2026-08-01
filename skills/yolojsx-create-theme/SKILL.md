---
name: yolojsx-create-theme
description: Create, revise, build, and evaluate custom yolojsx theme modules (.jsx or .tsx) containing a theme definition (default export) and reusable brand components (named exports) derived from website inspection or design specifications.
---

# yolojsx-create-theme

Create portable, self-contained custom themes and reusable branded React components for the `yolojsx` CLI ecosystem.

## Goal

Enable AI agents to inspect a website or ingest brand design specifications and construct a single-file custom theme module (`<brand>-theme.jsx`). The generated module fulfills two roles simultaneously:

1. **`default export`**: A `ThemeDefinition` object consumed by the `yolojsx --theme` CLI flag to configure global CSS variables, typography, component tokens, status colors, and Ant Design algorithms.
2. **`named exports`**: Reusable React components (`<Brand>Nav`, `<Brand>Footer`, `<Brand>Hero`, `<Brand>Section`, `<Brand>Callout`, `<Brand>Page`) imported directly by application `.jsx` artifacts.

---

## Target Extraction Outputs (Website / Design Inspection)

Agents may use any available tool capability (browser automation, HTTP fetch, CSS parsing, screenshot analysis, or direct specification text) to extract the following design elements:

| Output Area                 | Extracted Details                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Color Schema**            | Primary brand hex, dark surface/navy hex, light canvas background, accent/highlight hex, link colors, and status colors (success, warning, danger, info). |
| **Typography**              | Primary sans-serif font stack, monospaced font stack, heading weights (e.g., 600), line height, letter-spacing (e.g., `-0.02em`).                         |
| **Geometry & Surfaces**     | Border radii (small, medium, large/pill `1.5rem`), card border widths, shadow elevations, control heights.                                                |
| **Header / Nav Bar**        | Logo appearance/URL, navigation links layout, support/contact badges, CTA button style, mobile drawer behavior.                                           |
| **Footer**                  | Background color, column layout structure, social links, legal disclaimers, copyright text.                                                               |
| **Callout / Hero Patterns** | Distinctive background gradients, full-width section paddings, callout card shapes.                                                                       |

---

## Single-File Dual Export Architecture

A `yolojsx` custom theme is authored in a single `.jsx` or `.tsx` file:

```jsx
// <brand>-theme.jsx

import { useState } from "react";
import { Button, Drawer, Space } from "antd";
import { LuMenu, LuX } from "react-icons/lu";

// 1. Internal Brand Design Tokens
const BRAND = {
  navy: "#00175a",
  blue: "#006fcf",
  canvas: "#f0f4fa",
  white: "#ffffff",
  border: "#c8d4e6",
};

// 2. Default Export — ThemeDefinition (Consumed by yolojsx CLI engine)
/** @satisfies {import("./src/themes.js").ThemeDefinition} */
export default {
  id: "brand-name",
  name: "Brand Name",
  appearance: "light",
  description: "Custom brand theme definition",
  source: { name: "Brand Web Audit", url: "https://example.com", revision: "1.0", license: "Proprietary" },
  colors: {
    canvas: BRAND.canvas,
    surface: BRAND.white,
    surfaceRaised: BRAND.white,
    text: BRAND.navy,
    textMuted: "#3d4f6f",
    border: BRAND.border,
    primary: BRAND.blue,
    primaryText: BRAND.white,
    link: BRAND.blue,
    focus: BRAND.blue,
    selection: "#d0e4f9",
    selectionText: BRAND.navy,
    codeBackground: "#e8f0f9",
  },
  typography: {
    sans: '"Segoe UI", Roboto, sans-serif',
    mono: '"SFMono-Regular", Consolas, monospace',
  },
  rhythm: { lineHeight: 1.6, headingWeight: 600, letterSpacing: "-0.02em", contentMeasure: "78rem" },
  components: {
    buttonPadding: 20, buttonShadow: "0 1px 3px rgb(0 23 90 / 0.12)", cardBorderWidth: 0,
    cardPadding: 24, cardHeaderHeight: 56, menuItemHeight: 42, menuItemMargin: 4,
    segmentedPadding: 3, tabGutter: 28, titleMarginTop: "1.3em", titleMarginBottom: "0.5em",
    inputPaddingInline: 14, inputPaddingBlock: 6,
  },
  radius: { small: "0.375rem", medium: "0.625rem", large: "1.5rem" },
  shadow: "0 8px 24px rgb(0 23 90 / 0.10)",
  controlHeight: 36,
};

// 3. Named Exports — Reusable React Components (Imported by artifact applications)
export function BrandLogo({ height = 36 }) { ... }
export function BrandNav({ links, cta }) { ... }
export function BrandHero({ title, subtitle, cta }) { ... }
export function BrandFooter({ columns, copyright }) { ... }
export function BrandSection({ title, children, background }) { ... }
export function BrandCallout({ title, description, cta }) { ... }
export function BrandPage({ navLinks, children }) { ... }
```

---

## Key Techniques & Implementation Steps

### Step 1: Define Internal Brand Tokens

Declare a clean JavaScript object (`BRAND`) containing exact hex colors and layout constants extracted during inspection. Re-use these tokens across both the `default` theme definition and the `named` components to ensure single-source-of-truth consistency.

### Step 2: Construct the `ThemeDefinition` Default Export

Supply all required fields of the `ThemeDefinition` interface:

- **`colors`**: Map semantic roles (`canvas`, `surface`, `text`, `border`, `primary`, `focus`, `selection`, `codeBackground`).
- **`status`**: Define custom status object containing `success`, `warning`, `danger`, `info` (foreground, background, border, seed).
- **`typography`**: Provide robust font stacks for `sans` and `mono`.
- **`rhythm`**: Set `lineHeight`, `headingWeight`, `letterSpacing`, and `contentMeasure`.
- **`components`**: Tune component-level tokens (`buttonPadding`, `cardPadding`, `cardHeaderHeight`, `inputPaddingBlock`, etc.).
- **`radius`**: Configure `small`, `medium`, and `large` border-radius values.

### Step 3: Build Reusable Branded React Components

Export the standard set of branded UI layout components:

1. **`<BrandLogo>`**: Renders brand logo mark and text with light/dark theme variants.
2. **`<BrandNav>`**: Sticky header navigation bar with desktop link list, action CTA buttons, and a responsive mobile `Drawer` menu triggered by a hamburger button.
3. **`<BrandHero>`**: Full-width prominent hero header with gradient backgrounds, responsive title scaling (`clamp(...)`), description, and CTA actions.
4. **`<BrandSection>`**: Layout container with configurable background themes (`white`, `light`, `navy`, `blue`) and consistent horizontal padding (`maxWidth: 1440`).
5. **`<BrandCallout>`**: High-contrast banner card with rounded corners (`1.5rem`), prominent title, description, and action button.
6. **`<BrandFooter>`**: Multi-column footer with brand logo, social links, navigation groups, legal links, disclaimers, and copyright text.
7. **`<BrandPage>`**: Full-page layout wrapper combining `BrandNav`, `<main style={{ flex: 1 }}>`, and `BrandFooter` in a flexbox column with sticky footer behavior (`minHeight: "100vh"`).

### Step 4: Author Application Artifacts Using Named Exports

In application `.jsx` files, import named components directly from the theme module:

```jsx
import { BrandPage, BrandHero, BrandSection } from "./my-theme.jsx";

export default function App() {
  return (
    <BrandPage>
      <BrandHero title="Application Title" />
      <BrandSection title="Overview">{/* Application Content */}</BrandSection>
    </BrandPage>
  );
}
```

### Step 5: Verify via CLI

Run the CLI build using the custom theme file:

```sh
# Package entry using the custom theme
yolojsx App.jsx --theme ./my-theme.jsx --output dist/index.html --force
```

---

## Evaluation Checklist

Use this checklist to evaluate any custom theme module created for `yolojsx`:

- [ ] **Dual Export Compliance**: Does the theme module provide a valid `default export` object matching `ThemeDefinition` and `named exports` for reusable UI components?
- [ ] **No Diagnostic Errors**: Does `yolojsx <entry> --theme ./<theme>.jsx` compile cleanly with 0 build or import errors?
- [ ] **Icon Imports**: Are all `react-icons` imports verified against the exact icon set (e.g. `LuCircleCheck` instead of non-existent `LuCheckCircle` in `react-icons/lu`)?
- [ ] **Color Contrast**: Do text colors (`#00175a`) against canvas (`#f0f4fa`) and primary buttons (`#006fcf`) meet WCAG AA contrast (minimum 4.5:1 for body text)?
- [ ] **Responsive Navigation**: Does `<BrandNav>` collapse cleanly into a mobile drawer on screens `< 640px`?
- [ ] **Sticky Footer**: Does `<BrandPage>` keep the footer pinned to the bottom of the viewport on short content pages?
- [ ] **Component Portability**: Can the theme and components be used for arbitrary content types (reports, setup guides, dashboards) beyond the original website subject matter?
- [ ] **Ant Design Integration**: Do Ant Design components (`Button`, `Card`, `Collapse`, `Steps`, `Tag`) inherit theme styling properly without custom `.ant-*` CSS selector overrides?
