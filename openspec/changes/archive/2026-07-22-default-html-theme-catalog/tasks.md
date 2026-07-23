## 1. Theme Model and Provenance

- [x] 1.1 Add a validated semantic theme-manifest schema covering canonical ids, aliases, fixed light/dark modes, semantic visual tokens, Ant Design configuration, and pinned provenance metadata.
- [x] 1.2 Add a registry and resolver for fixed presets, unsuffixed light-family aliases, the `onedark` alias, default selection, and actionable unknown-theme errors.
- [x] 1.3 Audit the proposed inspiration sources, licenses, attribution requirements, and names; record approved pinned revisions and add `THIRD_PARTY_NOTICES.md` plus non-endorsement language.
- [x] 1.4 Add automated manifest completeness, duplicate-id/alias, fixed-appearance, color-format, light-alias, and required-notice validation.
- [x] 1.5 Add contrast checks for primary and muted text, controls, focus indicators, selection, and status-color pairs, adjusting yolojsx mappings that fail.

## 2. Original Built-in Theme Catalog

- [x] 2.1 Author original yolojsx semantic mappings for `default`, GitHub light/dark/dimmed, Material light/dark, and One Dark without copying or transforming upstream CSS.
- [x] 2.2 Author original yolojsx semantic mappings for Solarized, Gruvbox, and Everforest light/dark variants without copying or transforming upstream CSS.
- [x] 2.3 Author original yolojsx semantic mappings for Catppuccin Latte, Frappé, Macchiato, and Mocha without copying or transforming upstream CSS.
- [x] 2.4 Analyze Obsidian Minimal and Baseline only for visual principles, then author original yolojsx-specific light/dark semantic mappings with no Obsidian selectors or stylesheet content.
- [x] 2.5 Define and verify unsuffixed family aliases to canonical light presets, including Catppuccin to Latte, while keeping dark, dimmed, and intermediate flavors explicit.

## 3. Tailwind and Custom CSS Composition

- [x] 3.1 Store one original yolojsx stylesheet per selectable theme plus a shared semantic foundation, including document color scheme, Tailwind v4 `@theme` values, and global base/component rules.
- [x] 3.2 Refactor the controlled stylesheet entry to declare `theme`, `base`, `antd`, `components`, and `utilities` order and compose Tailwind, preset, custom CSS, and source discovery in valid import order.
- [x] 3.3 Add custom CSS path validation and pass the canonical stylesheet path through both output modes without modifying the input tree.
- [x] 3.4 Verify custom CSS override ordering, supported Tailwind v4 CSS-first directives, and file-relative local font/image resolution in directory and packaged HTML output.

## 4. Ant Design Theme Runtime

- [x] 4.1 Add the directly declared CSS-in-JS dependency and package-owned `StyleProvider layer` plus `ConfigProvider` mount boundary while preserving one React/Ant Design graph.
- [x] 4.2 Map every semantic preset into Ant Design light or dark algorithms and seed/alias tokens that coordinate with its generated global CSS.
- [x] 4.3 Remove implicit system-color switching and unit-test that family aliases apply fixed light CSS and Ant Design configuration.
- [x] 4.4 Add integration coverage proving Tailwind utilities, Ant Design semantic slots, Preflight, and custom overrides follow the documented cascade without importing Ant Design reset CSS.

## 5. CLI and Output-Mode Migration

- [x] 5.1 Extend argument parsing and usage text with `themes`, `--theme`, and `--css`, including their action restrictions, duplicate handling, values, aliases, and errors.
- [x] 5.2 Refactor JSX output-mode parsing so file mode is the default, `--output` works directly, explicit `--out-dir` selects directory mode, and `--base` requires directory mode.
- [x] 5.3 Preserve `--single-file` as a deprecated file-mode alias with a warning and retain conflict validation against directory-only options.
- [x] 5.4 Route default and explicit file builds through existing file validation, confirmation, staging, and atomic publication while retaining all explicit directory ownership safeguards.
- [x] 5.5 Add the `yolojsx themes` renderer with ids, fixed modes, light aliases, descriptions, and provenance, and direct unknown-theme diagnostics to it.
- [x] 5.6 Enhance default packaging errors to preserve the incompatible-feature detail and recommend `--out-dir dist` without changing packager validation.

## 6. Automated Verification

- [x] 6.1 Update argument and path unit tests for the new default, explicit directory intent, direct `--output`, deprecated alias, themes action, theme values, custom CSS, and conflicting options.
- [x] 6.2 Convert existing integration fixtures that require directory output to pass `--out-dir dist`, and add default `<EntryName>.html` success and overwrite-safety coverage.
- [x] 6.3 Add table-driven builds for every fixed preset and verify light-family aliases using representative global HTML, Tailwind utilities, and Ant Design components.
- [x] 6.4 Add equivalence tests showing the same preset and custom stylesheet semantics in default HTML and explicit directory outputs, including embedded local CSS assets.
- [x] 6.5 Add tests proving the packaged npm artifact contains original yolojsx manifests, stored theme stylesheets, templates, and required notices but no vendored upstream or Obsidian theme CSS.
- [x] 6.6 Measure and record the default artifact-size effect of the provider boundary and ensure package verification still exercises global-bin and `npx`-equivalent layouts.

## 7. Documentation and Release Readiness

- [x] 7.1 Update README usage, examples, output trees, option compatibility, CSP/resource limitations, the `--out-dir dist` migration, and the full theme/custom-CSS workflow.
- [x] 7.2 Document the semantic cascade and custom CSS extension contract, clarify that named themes are inspired adaptations rather than component-library replacements, and link notices and non-endorsement text.
- [x] 7.3 Update package contents, release checks, examples, and release notes for the breaking default and newly shipped theme assets.
- [x] 7.4 Run `npm run verify`, inspect the packed artifact, and resolve every license, notice, naming, accessibility, and verification gate before release.
