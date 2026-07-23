## ADDED Requirements

### Requirement: Built-in theme selection
The JSX build form SHALL accept `--theme <preset>` in both default HTML-file mode and explicit directory mode, SHALL use `default` when the option is omitted, and SHALL reject an unknown preset before starting a build.

#### Scenario: Default theme
- **WHEN** a user builds a JSX entry without `--theme`
- **THEN** the generated application uses the `default` theme

#### Scenario: Named theme
- **WHEN** a user builds a JSX entry with `--theme gruvbox-dark`
- **THEN** the generated application uses the fixed Gruvbox dark theme mapping

#### Scenario: Unknown theme
- **WHEN** a user supplies a theme id that is not a supported preset or alias
- **THEN** the CLI exits unsuccessfully before building and identifies the unknown value and the theme-discovery command

### Requirement: Initial recognizable theme catalog
The package SHALL provide fixed presets named `default`, `github-light`, `github-dark`, `github-dark-dimmed`, `material-light`, `material-dark`, `one-dark`, `solarized-light`, `solarized-dark`, `gruvbox-light`, `gruvbox-dark`, `everforest-light`, `everforest-dark`, `catppuccin-latte`, `catppuccin-frappe`, `catppuccin-macchiato`, `catppuccin-mocha`, `obsidian-minimal-light`, `obsidian-minimal-dark`, `obsidian-baseline-light`, and `obsidian-baseline-dark`.

#### Scenario: Every fixed preset builds
- **WHEN** the verification suite builds a representative Tailwind and Ant Design entry with each fixed preset
- **THEN** every build succeeds and emits the semantic colors and Ant Design configuration assigned to that preset

#### Scenario: One Dark compatibility alias
- **WHEN** a user selects `onedark`
- **THEN** the CLI treats it as an alias of the canonical `one-dark` preset

### Requirement: Deterministic light family aliases
The package SHALL treat `github`, `material`, `solarized`, `gruvbox`, `everforest`, `catppuccin`, `obsidian-minimal`, and `obsidian-baseline` as aliases of their documented canonical light presets and SHALL use a dark theme only when the user explicitly selects a fixed dark preset id.

#### Scenario: Unsuffixed family selects light
- **WHEN** an application is built with `--theme material`
- **THEN** the application uses the fixed `material-light` semantic CSS and Ant Design mapping

#### Scenario: Dark appearance is explicit
- **WHEN** an application is built with `--theme material-dark`
- **THEN** the application uses the fixed Material dark mapping

#### Scenario: System preference does not change selection
- **WHEN** an application built with `--theme solarized` runs under a dark system preference
- **THEN** it continues to use the Solarized light mapping and contains no runtime color-preference switch

### Requirement: Coordinated semantic theme contract
Each preset SHALL define one yolojsx semantic theme manifest that maps page, surface, text, border, interaction, status, selection, focus, code, typography, radius, shadow, and density values into Tailwind v4 theme variables, generated global styles, and Ant Design theme tokens or algorithms.

#### Scenario: Tailwind and Ant Design share a preset
- **WHEN** an entry renders utility-styled HTML and Ant Design components under `--theme everforest-dark`
- **THEN** both styling systems use the Everforest-derived semantic background, foreground, border, and interaction values

#### Scenario: Dark preset sets document color scheme
- **WHEN** a fixed dark preset is selected
- **THEN** the generated document advertises a dark color scheme and applies dark page and component surfaces before interactive rendering

### Requirement: Original yolojsx theme authorship
Built-in theme CSS and mappings SHALL be authored specifically for yolojsx's generated document and semantic contract; the project SHALL NOT copy, vendor, concatenate, mechanically transform, or redistribute CSS from an upstream palette, design system, editor theme, or Obsidian theme.

#### Scenario: Palette used as inspiration
- **WHEN** a maintainer creates a preset informed by an upstream theme
- **THEN** the committed implementation contains an original semantic mapping and yolojsx-specific CSS rather than upstream selectors or stylesheet content

#### Scenario: Packaged theme sources inspected
- **WHEN** the npm artifact is inspected
- **THEN** it contains yolojsx theme manifests, a package-owned stylesheet for every selectable theme, and the shared yolojsx foundation, but no vendored upstream or Obsidian theme stylesheet

### Requirement: Theme provenance and notices
Every non-default preset SHALL record its display name, canonical id, supported mode, inspiration source, pinned source revision or release, source license, attribution text, and an explicit statement that yolojsx is not endorsed by the named project; required notices SHALL ship in the npm artifact.

#### Scenario: Theme discovery includes provenance
- **WHEN** a user runs `yolojsx themes`
- **THEN** the CLI lists canonical preset ids, light aliases, fixed light/dark mode information, brief descriptions, and inspiration sources

#### Scenario: Package notices are verified
- **WHEN** package verification inspects the published artifact
- **THEN** all required theme source and license notices are present and no unaudited preset is included

### Requirement: Custom global CSS overrides
The JSX build form SHALL accept at most one `--css <file.css>` value, resolve it from the invocation working directory, require a readable regular `.css` file, process it in the controlled Vite and Tailwind build graph after the selected preset, and preserve file-relative local asset resolution.

#### Scenario: Custom CSS without explicit theme
- **WHEN** a user builds with `--css styles/custom.css` and no `--theme`
- **THEN** the custom stylesheet is applied after the `default` preset

#### Scenario: Preset with custom override
- **WHEN** a user combines `--theme github-dark` with `--css custom.css`
- **THEN** the preset supplies the semantic baseline and the custom stylesheet can override it according to the documented cascade layers

#### Scenario: Custom CSS local asset
- **WHEN** the custom stylesheet references a local font or image relative to itself
- **THEN** Vite resolves the asset from the stylesheet directory and the selected output mode emits or embeds it correctly

#### Scenario: Invalid custom CSS input
- **WHEN** the custom CSS path is missing, unreadable, not a regular file, or does not end in `.css`
- **THEN** the CLI exits unsuccessfully before creating output and identifies the invalid stylesheet

### Requirement: Stable theme cascade
The controlled stylesheet graph SHALL declare and preserve the cascade order `theme`, `base`, `antd`, `components`, and `utilities`, SHALL import the selected checked-in theme stylesheet, SHALL let Tailwind Preflight own the global reset, and SHALL avoid importing Ant Design reset CSS in the normal runtime-styling path.

#### Scenario: Utility overrides Ant Design styling
- **WHEN** a supported Ant Design semantic slot receives a Tailwind utility class under a themed build
- **THEN** the utility-layer declaration takes precedence over the Ant Design layer without requiring `!important`

#### Scenario: Plain element receives one reset
- **WHEN** a generated application renders an unstyled HTML element
- **THEN** its reset behavior comes from Tailwind Preflight without a second Ant Design global reset competing with it
