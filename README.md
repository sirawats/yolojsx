# Rtifact

<p align="center">
  <img src="assets/chihuahua_archaeologist_artifact.png" width="280" alt="Rtifact Chihuahua archaeologist uncovering an artifact">
</p>

[![CI status][ci-image]][ci-url]
[![npm version][npm-image]][npm-url]
[![npm downloads][downloads-image]][npm-url]
[![Node.js version][node-image]][node-url]
[![License][license-image]][license-url]

**Rtifact turns a .jsx into portable, interactive .html artifacts.**

Why write an `.html` file when you can write responsive `.jsx`? Let your AI agent create `.jsx` with React, AntD, Tailwind CSS, React Icons, and PrismJS. **Rtifact** handles the build and produces the finished artifact.

By default, it produces one shareable `.html` file starting at about **15 KB**.

**One CLI command**

```
npx rtifact Artifact.jsx --output artifact.html
```

**Or use it with a skill**

```
/rtifact Create an easy-to-read documentation guide I can send to my colleague.
```

➡️ Get a finished, portable HTML artifact in one `.html` file.

[See examples at website](https://sirawats.github.io/rtifact/)

_Powered by React, Tailwind CSS, Ant Design, React Icons, and PrismJS._

## AI agent skill

Install the official Rtifact authoring skill through the universal Skills CLI
or your agent's marketplace/plugin system.

### Via Skills

The [Skills CLI](https://github.com/vercel-labs/skills) supports Codex, Claude
Code, Gemini CLI, Antigravity, OpenCode, Cursor, and other coding agents:

```sh
npx skills add sirawats/rtifact --skill rtifact rtifact-create-theme
```

Add `--global` to make the skill available across projects.

### Via Marketplace/Plugin

The agent-specific adapters are distributed through Git and are not included in
the npm package.

<details>
<summary>Codex</summary>

```sh
codex plugin marketplace add sirawats/rtifact
codex plugin add rtifact@rtifact
```

</details>

<details>
<summary>Claude Code</summary>

```text
/plugin marketplace add sirawats/rtifact
/plugin install rtifact@rtifact
```

</details>

<details>
<summary>Antigravity or Gemini CLI</summary>

```sh
agy plugin install https://github.com/sirawats/rtifact

# Gemini CLI
gemini extensions install https://github.com/sirawats/rtifact
```

</details>

<details>
<summary>OpenCode</summary>

Clone the repository, then add its adapter to your project or global
`opencode.json`:

```sh
git clone https://github.com/sirawats/rtifact.git /path/to/rtifact
```

```json
{
  "plugin": ["/absolute/path/to/rtifact/.opencode/plugins/rtifact.mjs"]
}
```

</details>

Both installation paths use the canonical `skills/rtifact` skill.

## Quick start

After installing the skill, ask your preferred AI agent:

```text
/rtifact Create an API testing report that's ready to send to my frontend engineer colleague
```

Your agent creates the JSX, builds it with Rtifact, and gives you a finished
HTML artifact you can open, upload, or send. No local server or adjacent asset
directory is needed.

Requires Node.js `^20.19.0` or `>=22.12.0`.

## CLI

```text
Usage: rtifact <entry.jsx|entry.tsx> [options]
       rtifact themes | rtifact --themes
       rtifact prism-themes | rtifact --prism-themes
       rtifact pack <directory> --output <file.html> [options]

Build a JSX component into one CDN-backed compressed HTML file by default.

Options:
      --output <path>    HTML output path (default: ./<EntryName>.html)
  -o, --out-dir <path>  Build a directory instead of one HTML file
      --base <path>     Directory-mode public base path (default: ./)
      --self-contained  Embed runtime dependencies for offline use
      --theme <value>   Global theme preset or .ts/.jsx module (default: default)
      --themes           List available theme names
      --prism-themes     List available Prism theme names
      --single-file     Deprecated alias for the default file mode
      --force           Replace an existing protected output
  -h, --help            Show this help
  -v, --version         Show the installed version

Run `rtifact themes` or `rtifact prism-themes` to list available themes.
```

`--output` and `--out-dir` conflict. `--base` requires `--out-dir`.
`--self-contained` applies only to direct HTML builds; `pack` is already
self-contained.

Existing output requires confirmation. Non-interactive automation must pass
`--force`. Rtifact rejects unsafe targets such as filesystem roots, symbolic
links, the current directory, and outputs containing their source input.
Builds are staged so a failed replacement preserves the last successful result.

## Pick a theme

```sh
npx rtifact themes

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
npx rtifact Report.jsx --theme catppuccin-mocha
```

Themes style the document and Ant Design together: typography, colors,
spacing, surfaces, controls, focus states, and code.

## Choose an output

| Need                      | Command                                | Result                            |
| :------------------------ | :------------------------------------- | :-------------------------------- |
| A portable file           | `npx rtifact App.jsx`                  | `App.html`                        |
| A file that works offline | `npx rtifact App.jsx --self-contained` | `App.html` with runtimes embedded |
| A deployable static site  | `npx rtifact App.jsx --out-dir dist`   | `dist/` with conventional assets  |

The default portable artifact embeds your application, CSS, and local assets. Its
pinned React and Ant Design runtimes load from a CDN. Use `--self-contained`
when network access cannot be assumed.

## Built for AI-authored artifacts

Rtifact is useful when the rendered result matters more than maintaining a
frontend project:

- API test reports
- Internal setup guides
- Interactive technical documents
- Design and feature comparisons
- Calculators and focused browser tools
- Product demos

Give your coding agent the official Rtifact skill so it knows the artifact
source contract, supplied packages, themes, output modes, and rendered-quality
expectations.

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

## Artifact source contract

The entry must be a readable `.jsx` or `.tsx` module with a default-exported
React component. Relative imports resolve from the entry file.

```jsx
import { Button, Card } from "antd";
import { FiDownload } from "react-icons/fi";
import icon from "./icon.png";

export const RTIFACT = {
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

The optional `RTIFACT` export sets the browser-tab title and favicon. The icon
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
export const RTIFACT = { prismTheme: "prism" };
```

Run `npx rtifact prism-themes` to discover installed Prism theme names. Unknown
names warn and fall back to `prism`.

## Output modes

### Portable HTML

The default command writes one CDN-backed compressed HTML file:

```sh
rtifact pages/Home.jsx
# Output: ./Home.html

rtifact pages/Home.jsx --output public/index.html
```

Application code, generated CSS, local assets, selected Prism modules, and
React Icons remain embedded. React, React DOM, Ant Design, and Ant Design
CSS-in-JS load from pinned esm.sh URLs.

### Offline HTML

Embed the supplied runtimes when the file must work without network access:

```sh
rtifact pages/Home.jsx --self-contained
```

### Static asset directory

Use directory output for conventional hosting, strict Content Security Policy,
or application graphs that cannot be packaged into one file:

```sh
rtifact pages/Home.jsx --out-dir dist
```

```text
dist/
├── .rtifact-output.json
├── index.html
└── assets/
    ├── index-*.css
    └── index-*.js
```

Set a hosting base path when needed:

```sh
rtifact pages/Home.jsx --out-dir public/app --base /application/
```

### Package an existing build

Package a compatible directory build into self-contained HTML without changing
the input:

```sh
rtifact pack dist --output index.html
```

> [!NOTE]
> The single-file packer rejects extra executable chunks, workers, service
> workers, runtime-loaded WASM, unresolved local files, and runtime-relative
> `fetch()` calls. Use `--out-dir dist` for those application shapes.

## Styling

Unsuffixed theme families select their light preset. Dark styling is used only
when explicitly requested:

```sh
rtifact Home.jsx --theme material       # material-light
rtifact Home.jsx --theme material-dark  # explicitly dark
```

Other aliases include `github`, `solarized`, `gruvbox`, `everforest`,
`catppuccin`, `obsidian-minimal`, `obsidian-baseline`, and `onedark`.

Select a local TypeScript or JSX theme module for a product-specific visual
system:

```sh
rtifact Home.jsx --theme ./company-theme.jsx
```

The module default export is a declarative theme manifest. Named exports remain
ordinary modules that an application can import explicitly:

```jsx
// company-theme.jsx
import { Button } from "antd";

export default {
  id: "company",
  // colors, typography, rhythm, component values, and provenance
};

export function CompanyAction({ children }) {
  return <Button type="primary">{children}</Button>;
}
```

```jsx
// Home.jsx
import { CompanyAction } from "./company-theme.jsx";

export default () => <CompanyAction>Continue</CompanyAction>;
```

The default export must include the complete theme-definition fields used by
built-in manifests. See
[`amexgbt-theme.jsx`](amexgbt-theme.jsx) for a complete JSX example with named
components. Custom theme modules do not appear in `rtifact themes`.

> [!IMPORTANT]
> Theme modules are trusted local build-time code. Selecting one compiles and
> executes its module graph before output is created.

Application JSX needs no theme provider, theme CSS import, or page-level theme
class. Let the document inherit global styling and use ordinary Ant Design
props such as `type="primary"`, `danger`, and `disabled`.

Semantic Tailwind utilities are available when a layout needs explicit styling:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`
- Text: `text-foreground`, `text-muted-foreground`
- Structure: `border-border`, `ring-ring`, `shadow-card`
- Status: `text-success`, `text-warning`, `text-danger`, `text-info`
- Typography and shape: `font-sans`, `font-mono`, `rounded-md`

### Application CSS

Import application-specific CSS through the normal JSX or TSX module graph:

```tsx
import "./styles/application.css";
```

URLs stay relative to the stylesheet. Vite emits them in directory mode and
embeds compatible local assets in packaged HTML.

The former `--css` option has been removed. Move coordinated semantic and Ant
Design values into a theme module; use ordinary CSS imports for remaining
application rules.

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

[ci-image]: https://github.com/sirawats/rtifact/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/sirawats/rtifact/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/rtifact.svg
[npm-url]: https://www.npmjs.com/package/rtifact
[downloads-image]: https://img.shields.io/npm/dm/rtifact.svg
[node-image]: https://img.shields.io/node/v/rtifact.svg
[node-url]: https://nodejs.org/
[license-image]: https://img.shields.io/npm/l/rtifact.svg
[license-url]: https://github.com/sirawats/rtifact/blob/master/LICENSE
