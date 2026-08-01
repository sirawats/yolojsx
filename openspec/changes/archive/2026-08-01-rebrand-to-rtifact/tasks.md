## 1. Rename Product Contracts and Paths

- [x] 1.1 Use `git mv` to rename tracked skill and OpenCode paths from the old brand to `rtifact`, remove the Chihuahua brand asset, and update tests that resolve those paths.
- [x] 1.2 Rename the npm package and executable, lockfile metadata, repository URLs, plugin and marketplace identifiers, Gemini extension identity, and package-verification executable paths to `rtifact`.
- [x] 1.3 Rename public and internal code identifiers to the canonical casing map, including `RTIFACT` metadata, `RtifactError`, virtual modules, generated DOM/data identifiers, temporary paths, payload identifiers, and default titles.

## 2. Preserve Runtime and Filesystem Behavior

- [x] 2.1 Update CLI usage, diagnostics, theme discovery, generated HTML, pack/unpack handling, and theme provenance under the Rtifact identity without changing supported options or output modes.
- [x] 2.2 Change new directory ownership to `.rtifact-output.json` and add focused coverage proving old-marker directories follow the existing safe unowned-output confirmation or `--force` path.
- [x] 2.3 Update unit and integration fixtures and assertions for the renamed executable, metadata export, generated identifiers, temporary paths, themes, package contents, and plugin registrations.

## 3. Make Artifact the Product Message

- [x] 3.1 Rewrite the README and website introduction, workflow, examples, commands, links, metadata, and brand presentation around “Rtifact turns agent-authored JSX into portable, interactive HTML artifacts,” with the default single-file artifact first.
- [x] 3.2 Rename both official skill directories and metadata, then revise their explanations and references so artifact audience, purpose, rendered quality, output modes, and verification are the organizing model.
- [x] 3.3 Update canonical examples and copy the complete example catalog into the renamed primary skill so both directories remain exact mirrors.
- [x] 3.4 Update active product, contributor, maintainer, release, support, conduct, issue-template, notice, and changelog documentation while preserving completed OpenSpec archives.
- [x] 3.5 Update all active main OpenSpec specs to Rtifact terminology and add the new product-identity specification without editing historical change archives.

## 4. Verify the Coordinated Rebrand

- [x] 4.1 Run formatting, type, unit, integration, package, and plugin checks relevant to the renamed surfaces and fix failures at their shared source.
- [x] 4.2 Use `rg` to verify no old YOLO-derived brand text or name-bearing path remains outside OpenSpec change records and no stale Rtifact casing variant was introduced.
- [x] 4.3 Run `npm run verify` and confirm the packed artifact exposes only the `rtifact` executable and renamed consumer-facing skills, examples, documentation, and notices.
- [x] 4.4 Confirm release guidance identifies the external npm, GitHub, Pages, skill, and marketplace rename/publication steps without attempting those account-level mutations during repository implementation.
