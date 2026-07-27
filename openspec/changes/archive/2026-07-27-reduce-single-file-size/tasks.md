## 1. Tree-shakeable supplied stack

- [x] 1.1 Resolve Ant Design and CSS-in-JS through their published ESM entries while preserving existing exact aliases and React deduplication.
- [x] 1.2 Add focused build coverage proving unused Ant Design component families are excluded and default file/directory behavior remains equivalent.
- [x] 1.3 Add a broad self-contained APIDocs size regression ceiling that catches restoration of the CommonJS graph.

## 2. Default CDN build policy

- [x] 2.1 Add `--self-contained` parsing, help text, and validation for direct file builds, including conflicts with directory options and `pack`.
- [x] 2.2 Define the minimal exact-version esm.sh import map for React, the JSX runtime, React DOM client, Ant Design, and CSS-in-JS without adding a dependency.
- [x] 2.3 Make direct file builds preserve only mapped runtime imports by default while `--self-contained`, `pack`, and directory output retain their local-runtime behavior.

## 3. CDN package startup and safety

- [x] 3.1 Extend normalized payload packaging and its version to extract, validate, and store the controlled import map for default builds while rejecting unmapped executable imports.
- [x] 3.2 Install the import map before the application module and report unsupported import maps or module load failures through the existing bootstrap error UI.
- [x] 3.3 Add unit and integration coverage for pinned mappings, one React graph, default CDN output, explicit self-containment, `file://` startup behavior, validation failures, and simulated CDN loading errors.

## 4. Documentation and verification

- [x] 4.1 Document the CDN-backed default, `--self-contained`, network/cache/CSP tradeoffs, the breaking runtime change, and measured APIDocs size improvement in README/help and the Unreleased changelog.
- [x] 4.2 Exercise default, self-contained, `pack`, and directory builds through packaged-artifact verification, then run `npm run verify`.
