## Context

The current CLI builds one JSX entry through a temporary Vite workspace, stages a managed static directory, and commits that directory only after a successful build. Its output normally contains `index.html`, one or more files under `assets/`, and an ownership marker. The new mode must turn the same application into one file that opens directly without an HTTP server. A gzip stream cannot itself masquerade as local HTML, so the artifact needs a small uncompressed loader around an embedded compressed payload.

The agreed interface is:

- `yolojsx Home.jsx --single-file` → `Home.html`
- `yolojsx Home.jsx --single-file --output index.html` → `index.html`
- `yolojsx pack dist --output index.html` → `index.html`

## Goals / Non-Goals

**Goals:**

- Produce one portable HTML file containing the complete React application.
- Compress the substantial application content with gzip and decompress it in a modern browser without external libraries.
- Make direct single-file builds and packaging of compatible existing builds share one packaging pipeline.
- Preserve the current directory-build behavior and output safety guarantees.
- Fail before publishing an artifact when a resource cannot be made self-contained.

**Non-Goals:**

- Packaging arbitrary websites or multi-page Vite applications.
- Supporting browsers without the native `DecompressionStream` API.
- Supporting runtime-relative network reads, service workers, web workers, or independently loaded WASM in the initial release.
- Replacing normal HTTP gzip or Brotli delivery for hosted applications.

## Decisions

### Add explicit CLI modes

The parser will retain the existing JSX build form and add a `pack` subcommand. `--single-file` selects file output for a JSX build; `--output` is valid with `--single-file` and required with `pack`. Without `--output`, direct mode derives `<entry-basename>.html` in the invocation directory. `--out-dir` and `--base` remain directory-build options and conflict with single-file mode because a self-contained file has no deploy-time asset base.

This is preferable to a separate executable because global and `npx` users keep one discoverable command, and direct mode retains the source basename needed for default naming.

### Normalize into a constrained package payload

Both command forms will call one packager. Direct mode first creates a temporary Vite output configured for one JavaScript entry, one ordered CSS stream, disabled code splitting, and inlined build assets. `pack` reads an existing directory and accepts only the output shape the packager can normalize: one HTML entry, one executable entry bundle, local styles, and local assets whose references can be converted to data URLs. External URLs remain external only when explicitly web-hosted resources; unresolved local references, extra executable chunks, workers, WASM loaders, or runtime-relative reads cause a diagnostic.

The normalized, versioned JSON payload contains document metadata, body markup, ordered CSS, and the executable JavaScript. It contains no local filesystem references. A version field permits future loaders to reject incompatible payloads cleanly.

This constrained format is preferable to embedding a complete virtual filesystem: `file://` pages cannot rely on service workers, and blob-backed module graphs require fragile rewriting of imports and asset URLs.

### Use a native self-extracting browser bootstrap

Node's built-in gzip implementation compresses the UTF-8 payload, which is base64-encoded into the outer HTML. A small classic inline bootstrap decodes the bytes in bounded chunks, pipes them through `new DecompressionStream("gzip")`, parses the payload, installs markup and styles, and appends the application script for execution. The loader displays an actionable message when decompression is unsupported or the payload is corrupt.

The uncompressed bootstrap is unavoidable because a locally opened browser file has no HTTP `Content-Encoding` metadata. Native decompression avoids shipping a JavaScript inflate library, at the cost of limiting support to modern browsers. Base64's size overhead is accepted because it applies after gzip and enables safe text embedding.

### Treat file publication as a staged commit

Output paths resolve from the invocation directory and must end in `.html`. The CLI refuses an existing destination unless `--force` is present, always rejects a directory at the destination, and rejects a `pack` destination inside its input directory. It writes a temporary sibling file, closes it successfully, and then replaces the destination with backup/restore behavior where replacement is not natively atomic. Direct mode keeps all intermediate directory output temporary; `pack` never mutates its input.

### Test the container separately from browser smoke behavior

Unit tests will cover parsing, naming, validation, asset normalization, gzip round trips, and bootstrap escaping. Integration tests will cover both CLI forms, forced replacement, failed-build preservation, unsupported output diagnostics, and absence of external local references. The release checklist will include opening the generated example through `file://` in a supported browser because the repository does not currently carry a browser automation dependency.

## Risks / Trade-offs

- **Base64 and loader overhead reduce compression gains** → Report final file size and document that the mode targets portable/offline sharing rather than hosted delivery.
- **Large applications temporarily occupy multiple buffers during startup** → Decode in bounded chunks and document that very large media-heavy applications are outside the initial target.
- **A compatible-looking build may hide a runtime-relative fetch** → Use conservative validation and fail on recognized unsupported patterns; direct mode controls Vite output more strictly.
- **Inline code conflicts with strict Content Security Policy** → Document that the artifact is self-contained and requires inline execution; do not claim compatibility with restrictive embedding contexts.
- **Browser support excludes older clients** → Feature-detect `DecompressionStream` and render a readable error instead of failing silently.
- **Forced replacement can lose a prior file if publication is interrupted** → Stage beside the destination and use backup/restore semantics already aligned with managed-directory commits.

## Migration Plan

Ship the feature as opt-in, leaving all existing invocations unchanged. Add documentation and packed-package smoke tests before release. Rollback consists of removing the new flags and subcommand; no stored project data or existing managed directory format requires migration.

## Open Questions

None for the initial implementation. Browser polyfills, configurable compression levels, and broader arbitrary-Vite support can be proposed separately after the constrained format is proven.
