# yolojsx CLI and output modes

## Invocation

Use an installed CLI when available:

```sh
yolojsx Report.jsx
```

Use `npx yolojsx Report.jsx` when the package is not installed and package
execution is allowed.

## Output modes

### Portable HTML: default

```sh
yolojsx Report.jsx
# ./Report.html

yolojsx Report.jsx --output deliverables/index.html
```

The result is one HTML file containing a base64-encoded gzip application payload.
A browser with `DecompressionStream("gzip")` restores it, including through
`file://`; no neighboring local assets or server are required.

Choose this mode for shareable reports, guides, demos, comparisons, and small
tools. Remote URLs and intentional absolute API calls can still require a
network connection.

### Deployable directory

```sh
yolojsx Report.jsx --out-dir dist
yolojsx Report.jsx --out-dir public/app --base /application/
```

Choose directory mode for conventional static hosting, strict Content Security
Policy, or application graphs the single-file packer cannot normalize.

### Pack an existing build

```sh
yolojsx pack dist --output Report.html
```

Packing reads a compatible directory build without modifying it.

## Themes and CSS

```sh
yolojsx themes
yolojsx Report.jsx --theme material
yolojsx Report.jsx --theme material-dark
yolojsx Report.jsx --theme github --css styles/report.css
```

Unsuffixed family aliases resolve to fixed light presets; dark mode is selected
only by naming a dark preset. Theme and CSS options apply to JSX builds, not
`pack` or `themes`.

## Option constraints

- `--output` names the single HTML destination.
- `--out-dir` selects directory mode and conflicts with `--output`.
- `--base` requires `--out-dir`.
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

Compression is packaging, not a security boundary. Never embed secrets.

## Verification

Run the smallest build matching the requested deliverable. Treat a successful
build as the minimum check, then inspect the artifact in a supported browser
when visual fidelity or interaction matters.

When a build fails:

1. Read the originating source path and diagnostic.
2. Fix JSX syntax, missing default export, missing bare dependency, or the
   incompatible application shape at its source.
3. Retry the same command.
4. Switch to directory mode only when the application genuinely requires it.
