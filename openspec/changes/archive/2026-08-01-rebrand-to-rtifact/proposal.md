## Why

The `yolojsx` name collides with the widely used YOLO computer-vision term, making the package difficult to discover and obscuring its actual purpose. Rebranding to **Rtifact** gives the product a distinctive React-derived name while making portable, interactive HTML artifacts its central promise.

## What Changes

- **BREAKING**: Rename the npm package, executable, public commands, plugin identities, skills, repository references, and active product identifiers from `yolojsx` to `rtifact`/Rtifact without retaining an old executable alias.
- **BREAKING**: Rename the optional JSX metadata export from `YOLOJSX` to `RTIFACT` and update all examples and diagnostics.
- **BREAKING**: Rename generated ownership markers, temporary paths, runtime identifiers, and package-owned internal symbols to Rtifact forms. Existing old-name output directories remain protected by the normal unowned-output confirmation and `--force` rules.
- Replace the YOLO/Chihuahua visual identity with a simple Rtifact identity and rename skill, plugin, and OpenCode paths that contain the old brand.
- Make “portable, interactive HTML artifact” the lead value proposition throughout the README, website, product documentation, plugin descriptions, and both official skills. Explain that agents author compact JSX and Rtifact produces the finished shareable artifact.
- Update active OpenSpec requirements, tests, fixtures, package verification, maintenance guidance, release metadata, notices, and changelog. Preserve completed OpenSpec archives as historical records.

## Capabilities

### New Capabilities

- `product-identity`: Defines the Rtifact brand, package and integration identifiers, artifact-first positioning, and active-surface consistency requirements.

### Modified Capabilities

- `jsx-app-build`: Rename the executable, CLI examples, default document identity, and optional JSX metadata export to Rtifact.
- `bundled-frontend-stack`: Rename the supplied-stack owner and Prism theme metadata contract to Rtifact.
- `safe-build-output`: Rename CLI examples and generated ownership markers while preserving safeguards for directories bearing the old marker.
- `global-theme-styling`: Rename theme authorship, provenance, package-owned styling vocabulary, and theme discovery commands.

## Impact

The change affects package metadata and lockfile data; CLI source and diagnostics; generated HTML and runtime identifiers; filesystem markers and temporary names; themes and notices; examples; unit and integration tests; package/release scripts; README, website, contributor and maintainer documentation; Codex, Claude, Gemini, OpenCode, and universal-agent plugin manifests; official authoring and theme skills; active OpenSpec specifications; repository and package URLs; and the existing brand asset. Publishing requires a new `rtifact` npm package and coordinated repository, Pages, plugin, and skill listing updates outside the codebase.
