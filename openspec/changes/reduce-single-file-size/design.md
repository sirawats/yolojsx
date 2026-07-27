## Context

Single-file output already gzip-compresses the normalized payload at level 9, so wrapper or compression tuning cannot materially reduce `APIDocs.html`. Build analysis instead shows that exact aliases resolve `antd` and `@ant-design/cssinjs` through their CommonJS entries: the 1.95 MB generated script retains large unused component families and compresses to about 590 KB. Selecting their published ESM entries reduces the same script to about 235 KB gzip without changing runtime behavior.

An experimental build that externalized all top-level runtime imports reduced the embedded application and CSS to roughly 20 KB, excluding network downloads. Because output size is the higher product priority, direct JSX file builds will use the controlled CDN graph by default; users can explicitly select the larger offline artifact.

## Goals / Non-Goals

**Goals:**

- Use tree-shakeable ESM entries for supplied packages that publish them.
- Make default file output use exact CDN runtime versions and one React instance.
- Offer `--self-contained` for offline file output and keep `pack` self-contained.
- Keep every file artifact free of required neighboring local assets.
- Fail visibly when the browser cannot load or evaluate the remote runtime.
- Protect both output policies with focused size and startup regression tests.

**Non-Goals:**

- User-configurable CDN providers, package allowlists, or URL templates.
- Externalizing arbitrary user dependencies.
- Externalizing Tailwind, Vite, build plugins, generated CSS, local assets, Prism language modules, or imported React Icons.
- Making default output work offline or under a CSP that blocks its configured origin.
- Adding a service worker, runtime cache, CDN fallback, or vendored duplicate runtime.
- Guaranteeing a fixed byte size across dependency upgrades.

## Decisions

### Use published ESM entries before introducing network dependence

Core aliases will continue to resolve packages supplied by yolojsx, but packages with a published ESM build will resolve to that build rather than the CommonJS `main`. Existing deduplication for React and React DOM remains in place.

This is preferred over component-by-component Ant Design rewriting because normal named imports already describe the requested surface and the package publishes tree-shakeable modules. It also benefits directory and self-contained output without changing their interface.

### Make CDN delivery the direct file-build default

`yolojsx Home.jsx` and `yolojsx Home.jsx --output index.html` will produce CDN-backed HTML. `yolojsx Home.jsx --self-contained` will embed the controlled runtime for offline startup. `--self-contained` may be combined with `--output`, but not with `--out-dir` or `--base`.

The `pack` action remains self-contained because it normalizes an already-built directory and does not own its dependency graph. Directory output also remains locally deployable. A custom provider or directory CDN deployment can be added only when a concrete need appears.

### Externalize a fixed runtime allowlist

Default file mode will externalize only:

- `react` and the production JSX runtime subpath
- `react-dom/client`
- `antd`
- `@ant-design/cssinjs`

The generated import map will point those specifiers to exact-version `https://esm.sh/` URLs derived from the versions controlled by yolojsx. Ant Design and CSS-in-JS URLs will preserve React as an external import so every consumer resolves through the same import-map entry.

Prism and React Icons remain embedded because their selected code is small and application-specific. Build-time packages cannot reduce browser payload size by being externalized.

### Carry the import map in the normalized payload

The generated Vite input will include the controlled import map while Rolldown preserves allowlisted bare imports. The single-file normalizer will accept at most the controlled import-map shape, validate that executable imports are mapped, and store the map in a new payload version.

During startup, the bootstrap will install the import map before appending the module script. Module loading will be awaited through the script's load/error events so CDN failures replace the loading state with the existing concise error presentation.

Keeping the map as structured payload data is preferred over leaving an inert `<script type="importmap">` inside inserted HTML or rewriting imports with regular expressions.

### Test behavior and a broad regression ceiling

Tests will verify default output contains exact pinned mappings, self-contained output has no required remote runtime, both modes retain one React graph, and CDN startup reports a simulated module-load failure. A broad APIDocs size ceiling will catch accidental runtime embedding or CommonJS retention without treating minifier output as a stable API.

## Risks / Trade-offs

- **esm.sh outage, blocking, or CORS regression** → Document the default network requirement, present a startup error, and provide `--self-contained` as the offline escape hatch.
- **Provider output changes despite a pinned package version** → Pin exact package versions and keep the provider/mapping centralized and covered by packaged-artifact tests.
- **Duplicate React instances through a remote dependency** → Externalize React from remote Ant Design/CSS-in-JS bundles and resolve all React specifiers through one import map.
- **Browser lacks import-map support** → Detect support before loading the application and show a compatibility error.
- **CSP rejects remote modules or inline bootstrap code** → Document directory output as the strict-CSP path; do not add CSP workarounds.
- **A dependency upgrade grows output past the regression ceiling** → Review the graph and deliberately adjust the ceiling only with dependency evidence.

## Migration Plan

1. Switch eligible aliases to ESM entries and verify self-contained and directory builds.
2. Make CDN externalization the direct file-build default, then add the import-map payload, bootstrap loading behavior, and `--self-contained` selection.
3. Update specifications, README/help text, changelog, and package verification.
4. Run the APIDocs size regression and the full `npm run verify` gate.

This intentionally changes the runtime behavior of existing default commands. Rollback can restore self-contained file builds as the default while retaining the independent ESM alias improvement.

## Open Questions

None for the initial implementation.
