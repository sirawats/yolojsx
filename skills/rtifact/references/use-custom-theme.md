# Using custom JSX/TSX theme modules

## Overview

Rtifact supports custom theme modules (`.jsx` or `.tsx` files) via the `--theme` CLI option. A custom theme module gives the finished artifact coordinated styling tokens (colors, typography, spacing, status palettes, Ant Design component tokens) while optionally supplying reusable branded React components from the same module.

## Path resolution rules

### 1. Does the theme file need to be in the same directory as the entry file?

**No.** The theme file can reside in the same directory as your entry file, a subfolder, a shared parent directory, or anywhere on the local filesystem.

### 2. CLI `--theme` path resolution

When passing `--theme <path>` to `rtifact`:

- **Relative paths** (e.g., `--theme ./my-theme.jsx`, `--theme themes/brand.jsx`, `--theme ../shared/theme.tsx`) are resolved relative to the **current working directory (CWD)** where the CLI command is executed.
- **Absolute paths** (e.g., `--theme /Users/developer/themes/brand.jsx`) are resolved directly.
- **Presets vs. Paths**: A value is treated as a custom file path if it starts with `.`, contains `/` or `\`, has a file extension (`.jsx`, `.tsx`, `.js`, `.ts`), or is an absolute path. Otherwise, `rtifact` treats it as a built-in theme preset name (e.g., `github-dark`, `material`).

```sh
# Theme file in CWD
rtifact Report.jsx --theme ./amexgbt-theme.jsx

# Theme file in a subfolder
rtifact src/Report.jsx --theme ./src/themes/brand-theme.jsx

# Theme file in a shared directory
rtifact App.jsx --theme ../shared-themes/company.jsx
```

### 3. Application component import resolution

When importing named component exports from the theme file in your application `.jsx`:

- ES module imports in JavaScript/TypeScript are resolved relative to the **file performing the import**, following standard Node/ES module rules.
- If your application file and theme file are in different directories, use standard relative import paths:

#### Example: Same Directory

```
project/
├── amexgbt-theme.jsx
└── Report.jsx
```

```jsx
// Report.jsx
import { AmexGBTPage, AmexGBTHero } from "./amexgbt-theme.jsx";
```

```sh
rtifact Report.jsx --theme ./amexgbt-theme.jsx
```

#### Example: Separate Directories

```
project/
├── themes/
│   └── corporate-theme.jsx
└── src/
    └── reports/
        └── QuarterlyReport.jsx
```

```jsx
// src/reports/QuarterlyReport.jsx
import { CorporatePage, CorporateHero } from "../../themes/corporate-theme.jsx";
```

```sh
rtifact src/reports/QuarterlyReport.jsx --theme ./themes/corporate-theme.jsx
```

## Module contract & dual-export pattern

A custom theme file must export:

1. **Default Export**: A valid `ThemeDefinition` object satisfying the Rtifact theme schema (colors, typography, rhythm, components, radius, shadow, controlHeight).
2. **Named Exports (Optional)**: Reusable React components (`Nav`, `Footer`, `Page`, `Hero`, `Section`, `Callout`) that application code imports directly.

```jsx
// corporate-theme.jsx

// Default export for the Rtifact CLI theme engine
export default {
  id: "corporate",
  name: "Corporate",
  appearance: "light",
  description: "Corporate design system",
  colors: {
    canvas: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    primary: "#0284c7",
    // ...
  },
  typography: { sans: "Inter, sans-serif", mono: "monospace" },
  rhythm: { lineHeight: 1.55, headingWeight: 650, letterSpacing: "-0.01em", contentMeasure: "76rem" },
  components: { buttonPadding: 16, cardPadding: 24, cardHeaderHeight: 56, menuItemHeight: 40, menuItemMargin: 4, segmentedPadding: 2, tabGutter: 28, titleMarginTop: "1.2em", titleMarginBottom: "0.5em", inputPaddingInline: 11, inputPaddingBlock: 4 },
  radius: { small: "0.375rem", medium: "0.625rem", large: "0.875rem" },
  shadow: "0 12px 32px rgb(15 23 42 / 0.12)",
  controlHeight: 32,
};

// Named exports for application component imports
export function CorporateNav({ links }) { ... }
export function CorporatePage({ children }) { ... }
```

## Constraints and limitations

- **Top-level execution context**: Theme modules are loaded and compiled server-side during the Rtifact build step using Vite SSR. Do not execute browser-only DOM globals (`window`, `document`, `localStorage`) at the top level of the theme module outside of React component lifecycle/hooks.
- **Dependencies**: Custom theme modules can import React, Ant Design (`antd`), React Icons (`react-icons/*`), PrismJS, or relative local files. Unresolved third-party imports outside the Rtifact-supplied stack require presence in local `node_modules`.
- **Discovery**: Custom theme modules do not appear in `rtifact themes` CLI output (which lists built-in presets).
- **Security**: Theme files are compiled local code embedded in the final HTML payload. Do not hardcode secret tokens, API keys, or private credentials inside theme files.
