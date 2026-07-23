# yolojsx

Build one JSX component into a portable compressed HTML application—without
setting up a frontend project first.

`yolojsx` supplies React, Vite, Tailwind CSS, Ant Design, and an original global
theme catalog. A normal invocation writes one `<EntryName>.html` file that can
open directly; directory output remains available explicitly.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- A readable `.jsx` module that default-exports a React component

## Install and run

```sh
npm install --global yolojsx
yolojsx Home.jsx
# ./Home.html
```

Or use an npm-exec installation:

```sh
npx yolojsx Home.jsx
```

The package installs the `yolojsx` executable.

The default artifact contains a small loader and a base64-encoded gzip payload.
A modern browser restores it with `DecompressionStream("gzip")`, including when
opened through `file://`; no adjacent asset directory or server is required.

## Component contract

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

Relative imports remain relative to the entry. Other bare packages resolve from
the input project's `node_modules`. The CLI supplies and deduplicates React,
React DOM, Ant Design, and Tailwind build support; `@ant-design/icons` is not part
of the guaranteed stack.

## Output modes

One HTML file is the default:

```sh
yolojsx pages/Home.jsx
# ./Home.html

yolojsx pages/Home.jsx --output public/index.html
```

Use `--out-dir` when you need ordinary deployable assets, strict CSP compatibility,
or an application graph the single-file packer cannot normalize:

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

`--base` is directory-only:

```sh
yolojsx pages/Home.jsx --out-dir public/app --base /application/
```

Migration from versions that created `dist/` by default is therefore simply:

```sh
yolojsx Home.jsx --out-dir dist
```

`--single-file` is accepted as a deprecated no-op compatibility alias and emits
a warning. `pack` can still package an existing compatible build without changing
its input:

```sh
yolojsx pack dist --output index.html
```

The packer rejects extra executable chunks, workers, service workers, runtime-loaded
WASM, unresolved local files, and runtime-relative `fetch()` calls. When a default
file build encounters one of those shapes, use `--out-dir dist`.

## Themes

Theme selection is deterministic. Unsuffixed family names are convenient aliases
for their light preset; dark styling is used only when a dark preset is named
explicitly:

```sh
yolojsx Home.jsx --theme material       # material-light
yolojsx Home.jsx --theme material-dark  # explicitly dark
yolojsx themes
# or: yolojsx --themes
```

Fixed presets:

- `default`
- `github-light` (alias: `github`), `github-dark`, `github-dark-dimmed`
- `material-light` (alias: `material`), `material-dark`
- `one-dark` (alias: `onedark`)
- `solarized-light` (alias: `solarized`), `solarized-dark`
- `gruvbox-light` (alias: `gruvbox`), `gruvbox-dark`
- `everforest-light` (alias: `everforest`), `everforest-dark`
- `catppuccin-latte` (alias: `catppuccin`), `catppuccin-frappe`, `catppuccin-macchiato`, `catppuccin-mocha`
- `obsidian-minimal-light` (alias: `obsidian-minimal`), `obsidian-minimal-dark`
- `obsidian-baseline-light` (alias: `obsidian-baseline`), `obsidian-baseline-dark`

Themes never switch in response to the operating-system color preference. This
keeps generated output visually stable across machines and viewing environments.

Themes affect more than color: their checked-in CSS defines typography fallbacks,
reading rhythm, heading weight and tracking, control density, radii, shadows,
surface hierarchy, selection, focus, code, links, and native controls. The same
semantic mapping configures the matching fixed Ant Design algorithm plus official
global and component tokens for Button, Card, Input, Layout, Menu, Segmented,
Tabs, and Typography. Component spacing, elevation, typography, and interaction
details therefore change with the selected visual family—not only its palette.

Application JSX does not need a theme provider, a CSS import, or page-level theme
classes. The generated application supplies Ant Design's `ConfigProvider`, while
native document elements inherit the selected background, text, typography,
focus, selection, link, and code styles automatically. Prefer ordinary Ant Design
props such as `type="primary"`, `danger`, `disabled`, and
`Typography.Text type="secondary"` for component meaning.

These are original yolojsx adaptations, not exact reproductions or replacements
for the referenced component libraries and products. No upstream or Obsidian CSS
is bundled. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for reviewed
sources, pinned revisions, licenses, and the non-endorsement notice.

## Custom CSS

Load a readable local `.css` file after the selected preset:

```sh
yolojsx Home.jsx --theme material --css styles/application.css
```

It participates in the same Tailwind v4 CSS-first graph, so supported directives
such as `@theme`, `@utility`, and cascade layers work without a user Vite or
Tailwind configuration:

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

URLs remain relative to the custom stylesheet. Vite emits them for directory
builds and embeds compatible local assets in packaged HTML.

The stable cascade is `theme, base, antd, components, utilities`. Tailwind
Preflight is the only reset; Ant Design reset CSS is not imported. Stored theme
files live in `src/themes/`, import the shared `foundation.css`, and are compiled
before custom CSS. Custom CSS can override semantic variables and rules, but it
does not rewrite the generated Ant Design token object; wrap user code in another
`ConfigProvider` when application-specific Ant configuration is needed.

The CLI exposes conventional semantic Tailwind names for the places where an
application genuinely needs explicit styling:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`
- Text: `text-foreground`, `text-muted-foreground`,
  `text-primary-foreground`
- Structure and focus: `border-border`, `ring-ring`, `shadow-card`
- Accent and code: `bg-primary`, `text-primary`, `bg-code`
- Status: `text-success`, `text-warning`, `text-danger`, `text-info`, with
  matching `*-background` colors
- Typography and shape: `font-sans`, `font-mono`, `rounded-sm`, `rounded-md`,
  `rounded-lg`

These utilities are escape hatches for custom layouts, not required theme
plumbing. Let the document inherit its theme and let Ant Design style its own
components whenever possible.

### Migration from branded theme classes

The former package-specific styling vocabulary is removed. Migrate authoring
code as follows:

| Legacy authoring | Preferred replacement |
| --- | --- |
| `bg-yolo-canvas`, `text-yolo-text` | Usually remove them; use `bg-background` or `text-foreground` only for an explicit nested region |
| `bg-yolo-surface`, `yolo-surface` | Use an Ant Design `Card`, or `bg-card border-border shadow-card` for a custom surface |
| `text-yolo-text-muted`, `yolo-muted` | Use `Typography.Text type="secondary"` or `text-muted-foreground` |
| `border-yolo-border` | `border-border` |
| `bg-yolo-primary`, `text-yolo-primary`, `text-yolo-primary-text` | Use Ant Design's `type="primary"` where applicable, or `bg-primary`, `text-primary`, and `text-primary-foreground` |
| `bg-yolo-code` | Let native `pre` and `code` inherit their styling, or use `bg-code` |
| `text-yolo-success`, `text-yolo-warning`, `text-yolo-danger`, `text-yolo-info` | Prefer the matching Ant Design status prop; otherwise use `text-success`, `text-warning`, `text-danger`, or `text-info` |
| `font-yolo-body`, `font-yolo-code` | Usually remove them; use `font-sans` or `font-mono` when explicit |
| `rounded-yolo-*`, `shadow-yolo-card` | `rounded-sm`, `rounded-md`, `rounded-lg`, or `shadow-card` |
| `yolo-reading` | Use ordinary layout utilities such as `mx-auto max-w-3xl` |

Use `--css` for deliberate application-wide stylesheet extensions; do not import
theme CSS from JSX. Built-in Ant Design styling is generated from supported
official tokens rather than `.ant-*` selector patches.

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

`--output` and `--out-dir` conflict. `--base` requires `--out-dir`. Theme and CSS
options apply to JSX builds, not `pack`, `themes`, or `--themes`.

## Safe output replacement

Existing HTML files and output directories require confirmation. In a
non-interactive session the CLI refuses replacement and directs automation to
use `--force`. Symbolic-link outputs, filesystem roots, the current directory,
directory outputs containing the source entry, and `pack` destinations inside
their input are rejected.

Directory output uses `.yolojsx-output.json` ownership markers. Both modes stage
publication so a failed rebuild preserves the last successful result. Custom CSS
and JSX inputs are treated as read-only trusted local code.

## Browser and security notes

Single-file output requires native gzip `DecompressionStream`. Its loader and
restored application execute inline scripts and styles, so it is not suitable for
a strict Content Security Policy that disallows inline code. Use directory mode
for stricter hosting policies. Compression is not a security boundary.

Current limitations include JSX-only input, one page per invocation, no dev
server/watch/SSR, no user Vite or HTML configuration, no automatic `public/`
copying, and the single-file graph limitations described above.

## Development

```sh
npm install
npm run verify
```

The repository includes a varied example gallery:

| Example | Suggested theme | Demonstrates |
| --- | --- | --- |
| [Home.jsx](examples/Home.jsx) | `default` | Compact Tailwind and Ant Design starter |
| [Techspec.jsx](examples/Techspec.jsx) | `github` | Technical RFC, requirements, architecture, rollout |
| [APIDocs.jsx](examples/APIDocs.jsx) | `github-dark` | Interactive endpoint reference and code samples |
| [CalculatorDemo.jsx](examples/CalculatorDemo.jsx) | `material` | Stateful unit-economics calculator |
| [SaaS.jsx](examples/SaaS.jsx) | `catppuccin` | Marketing, product preview, and responsive pricing |
| [Analytics.jsx](examples/Analytics.jsx) | `one-dark` | Dense operational metrics and service health |
| [Editorial.jsx](examples/Editorial.jsx) | `obsidian-minimal` | Long-form reading and typographic rhythm |

For example:

```sh
node bin/yolojsx.js examples/APIDocs.jsx --theme github-dark
node bin/yolojsx.js examples/CalculatorDemo.jsx --theme material
```

`npm run verify` runs unit and integration coverage, syntax checks,
package-content inspection, and a smoke test against the extracted npm artifact,
including theme assets and the default artifact-size budget. See
[RELEASING.md](RELEASING.md). First-time npm maintainers can follow
[NPM_PUBLISHING_GUIDE.md](NPM_PUBLISHING_GUIDE.md), which separates safe dry
runs from the live publication command.

## Contributing and support

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and pull-request guidance
and [SUPPORT.md](SUPPORT.md) for usage help. Community participation follows
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Report vulnerabilities privately using
[SECURITY.md](SECURITY.md).

## License

MIT
