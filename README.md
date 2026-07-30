<p align="center">
  <img src="assets/yolo_chihuahua_sticker.png" alt="yolojsx" width="260" />
</p>

# yolojsx

[![CI status][ci-image]][ci-url]
[![npm version][npm-image]][npm-url]
[![npm downloads][downloads-image]][npm-url]
[![Node.js version][node-image]][node-url]
[![License][license-image]][license-url]

Turn one JSX component into one portable, interactive HTML app.

**No frontend project. No Vite config. No deployment required.**

Write compact JSX with React, Tailwind CSS, Ant Design, React Icons, and
PrismJS already available. yolojsx builds it into an HTML file you can open,
upload, or send to someone.

**Easy and simple**

```
npx yolojsx Artifact.jsx --output artifact.html
```

➡️ Give you a .html file with fully React interactive UI start from **15 KB**.

[See examples at website](https://sirawats.github.io/yolojsx/)

## AI agent skill

Install the official yolojsx authoring skill through the universal Skills CLI
or your agent's marketplace/plugin system.

### Via Skills

The [Skills CLI](https://github.com/vercel-labs/skills) supports Codex, Claude
Code, Gemini CLI, Antigravity, OpenCode, Cursor, and other coding agents:

```sh
npx skills add sirawats/yolojsx --skill yolojsx
```

Add `--global` to make the skill available across projects.

### Via Marketplace/Plugin

The agent-specific adapters are distributed through Git and are not included in
the npm package.

<details>
<summary>Codex</summary>

```sh
codex plugin marketplace add sirawats/yolojsx
codex plugin add yolojsx@yolojsx
```

</details>

<details>
<summary>Claude Code</summary>

```text
/plugin marketplace add sirawats/yolojsx
/plugin install yolojsx@yolojsx
```

</details>

<details>
<summary>Antigravity or Gemini CLI</summary>

```sh
agy plugin install https://github.com/sirawats/yolojsx

# Gemini CLI
gemini extensions install https://github.com/sirawats/yolojsx
```

</details>

<details>
<summary>OpenCode</summary>

Clone the repository, then add its adapter to your project or global
`opencode.json`:

```sh
git clone https://github.com/sirawats/yolojsx.git /path/to/yolojsx
```

```json
{
  "plugin": ["/absolute/path/to/yolojsx/.opencode/plugins/yolojsx.mjs"]
}
```

</details>

Both installation paths use the canonical `skills/yolojsx` skill.

## Quick start

After installing the skill, ask your preferred AI agent:

```text
/yolojsx Create an API testing report that's ready to send to my frontend engineer colleague
```

Your agent creates the JSX, builds it with yolojsx, and gives you a portable
HTML file you can open, upload, or send. No local server or adjacent asset
directory is needed.

Requires Node.js `^20.19.0` or `>=22.12.0`.

## CLI

```text
Usage: yolojsx <entry.jsx|entry.tsx> [options]
       yolojsx themes | yolojsx --themes
       yolojsx prism-themes | yolojsx --prism-themes
       yolojsx pack <directory> --output <file.html> [options]

Build a JSX component into one CDN-backed compressed HTML file by default.

Options:
      --output <path>    HTML output path (default: ./<EntryName>.html)
  -o, --out-dir <path>  Build a directory instead of one HTML file
      --base <path>     Directory-mode public base path (default: ./)
      --self-contained  Embed runtime dependencies for offline use
      --theme <preset>  Global theme preset (default: default)
      --themes           List available theme names
      --prism-themes     List available Prism theme names
      --css <path>      Custom CSS loaded after the preset
      --single-file     Deprecated alias for the default file mode
      --force           Replace an existing protected output
  -h, --help            Show this help
  -v, --version         Show the installed version

Run `yolojsx themes` or `yolojsx prism-themes` to list available themes.
```

`--output` and `--out-dir` conflict. `--base` requires `--out-dir`.
`--self-contained` applies only to direct HTML builds; `pack` is already
self-contained.

Existing output requires confirmation. Non-interactive automation must pass
`--force`. yolojsx rejects unsafe targets such as filesystem roots, symbolic
links, the current directory, and outputs containing their source input.
Builds are staged so a failed replacement preserves the last successful result.

## Pick a theme

```sh
npx yolojsx themes

# Output
default
github-light
github-dark
github-dark-dimmed
material-light
material-dark
one-dark
solarized-light
solarized-dark
gruvbox-light
gruvbox-dark
everforest-light
everforest-dark
catppuccin-latte
catppuccin-frappe
catppuccin-macchiato
catppuccin-mocha
obsidian-minimal-light
obsidian-minimal-dark
obsidian-baseline-light
obsidian-baseline-dark
```

Then build with any preset:

```sh
npx yolojsx Report.jsx --theme catppuccin-mocha
```

Themes style the document and Ant Design together: typography, colors,
spacing, surfaces, controls, focus states, and code.

## Choose an output

| Need                      | Command                                | Result                            |
| :------------------------ | :------------------------------------- | :-------------------------------- |
| A portable file           | `npx yolojsx App.jsx`                  | `App.html`                        |
| A file that works offline | `npx yolojsx App.jsx --self-contained` | `App.html` with runtimes embedded |
| A deployable static site  | `npx yolojsx App.jsx --out-dir dist`   | `dist/` with conventional assets  |

The default portable file embeds your application, CSS, and local assets. Its
pinned React and Ant Design runtimes load from a CDN. Use `--self-contained`
when network access cannot be assumed.

## Built for AI-authored apps

yolojsx is useful when the rendered result matters more than maintaining a
frontend project:

- API test reports
- Internal setup guides
- Interactive technical documents
- Design and feature comparisons
- Calculators and focused browser tools
- Product demos

Give your coding agent the official yolojsx skill so it knows the component
contract, supplied packages, themes, and output modes.

[Install the agent skill](#ai-agent-skill) ·
[Browse examples](examples) ·
[See all CLI options](#cli)

## Examples

| Example                                               | Theme                | Demonstrates                                           |
| :---------------------------------------------------- | :------------------- | :----------------------------------------------------- |
| [APITestReport.jsx](examples/APITestReport.jsx)       | `github`             | Filterable API failures and request/response evidence  |
| [CodeReviewReport.jsx](examples/CodeReviewReport.jsx) | `github-dark-dimmed` | Actionable findings, severity filters, suggested diffs |
| [SetupGuide.jsx](examples/SetupGuide.jsx)             | `gruvbox`            | Guided setup checklist, commands, troubleshooting      |
| [Techspec.jsx](examples/Techspec.jsx)                 | `github`             | Technical RFC, requirements, architecture, rollout     |
| [APIDocs.jsx](examples/APIDocs.jsx)                   | `github-dark`        | Interactive endpoint reference and code samples        |
| [TaxCalculator.jsx](examples/TaxCalculator.jsx)       | `material`           | Stateful progressive tax calculator                    |
| [SaaS.jsx](examples/SaaS.jsx)                         | `catppuccin`         | Product preview and responsive pricing                 |
| [Analytics.jsx](examples/Analytics.jsx)               | `one-dark`           | Operational metrics and service health                 |
| [Editorial.jsx](examples/Editorial.jsx)               | `obsidian-minimal`   | Long-form reading and typographic rhythm               |

Try one from a repository clone:

```sh
npm run build
node lib/bin.js examples/APIDocs.jsx --theme github-dark
```

## Component contract

The entry must be a readable `.jsx` or `.tsx` module with a default-exported
React component. Relative imports resolve from the entry file.

```jsx
import { Button, Card } from "antd";
import { FiDownload } from "react-icons/fi";
import icon from "./icon.png";

export const YOLOJSX = {
  title: "Release report",
  icon,
};

export default function Report() {
  return (
    <main className="min-h-screen p-8">
      <Card className="mx-auto max-w-xl">
        <h1>Release report</h1>
        <Button type="primary" icon={<FiDownload aria-hidden="true" />}>
          Download
        </Button>
      </Card>
    </main>
  );
}
```

The optional `YOLOJSX` export sets the browser-tab title and favicon. The icon
may be an imported local image or a remote or data URL.

The CLI supplies:

- React and React DOM
- Ant Design
- Tailwind CSS
- React Icons
- PrismJS and Prism Themes

Other bare package imports resolve from the input project's `node_modules`.

### Prism themes

Set syntax highlighting independently from the page theme:

```jsx
export const YOLOJSX = { prismTheme: "prism" };
```

Run `npx yolojsx prism-themes` to discover installed Prism theme names. Unknown
names warn and fall back to `prism`.

## Output modes

### Portable HTML

The default command writes one CDN-backed compressed HTML file:

```sh
yolojsx pages/Home.jsx
# Output: ./Home.html

yolojsx pages/Home.jsx --output public/index.html
```

Application code, generated CSS, local assets, selected Prism modules, and
React Icons remain embedded. React, React DOM, Ant Design, and Ant Design
CSS-in-JS load from pinned esm.sh URLs.

### Offline HTML

Embed the supplied runtimes when the file must work without network access:

```sh
yolojsx pages/Home.jsx --self-contained
```

### Static asset directory

Use directory output for conventional hosting, strict Content Security Policy,
or application graphs that cannot be packaged into one file:

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

Set a hosting base path when needed:

```sh
yolojsx pages/Home.jsx --out-dir public/app --base /application/
```

### Package an existing build

Package a compatible directory build into self-contained HTML without changing
the input:

```sh
yolojsx pack dist --output index.html
```

> [!NOTE]
> The single-file packer rejects extra executable chunks, workers, service
> workers, runtime-loaded WASM, unresolved local files, and runtime-relative
> `fetch()` calls. Use `--out-dir dist` for those application shapes.

## Styling

Unsuffixed theme families select their light preset. Dark styling is used only
when explicitly requested:

```sh
yolojsx Home.jsx --theme material       # material-light
yolojsx Home.jsx --theme material-dark  # explicitly dark
```

Other aliases include `github`, `solarized`, `gruvbox`, `everforest`,
`catppuccin`, `obsidian-minimal`, `obsidian-baseline`, and `onedark`.

Application JSX needs no theme provider, theme CSS import, or page-level theme
class. Let the document inherit global styling and use ordinary Ant Design
props such as `type="primary"`, `danger`, and `disabled`.

Semantic Tailwind utilities are available when a layout needs explicit styling:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`
- Text: `text-foreground`, `text-muted-foreground`
- Structure: `border-border`, `ring-ring`, `shadow-card`
- Status: `text-success`, `text-warning`, `text-danger`, `text-info`
- Typography and shape: `font-sans`, `font-mono`, `rounded-md`

### Custom CSS

Load one local stylesheet after the selected preset:

```sh
yolojsx Home.jsx --theme material --css styles/application.css
```

It participates in the Tailwind v4 CSS-first graph:

```css
@theme {
  --color-brand: #7346a8;
}

:root {
  --primary: #7346a8;
  --ring: #7346a8;
}
```

URLs stay relative to the stylesheet. Vite emits them in directory mode and
embeds compatible local assets in packaged HTML.

## Browser and security notes

> [!IMPORTANT]
> Portable HTML requires native gzip `DecompressionStream`. Default output also
> requires import-map support and network access to `https://esm.sh`. File modes
> execute inline scripts and styles, so use directory output for a strict CSP.
> Compression is not a security boundary.

Current limitations include JSX-only input, one page per invocation, no
dev-server/watch/SSR mode, no user Vite or HTML configuration, and no automatic
`public/` directory copying.

## Development and support

```sh
npm ci
npm run verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository development,
[SUPPORT.md](SUPPORT.md) for usage help, and [SECURITY.md](SECURITY.md) for
private vulnerability reporting.

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
