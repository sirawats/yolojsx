## Why

`yolo-jsx` currently produces a directory that must be kept intact and served as multiple files. Users also need a portable artifact that can be shared and opened as one HTML file while retaining compression benefits without requiring a server.

## What Changes

- Add `--single-file` build mode, which packages the application into one self-extracting HTML file instead of retaining a `dist/` directory.
- Derive the default artifact name from the JSX entry (`Home.jsx` becomes `Home.html`) and add `--output <file>` for an explicit destination.
- Add `yolojsx pack <directory> --output <file>` to package an existing compatible static build.
- Embed a gzip-compressed application payload and a small browser bootstrap that decompresses and starts the application with the native `DecompressionStream` API.
- Validate package compatibility and reject resources that cannot run from the self-contained artifact rather than producing a broken file.
- Prompt for typed `yes` or `no` before replacing any existing directory or HTML target, while retaining `--force` as the explicit non-interactive bypass.
- Protect existing destination files, write artifacts atomically, and preserve input build directories.
- Keep the existing `yolojsx Home.jsx` directory output shape and options unchanged apart from overwrite confirmation.

## Capabilities

### New Capabilities

- `compressed-html-package`: Defines creation, format, browser loading, compatibility validation, and diagnostics for a gzip-backed self-contained HTML artifact.

### Modified Capabilities

- `jsx-app-build`: Adds the `--single-file`, `--output`, and `pack` invocation forms while preserving the existing directory build.
- `safe-build-output`: Extends output safety to single HTML files, including overwrite consent, dangerous path checks, atomic replacement, and read-only pack inputs.

## Impact

The CLI parser, help text, build orchestration, templates, output validation, integration tests, and local verification scripts will change. New packaging modules will read generated assets, create a normalized payload, compress it with Node.js built-ins, and generate the browser bootstrap. Documentation and release smoke checks will gain both direct single-file and existing-directory pack examples. No new runtime dependency is expected because Node provides gzip compression and supported browsers provide decompression.
