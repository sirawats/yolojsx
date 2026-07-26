<p align="center">
  <img src="assets/yolo_chihuahua_sticker.png" alt="yolojsx logo" width="160" />
</p>

# yolojsx

[![CI status][ci-image]][ci-url]
[![npm version][npm-image]][npm-url]
[![npm downloads][downloads-image]][npm-url]
[![Node.js version][node-image]][node-url]
[![License][license-image]][license-url]

Build one JSX component into a portable compressed HTML application—without setting up a frontend project first.

`yolojsx` supplies React, Vite, Tailwind CSS, Ant Design, and an original global theme catalog. A normal invocation writes one `<EntryName>.html` file that can open directly; directory output remains available explicitly.

## Key Features

- 🚀 **Zero Configuration**: Turn any standalone `.jsx` component into a production-ready application.
- 📦 **Complete Stack**: React 18, Vite, Tailwind CSS v4, and Ant Design bundled out of the box.
- 🎨 **20+ Built-in Themes**: Visual presets with matched typography, spacing, and Ant Design design tokens.
- 🗜️ **Single-File Compression**: Emits a self-contained `.html` file powered by browser-native `DecompressionStream("gzip")`.
- 📁 **Flexible Output**: Supports single-file HTML or traditional static asset directories (`--out-dir`).

## Table of Contents

- [Requirements](#requirements)
- [Install and Run](#install-and-run)
- [Component Contract](#component-contract)
- [Output Modes](#output-modes)
- [Themes](#themes)
- [Custom CSS](#custom-css)
- [CLI](#cli)
- [Safe Output Replacement](#safe-output-replacement)
- [Browser and Security Notes](#browser-and-security-notes)
- [Development](#development)
- [Contributing and Support](#contributing-and-support)
- [License](#license)

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- A readable `.jsx` module that default-exports a React component

## Install and Run

```sh
npm install -g yolojsx
yolojsx Home.jsx
# Outputs: ./Home.html
```

Or use an `npx` execution without installing globally:

```sh
npx yolojsx Home.jsx
```

The default artifact contains a small loader and a base64-encoded gzip payload. A modern browser restores it with `DecompressionStream("gzip")`, including when opened through `file://`; no adjacent asset directory or server is required.

## Component Contract

```jsx
import { Button, Card } from "antd";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <Card className="mx-auto max-w-xl">
        <h1>Ship a themed page</h1>
        <Button type="primary">Build it</Button>
      </Card>
    </main>
  );
}
```

Relative imports remain relative to the entry. Other bare packages resolve from the input project's `node_modules`. The CLI supplies and deduplicates React, React DOM, Ant Design, and Tailwind build support; `@ant-design/icons` is not part of the guaranteed stack.

## Output Modes

### Single-File HTML (Default)

One HTML file is produced by default:

```sh
yolojsx pages/Home.jsx
# Outputs: ./Home.html

yolojsx pages/Home.jsx --output public/index.html
```

### Directory Output (`--out-dir`)

Use `--out-dir` when you need ordinary deployable assets, strict CSP compatibility, or an application graph the single-file packer cannot normalize:

```sh
yolojsx pages/Home.jsx --out-dir dist
```

```text
dist/
├── .yolojsx-output.json
├── index.html
└── assets/
    ├── index-*.css
    └── index-*.js
```

`--base` is available for directory output:

```sh
yolojsx pages/Home.jsx --out-dir public/app --base /application/
```

### Repackaging Existing Builds (`pack`)

The `pack` command packages an existing compatible directory build into a single HTML file without changing its input:

```sh
yolojsx pack dist --output index.html
```

> [!NOTE]
> The single-file packer rejects extra executable chunks, workers, service workers, runtime-loaded WASM, unresolved local files, and runtime-relative `fetch()` calls. When a default file build encounters one of those shapes, use `--out-dir dist`.

## Themes

Theme selection is deterministic. Unsuffixed family names are convenient aliases for their light preset; dark styling is used only when a dark preset is named explicitly:

```sh
yolojsx Home.jsx --theme material       # Resolves to material-light
yolojsx Home.jsx --theme material-dark  # Explicitly dark
yolojsx themes                          # List available presets
```

### Theme Catalog

| Theme Family          | Default / Light Preset                                   | Dark Presets                                                    |
| :-------------------- | :------------------------------------------------------- | :-------------------------------------------------------------- |
| **Default**           | `default`                                                | —                                                               |
| **GitHub**            | `github-light` _(alias: `github`)_                       | `github-dark`, `github-dark-dimmed`                             |
| **Material**          | `material-light` _(alias: `material`)_                   | `material-dark`                                                 |
| **One Dark**          | —                                                        | `one-dark` _(alias: `onedark`)_                                 |
| **Solarized**         | `solarized-light` _(alias: `solarized`)_                 | `solarized-dark`                                                |
| **Gruvbox**           | `gruvbox-light` _(alias: `gruvbox`)_                     | `gruvbox-dark`                                                  |
| **Everforest**        | `everforest-light` _(alias: `everforest`)_               | `everforest-dark`                                               |
| **Catppuccin**        | `catppuccin-latte` _(alias: `catppuccin`)_               | `catppuccin-frappe`, `catppuccin-macchiato`, `catppuccin-mocha` |
| **Obsidian Minimal**  | `obsidian-minimal-light` _(alias: `obsidian-minimal`)_   | `obsidian-minimal-dark`                                         |
| **Obsidian Baseline** | `obsidian-baseline-light` _(alias: `obsidian-baseline`)_ | `obsidian-baseline-dark`                                        |

Themes never switch in response to the operating-system color preference. This keeps generated output visually stable across machines and viewing environments.

Themes affect more than color: their checked-in CSS defines typography fallbacks, reading rhythm, heading weight and tracking, control density, radii, shadows, surface hierarchy, selection, focus, code, links, and native controls. The same semantic mapping configures the matching fixed Ant Design algorithm plus official global and component tokens for Button, Card, Input, Layout, Menu, Segmented, Tabs, and Typography.

Application JSX does not need a theme provider, a CSS import, or page-level theme classes. The generated application supplies Ant Design's `ConfigProvider`, while native document elements inherit the selected background, text, typography, focus, selection, link, and code styles automatically. Prefer ordinary Ant Design props such as `type="primary"`, `danger`, `disabled`, and `Typography.Text type="secondary"` for component meaning.

These are original yolojsx adaptations, not exact reproductions or replacements for the referenced component libraries and products. No upstream or Obsidian CSS is bundled. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for reviewed sources, pinned revisions, licenses, and the non-endorsement notice.

## Custom CSS

Load a readable local `.css` file after the selected preset:

```sh
yolojsx Home.jsx --theme material --css styles/application.css
```

It participates in the same Tailwind v4 CSS-first graph, so supported directives such as `@theme`, `@utility`, and cascade layers work without a user Vite or Tailwind configuration:

```css
@theme {
  --color-brand: #7346a8;
}

:root {
  --primary: #7346a8;
  --ring: #7346a8;
}

@layer components {
  .brand-card {
    background-image: url("./mark.svg");
  }
}
```

URLs remain relative to the custom stylesheet. Vite emits them for directory builds and embeds compatible local assets in packaged HTML.

The stable cascade is `theme, base, antd, components, utilities`. Tailwind Preflight is the only reset; Ant Design reset CSS is not imported. Stored theme files live in `src/themes/`, import the shared `foundation.css`, and are compiled before custom CSS. Custom CSS can override semantic variables and rules, but it does not rewrite the generated Ant Design token object; wrap user code in another `ConfigProvider` when application-specific Ant configuration is needed.

The CLI exposes conventional semantic Tailwind names for explicit styling:

- **Surfaces**: `bg-background`, `bg-card`, `bg-popover`
- **Text**: `text-foreground`, `text-muted-foreground`, `text-primary-foreground`
- **Structure and focus**: `border-border`, `ring-ring`, `shadow-card`
- **Accent and code**: `bg-primary`, `text-primary`, `bg-code`
- **Status**: `text-success`, `text-warning`, `text-danger`, `text-info`, with matching `*-background` colors
- **Typography and shape**: `font-sans`, `font-mono`, `rounded-sm`, `rounded-md`, `rounded-lg`

These utilities are escape hatches for custom layouts, not required theme plumbing. Let the document inherit its theme and let Ant Design style its own components whenever possible.

Use `--css` for deliberate application-wide stylesheet extensions; do not import theme CSS from JSX. Built-in Ant Design styling is generated from supported official tokens rather than `.ant-*` selector patches.

## CLI

```text
Usage: yolojsx <entry.jsx> [options]
       yolojsx themes | yolojsx --themes
       yolojsx pack <directory> --output <file.html> [options]

Build a JSX component into one compressed HTML file by default.

Options:
      --output <path>   HTML output path (default: ./<EntryName>.html)
  -o, --out-dir <path> Build a directory instead of one HTML file
      --base <path>    Directory-mode public base path (default: ./)
      --theme <preset> Global theme preset (default: default)
      --themes          List available theme names
      --css <path>     Custom CSS loaded after the preset
      --single-file    Deprecated alias for the default file mode
      --force          Replace an existing protected output
  -h, --help           Show this help
  -v, --version        Show the installed version

Run `yolojsx themes` or `yolojsx --themes` to list available presets.
```

`--output` and `--out-dir` conflict. `--base` requires `--out-dir`. Theme and CSS options apply to JSX builds, not `pack`, `themes`, or `--themes`.

## Safe Output Replacement

Existing HTML files and output directories require confirmation. In a non-interactive session the CLI refuses replacement and directs automation to use `--force`. Symbolic-link outputs, filesystem roots, the current directory, directory outputs containing the source entry, and `pack` destinations inside their input are rejected.

Directory output uses `.yolojsx-output.json` ownership markers. Both modes stage publication so a failed rebuild preserves the last successful result. Custom CSS and JSX inputs are treated as read-only trusted local code.

## Browser and Security Notes

> [!IMPORTANT]
> Single-file output requires native gzip `DecompressionStream`. Its loader and restored application execute inline scripts and styles, so it is not suitable for a strict Content Security Policy (CSP) that disallows inline code. Use directory mode (`--out-dir`) for strict hosting policies. Compression is not a security boundary.

Current limitations include JSX-only input, one page per invocation, no dev server/watch/SSR, no user Vite or HTML configuration, no automatic `public/` copying, and single-file graph limitations described above.

## Development

```sh
npm install
npm run verify
```

The repository includes a varied example gallery:

| Example                                           | Suggested theme    | Demonstrates                                       |
| :------------------------------------------------ | :----------------- | :------------------------------------------------- |
| [Home.jsx](examples/Home.jsx)                     | `default`          | Compact Tailwind and Ant Design starter            |
| [Techspec.jsx](examples/Techspec.jsx)             | `github`           | Technical RFC, requirements, architecture, rollout |
| [APIDocs.jsx](examples/APIDocs.jsx)               | `github-dark`      | Interactive endpoint reference and code samples    |
| [CalculatorDemo.jsx](examples/CalculatorDemo.jsx) | `material`         | Stateful unit-economics calculator                 |
| [SaaS.jsx](examples/SaaS.jsx)                     | `catppuccin`       | Marketing, product preview, and responsive pricing |
| [Analytics.jsx](examples/Analytics.jsx)           | `one-dark`         | Dense operational metrics and service health       |
| [Editorial.jsx](examples/Editorial.jsx)           | `obsidian-minimal` | Long-form reading and typographic rhythm           |

For example:

```sh
node bin/yolojsx.js examples/APIDocs.jsx --theme github-dark
node bin/yolojsx.js examples/CalculatorDemo.jsx --theme material
```

`npm run verify` runs formatting, linting, syntax checks, unit and integration coverage, package-content inspection, and a smoke test against the extracted npm artifact, including theme assets and the default artifact-size budget. See [RELEASING.md](https://github.com/sirawats/yolojsx/blob/master/RELEASING.md).

First-time npm maintainers can follow the [npm publishing guide](https://github.com/sirawats/yolojsx/blob/master/docs/maintainers/npm-publishing.md), which separates safe dry runs from the live publication command.

## Contributing and Support

See [CONTRIBUTING.md](https://github.com/sirawats/yolojsx/blob/master/CONTRIBUTING.md) for development and pull-request guidance and [SUPPORT.md](https://github.com/sirawats/yolojsx/blob/master/SUPPORT.md) for usage help. Community participation follows [CODE_OF_CONDUCT.md](https://github.com/sirawats/yolojsx/blob/master/CODE_OF_CONDUCT.md).

Report vulnerabilities privately using [SECURITY.md](https://github.com/sirawats/yolojsx/blob/master/SECURITY.md).

## License

MIT

[ci-image]: https://github.com/sirawats/yolojsx/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/sirawats/yolojsx/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/yolojsx.svg
[npm-url]: https://www.npmjs.com/package/yolojsx
[downloads-image]: https://img.shields.io/npm/dm/yolojsx.svg
[node-image]: https://img.shields.io/node/v/yolojsx.svg
[node-url]: https://nodejs.org/
[license-image]: https://img.shields.io/npm/l/yolojsx.svg
[license-url]: https://github.com/sirawats/yolojsx/blob/master/LICENSE
