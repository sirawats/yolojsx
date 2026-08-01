# Rtifact CLI and artifact output modes

## Invocation

Check whether `rtifact` is available on `PATH` first. This finds a global
installation when present; otherwise run the package through `npx`:

```sh
if command -v rtifact >/dev/null 2>&1; then
  rtifact Report.jsx
else
  npx rtifact Report.jsx
fi
```

Apply the same choice to the commands below: use `rtifact ...` when the check
succeeds and `npx rtifact ...` when it does not.

## Output modes

### Compact CDN-backed HTML: default

```sh
rtifact Report.jsx
# ./Report.html

rtifact Report.jsx --output deliverables/index.html
```

The finished artifact is one HTML file containing a base64-encoded gzip application
payload. A browser with `DecompressionStream("gzip")` and import-map support
restores it, including through `file://`; no neighboring local assets or server
are required. React and Ant Design runtime modules load from exact-version
esm.sh URLs, so the default requires network access.

Choose this mode for the smallest shareable reports, guides, demos,
comparisons, and small tools.

### Self-contained HTML

```sh
rtifact Report.jsx --self-contained
rtifact Report.jsx --self-contained --output deliverables/index.html
```

Choose this mode when the artifact must start offline. It embeds the supplied
runtime and is therefore substantially larger.

### Deployable directory

```sh
rtifact Report.jsx --out-dir dist
rtifact Report.jsx --out-dir public/app --base /application/
```

Choose directory mode for conventional static hosting, strict Content Security
Policy, or application graphs the single-file packer cannot normalize.

### Pack an existing build

```sh
rtifact pack dist --output Report.html
```

Packing reads a compatible directory build without modifying it and produces a
self-contained artifact.

## Themes and theme modules

```sh
rtifact themes
rtifact prism-themes
rtifact Report.jsx --theme material
rtifact Report.jsx --theme material-dark
rtifact Report.jsx --theme ./company-theme.jsx
```

Unsuffixed family aliases resolve to fixed light presets; dark mode is selected
only by naming a dark preset. `prism-themes` lists syntax themes discovered from
the installed PrismJS and Prism Themes packages.

`--theme` also accepts a readable local `.ts` or `.jsx` module resolved from the
invocation directory. Its default export is the complete declarative theme
manifest. Applications import named exports, including reusable components,
normally; Rtifact does not inject them. Theme modules are trusted local code
compiled and executed before output is created. They apply to JSX builds, not
discovery or `pack` commands, and do not appear in `rtifact themes`.

Import application-specific CSS from the JSX or TSX entry:

```tsx
import "./styles/report.css";
```

Vite preserves stylesheet-relative assets. There is no `--css` option or
privileged post-theme CSS slot.

## Option constraints

- `--output` names the single HTML destination.
- `--out-dir` selects directory mode and conflicts with `--output`.
- `--base` requires `--out-dir`.
- `--self-contained` embeds runtime dependencies and conflicts with directory
  mode; `pack` is already self-contained.
- `--single-file` is a deprecated alias for the default mode.
- `--force` replaces an existing protected output; use it only after confirming
  the exact target may be replaced.

The CLI rejects unsafe output paths and stages publication so a failed rebuild
preserves the last successful artifact.

## Single-file compatibility

Use `--out-dir dist` when an application requires:

- extra executable chunks or unsupported dynamic imports;
- workers or service workers;
- runtime-loaded WASM;
- unresolved required local files;
- runtime-relative `fetch()` calls;
- strict CSP that rejects inline scripts or styles.

Default files require network access to esm.sh. Both file modes execute inline
code and styles. Compression is packaging, not a security boundary. Never
embed secrets.

## Verification

Run the smallest build matching the requested deliverable. Treat a successful
build as the minimum check, then inspect the artifact in a supported browser
when visual fidelity or interaction matters.

The compact default loads exact-version runtimes from esm.sh. If it renders
blank in an offline or network-restricted browser, check runtime requests before
blaming the application. Use a temporary `--self-contained` build for offline
inspection, but keep the user's requested output mode for the deliverable. If no
browser tooling is available, verify the build and interaction paths from source,
state the limitation, and do not claim visual correctness.

When a build fails:

1. Read the originating source path and diagnostic.
2. Fix JSX syntax, missing default export, missing bare dependency, or the
   incompatible application shape at its source.
3. Retry the same command.
4. Switch to directory mode only when the application genuinely requires it.
