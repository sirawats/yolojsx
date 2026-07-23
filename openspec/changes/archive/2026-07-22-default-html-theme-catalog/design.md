## Context

The CLI already has two complete build paths: a staged directory build and a temporary Vite build that is normalized into one compressed HTML artifact. Argument parsing currently selects directory mode by default, and the generated application consists of one HTML shell, one React mount module, and one Tailwind v4 stylesheet entry. Ant Design styles are currently injected at runtime only when user code imports Ant Design.

This change reverses the default output mode and adds a theme system that must remain zero-configuration, work from global and `npx` installations, apply equally to directory and compressed-file outputs, and preserve the existing output safeguards. Current Tailwind guidance favors CSS-first configuration through `@import`, `@theme`, `@source`, and explicit cascade layers. Current Ant Design v6 guidance uses `ConfigProvider` for tokens and algorithms and `StyleProvider layer` when atomic utilities need predictable precedence.

Recognizable upstream themes provide useful palettes and visual principles, but their stylesheets target unrelated component trees. Obsidian themes in particular target workspace, editor, Markdown, and plugin selectors that do not exist in an arbitrary yolojsx application. The user has therefore required analysis and original adaptation rather than copying CSS.

## Goals / Non-Goals

**Goals:**

- Make `<EntryName>.html` the safe default output while preserving explicit directory builds.
- Provide a discoverable catalog of recognizable fixed themes with convenient light aliases.
- Express each theme once as yolojsx semantic data and apply it coherently to global CSS, Tailwind, and Ant Design.
- Let a custom stylesheet extend or override a built-in theme without loading user Vite or Tailwind configuration.
- Keep all builds deterministic and offline by shipping reviewed theme manifests rather than fetching theme data at build time.
- Preserve attribution and license notices while ensuring all shipped CSS is original to yolojsx.

**Non-Goals:**

- Reproduce another product's DOM, component library, or exact appearance pixel for pixel.
- Convert, bundle, or execute arbitrary Obsidian theme CSS.
- Replace Ant Design components with Primer, Material, or Obsidian components.
- Infer a complete Ant Design token configuration from arbitrary custom CSS.
- Add a development server, runtime theme picker, user-authored JavaScript theme module, remote theme download, or strict-CSP single-file format.

## Decisions

### 1. Select output mode from explicit directory intent

Argument parsing will stop assigning `dist` as an unconditional `outDir` default. A JSX build selects directory mode only when `--out-dir` is explicitly present; otherwise it selects HTML-file mode. In file mode, `--output` is optional and defaults to the entry basename in the invocation directory. `--base` requires explicit directory mode. `--output` and `--out-dir` conflict.

`--single-file` remains accepted during a compatibility window as a no-op selector for the now-default file mode and emits a deprecation warning. It continues to conflict with directory-only options. The `pack` command remains unchanged.

This reuses the current safe single-file pipeline and makes migration explicit: automation that needs the former behavior adds `--out-dir dist`. A separate `--directory` flag was rejected because `--out-dir` already expresses both the mode and destination.

### 2. Pair semantic manifests with checked-in package-owned stylesheets

The implementation will introduce a registry of immutable theme manifests. Each manifest records:

- canonical id, display name, description, aliases, and fixed light or dark appearance;
- inspiration URL, pinned revision or release, license identifier, attribution, and non-endorsement text;
- semantic values for canvas, surfaces, foregrounds, borders, primary interaction, focus, selection, code, and status colors;
- typography, radius, shadow, and density values where the source meaningfully informs them;
- Ant Design seed/alias tokens and the appropriate light or dark algorithm selection.

Unsuffixed family names resolve as aliases of their canonical light manifests: for example, `material` resolves to `material-light`, and `catppuccin` resolves to `catppuccin-latte`. Dark output always requires an explicit fixed id such as `material-dark` or `catppuccin-mocha`. `github-dark-dimmed`, Frappé, and Macchiato remain independently selectable fixed variants.

Every selectable id also has a checked-in stylesheet under `src/themes/`. These small assets declare the selected semantic CSS variables and import one shared package-owned foundation containing Tailwind `@theme`, global base rules, and yolojsx component helpers. Manifests remain the source for discovery, validation, provenance, and Ant Design runtime values; automated parity checks keep the stored CSS values aligned. Keeping CSS visible as ordinary project assets makes the catalog easier to inspect and edit than generating an opaque temporary preset file.

### 3. Author all stored theme CSS specifically for yolojsx

Maintainers may inspect official palette values, screenshots, documentation, and permissively licensed implementations to understand contrast, hierarchy, typography, and density. They will then author a yolojsx semantic mapping and a small yolojsx-specific global-style template. No task will copy selectors, declarations, blocks, compiled output, or theme source files from Primer, Material, editor themes, or Obsidian themes.

Obsidian Minimal and Baseline are treated as design references for page rhythm, typography, surface hierarchy, and their own light/dark visual character. Their application-specific CSS is not an implementation input. GPL theme sources such as AnuPpuccin and Primary are not part of this catalog. If a source or name fails the implementation-time license and naming audit, the preset must be removed from the release or renamed through a proposal update rather than silently shipping questionable content.

Every source will be pinned in manifest metadata, and required notices plus a non-endorsement disclaimer will ship in `THIRD_PARTY_NOTICES.md`. Builds never access the network. Checked-in theme assets are original yolojsx CSS, not generated or transformed copies of any inspiration source.

### 4. Compose one controlled Tailwind CSS graph

The temporary workspace will contain a controlled stylesheet entry that imports the selected checked-in theme asset. Its import order will be:

1. declare the stable layer order `theme`, `base`, `antd`, `components`, `utilities`;
2. import the package-owned Tailwind stylesheet with automatic scanning disabled;
3. import the selected package-owned theme stylesheet, which imports the shared semantic foundation;
4. import the validated user stylesheet when supplied;
5. declare `@source` for the entry's source directory.

Keeping all imports before source and style directives satisfies CSS import ordering. Importing the user stylesheet through Vite's graph preserves URLs relative to the user's CSS file and lets the Tailwind plugin process documented v4 CSS-first directives in the same graph. The preset import precedes the custom import so ordinary custom rules and equal-layer declarations can override the baseline. Tailwind Preflight remains the only global reset; Ant Design reset CSS is not imported.

The custom stylesheet is trusted local build input, like the JSX entry. Validation requires a readable regular `.css` file and resolves its path from the invocation directory. A custom stylesheet can override semantic CSS variables and global/component layers, but it does not rewrite the generated Ant Design JavaScript token object; users needing arbitrary Ant Design configuration can still wrap their own component in `ConfigProvider`.

An alternative where the custom file becomes the full Tailwind entry was rejected because it would require every user to know package-owned import paths and source-scanning directives. Importing it as a second unrelated CSS entry was rejected because `@theme` and layer ordering could diverge across independent compiler graphs.

### 5. Apply Ant Design themes through a generated provider boundary

The virtual mount module will render the user's component beneath package-owned `StyleProvider layer` and `ConfigProvider` boundaries. The project will declare `@ant-design/cssinjs` directly if it imports `StyleProvider`, rather than relying on a transitive dependency. The explicit `antd` layer will sit below Tailwind `components` and `utilities`, allowing supported utility overrides without `!important` while keeping Preflight below component styles.

Provider integration will be consistent for every preset, including `default`, to avoid theme-dependent cascade semantics. This adds some provider code to applications that do not otherwise import Ant Design, but tree shaking should retain only the provider path. Consistent rendering and predictable utility precedence are preferred; package verification will track the artifact-size impact.

Every selection is fixed and deterministic. Stored stylesheets contain no `prefers-color-scheme` branch, and the generated React mount applies exactly one Ant Design configuration without a `matchMedia` subscription. This ensures the same command produces the same visual appearance on light and dark operating systems.

### 6. Keep discovery separate from build parsing

`yolojsx themes` will be a first-class action requiring no entry. It will read registry metadata only and print canonical ids, light aliases, fixed modes, short descriptions, and inspiration sources. Unknown `--theme` errors will direct users to this command. Human-readable output is sufficient for this change; a JSON output contract can be proposed later if automation needs it.

### 7. Share theme inputs across output modes

Theme and custom CSS inputs will be resolved and validated before either build path starts, then passed into the same temporary application builder. Directory mode copies the resulting Vite output into its protected stage. File mode passes that output into the existing normalizer and packager, which embeds the emitted CSS and local assets. No theme-specific logic belongs in the packager.

If normalization rejects an application graph, the error will retain the precise incompatibility and add a directory-mode recommendation. This is important now that file mode is the default, but it does not weaken packaging validation.

## Risks / Trade-offs

- **Recognizable names may imply exact reproduction or endorsement** → Describe presets as inspired adaptations, include non-endorsement text, use canonical upstream naming carefully, and make naming review a release gate.
- **Palette colors may not meet contrast requirements after semantic remapping** → Add contrast checks for primary text, muted text, controls, focus, and status pairs; adjust the original yolojsx mapping instead of blindly preserving a source value.
- **Twenty-one fixed presets create a large test and maintenance surface** → Drive them from one manifest schema, validate every manifest mechanically, and use table-driven build tests.
- **Users may assume unsuffixed family names follow the system** → Document that family aliases are always light, omit media-query branches and runtime preference listeners, and test alias-to-canonical resolution plus CSS/manifest parity.
- **Provider boundaries increase the smallest bundle** → Measure default artifacts in package verification and keep provider imports granular; revisit conditional injection only if the measured cost is material.
- **Custom CSS can bypass theme assumptions** → Treat it as an explicit final override, document the layer contract, and keep validation focused on path safety and build correctness rather than attempting to sanitize trusted CSS.
- **Changing the default breaks scripts expecting `dist/` and exposes existing single-file limitations** → Preserve explicit `--out-dir dist`, retain the legacy flag temporarily, update all diagnostics and documentation, and recommend directory mode for unsupported graphs or strict CSP.
- **License compliance can be lost as sources evolve** → Pin reviewed revisions, ship notices, avoid runtime updates, and require a package-audit test and checklist for catalog changes.

## Migration Plan

1. Introduce the registry, semantic schema, original preset mappings, provider boundary, and CSS composition behind the existing explicit single-file path.
2. Add theme discovery, selection, custom CSS validation, provenance, and full fixed-preset/light-alias verification.
3. Invert the parser default, permit direct `--output`, make directory intent explicit, and add the `--single-file` deprecation warning.
4. Update examples, README, package contents, verification scripts, release notes, and diagnostics, prominently documenting `--out-dir dist` as the migration command.
5. Run the complete repository and packaged-artifact verification on every supported Node range before release.

Rollback requires only restoring directory mode as the parser default; no persisted user data or output format migration is involved. Theme manifests and flags can remain available if the output-default change must be reverted independently.

## Open Questions

No behavior decision blocks implementation. Final license, notice, accessibility, and naming audits remain release gates for every preset; any failed candidate must be removed or handled through an explicit proposal revision.
