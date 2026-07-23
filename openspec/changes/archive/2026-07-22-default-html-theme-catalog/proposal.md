## Why

`yolojsx` currently defaults to a multi-file `dist/` build even though its most convenient sharing format is the existing portable HTML artifact. It also supplies Tailwind CSS and Ant Design without a coherent way to select recognizable global visual themes or layer user-authored CSS over them.

## What Changes

- **BREAKING** Make a compressed, self-contained `<EntryName>.html` artifact the default result of `yolojsx <entry.jsx>`.
- Keep production directory builds available explicitly through `--out-dir <path>`; require directory mode for `--base`, and retain `--single-file` temporarily as a deprecated compatibility alias.
- Allow `--output <file.html>` directly in the default file mode while continuing to protect existing files through confirmation or `--force`.
- Add `--theme <preset>` for coordinated Tailwind/global CSS and Ant Design theming, and add `--css <file.css>` for optional user-authored overrides that can be combined with a preset.
- Add a discoverable `yolojsx themes` command that lists preset ids, modes, descriptions, and upstream inspiration/attribution.
- Ship an initial catalog covering `default`, GitHub light/dark/dimmed, Material light/dark, One Dark, Solarized light/dark, Gruvbox light/dark, Everforest light/dark, the four Catppuccin flavors, and Obsidian Minimal/Baseline light/dark adaptations.
- Make unsuffixed family names aliases of their canonical light presets; require an explicit dark preset id for dark output and never switch from operating-system color preference.
- Define every preset as an original yolojsx semantic-token mapping that feeds Tailwind v4 CSS-first theme variables, global element styles, and Ant Design theme tokens/algorithms.
- Prohibit copying, vendoring, or mechanically transforming upstream or Obsidian theme CSS. Upstream themes may be analyzed only as visual inspiration and palette references; resulting CSS must be authored specifically for yolojsx's generated document, Tailwind layers, and Ant Design integration.
- Record pinned inspiration sources and applicable notices in package documentation, and audit each included source for license and naming requirements.
- Improve unsupported single-file diagnostics by recommending an explicit directory build when the application needs code splitting, workers, strict-CSP-friendly assets, or another unsupported resource pattern.

## Capabilities

### New Capabilities

- `global-theme-styling`: Named theme discovery and selection, semantic fixed-theme manifests, light-family aliases, original theme-authoring constraints, Tailwind/Ant Design coordination, custom CSS overrides, and attribution metadata.

### Modified Capabilities

- `jsx-app-build`: Change the default JSX build from directory output to one HTML file and redefine the explicit mode-selection and option-compatibility contract.
- `safe-build-output`: Change default destination selection from `dist/` to `<EntryName>.html` while preserving safe staged publication and retaining managed-directory safeguards for explicit directory builds.
- `bundled-frontend-stack`: Extend the supplied Tailwind and Ant Design integration with shared semantic theme tokens, deterministic fixed-theme application, cascade-layer ordering, and custom global CSS processing.

## Impact

- CLI parsing, usage text, output-mode selection, success and failure diagnostics, and backwards-compatibility handling will change.
- Checked-in package-owned theme stylesheets and the generated React mount module will gain theme data and, when needed, Ant Design `ConfigProvider`/CSS-layer integration.
- New theme manifests, original generated CSS, source metadata, and third-party notices will be included in the npm artifact.
- Tests must cover default file output, explicit directory mode, option conflicts, overwrite safety, every preset and light alias, explicit dark selection, custom CSS and assets, Tailwind utility precedence, Ant Design token application, packaged artifact behavior, and package contents.
- README, release notes, examples, package verification, and OpenSpec requirements will be updated for the breaking default and the theme catalog.
