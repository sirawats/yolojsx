## Why

The default `APIDocs.html` artifact is 799,520 bytes even though its application code is small, because package aliases retain much of Ant Design's unused component graph and embed every runtime dependency. Output size is the primary contract, so the default HTML build should reuse pinned CDN runtimes while retaining an explicit offline option.

## What Changes

- Resolve supplied frontend packages through tree-shakeable ESM entry points where available while preserving one compatible React runtime.
- **BREAKING**: Make CDN-backed HTML the default file output, externalizing supported runtime packages to exact, yolojsx-controlled CDN URLs.
- Add `--self-contained` for users who need runtime dependencies embedded for offline startup.
- Keep `pack` output self-contained because it packages an existing build rather than selecting the JSX dependency graph.
- Keep application code, generated CSS, local assets, Prism language modules, and imported React Icons embedded unless they are part of the controlled CDN runtime set.
- Diagnose unsupported default-runtime imports or mappings before publishing an artifact.
- Document the new network-dependent default and the size/offline tradeoff of self-contained output.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `bundled-frontend-stack`: Require tree-shakeable supplied package resolution and define the pinned runtime graph used by CDN-backed output.
- `compressed-html-package`: Make controlled CDN runtime loading the default for direct JSX file builds while preserving explicit self-contained packaging and safe startup diagnostics.
- `jsx-app-build`: Define CDN-backed default file output and add the explicit self-contained selector.

## Impact

The change affects core dependency aliases, Vite/Rolldown build configuration, normalized single-file payload validation and bootstrap behavior, CLI defaults and help, integration tests, public specifications, README guidance, and the changelog. Existing default build commands become network-dependent at runtime. The change adds no npm dependency; CDN URLs are derived from the runtime versions already controlled by yolojsx.
