## 1. CLI Contract and Path Resolution

- [x] 1.1 Extend argument parsing with the `pack` action, `--single-file`, `--output`, and their documented defaults.
- [x] 1.2 Reject missing pack inputs, missing pack outputs, and conflicting directory-build and single-file options with actionable usage text.
- [x] 1.3 Add input-directory and HTML destination resolvers, including entry-basename default naming and realpath-aware containment checks.
- [x] 1.4 Add unit tests for every new invocation form, default name, explicit destination, invalid extension, and option conflict.

## 2. Controlled Single-File Build Output

- [x] 2.1 Refactor build orchestration so a Vite build can remain temporary for packaging without changing the existing staged directory commit path.
- [x] 2.2 Add a controlled packaging build configuration that disables code splitting, emits one executable entry, preserves CSS order, and inlines build assets.
- [x] 2.3 Connect direct `--single-file` builds to the temporary output and guarantee cleanup after successful and failed compilation.
- [x] 2.4 Add regression tests proving ordinary `yolojsx Home.jsx`, custom `--out-dir`, and `--base` directory builds remain unchanged.

## 3. Build Normalization and Compatibility Validation

- [x] 3.1 Implement a packager that reads a compatible directory's `index.html` and resolves its local entry script and stylesheet references within the input root.
- [x] 3.2 Normalize document metadata, body markup, ordered CSS, JavaScript, and converted local asset data URLs into a versioned payload.
- [x] 3.3 Detect unresolved local references, extra executable chunks, workers, runtime-loaded WASM, and other unsupported resource shapes before output publication.
- [x] 3.4 Produce clear diagnostics for missing HTML, unreadable files, root escapes, external-entry scripts, and unsupported resource graphs.
- [x] 3.5 Add unit fixtures covering compatible output, binary assets, CSS URLs, invalid references, multiple chunks, and unsupported runtime resources.

## 4. Gzip Container and Browser Bootstrap

- [x] 4.1 Serialize the normalized payload deterministically, gzip it with Node.js built-ins, and encode the compressed bytes safely for HTML embedding.
- [x] 4.2 Generate a standalone HTML bootstrap that chunk-decodes base64, uses `DecompressionStream("gzip")`, verifies the payload version, and starts the application in the required markup/style/script order.
- [x] 4.3 Add bootstrap error rendering for unsupported browsers and corrupt, undecodable, or incompatible payloads.
- [x] 4.4 Harden template interpolation so payload data cannot terminate its containing HTML element or alter the bootstrap source.
- [x] 4.5 Add round-trip tests that extract and gunzip the embedded payload, verify the absence of required neighboring references, and exercise bootstrap failure paths.

## 5. Safe File Publication and CLI Integration

- [x] 5.1 Implement single-file destination inspection that refuses existing files without `--force` and always refuses directory destinations.
- [x] 5.2 Implement sibling-file staging and backup/restore replacement so failed builds and packs preserve the previous destination and leave no temporary artifacts.
- [x] 5.3 Ensure `pack` reads its source tree without mutation and rejects destinations located within that tree even with `--force`.
- [x] 5.4 Route direct single-file and `pack` actions through the shared packager and report the resolved artifact path and final byte size.
- [x] 5.5 Add integration tests for default `Home.html`, explicit `index.html`, existing-directory packing, forced replacement, failure preservation, input immutability, and cleanup.

## 6. Documentation and Release Verification

- [x] 6.1 Document all three agreed commands, browser requirements, compression behavior, security/CSP constraints, and unsupported runtime resource types in `README.md`.
- [x] 6.2 Extend `RELEASING.md` with direct and `pack` smoke tests, including opening the generated example through `file://` in a supported browser.
- [x] 6.3 Run unit and integration suites, syntax checks, and `npm run pack:check`, then confirm the npm tarball contains every new runtime module.
- [x] 6.4 Install the packed tarball in isolation and verify directory output, both single-file naming forms, and `yolojsx pack dist --output index.html`.
