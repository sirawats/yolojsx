# global-theme-styling Specification

## Purpose

Define built-in and custom global styling for generated applications, including deterministic theme selection, semantic integration across Tailwind CSS and Ant Design, theme provenance, and cascade behavior.

## Requirements

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

Each preset SHALL define one semantic theme manifest that maps page, surface, foreground, border, interaction, link, status fill and border, selection, focus, code, typography, radius, shadow, and density values into conventional unbranded Tailwind v4 theme variables, generated global styles, and official Ant Design algorithms, global tokens, and component tokens.

#### Scenario: Tailwind and Ant Design share a preset

- **WHEN** an entry renders utility-styled HTML and Ant Design components under `--theme everforest-dark`
- **THEN** both styling systems use the Everforest-derived semantic background, foreground, border, interaction, typography, radius, density, and component-state values

#### Scenario: Dark preset sets document color scheme

- **WHEN** a fixed dark preset is selected
- **THEN** the generated document advertises a dark color scheme and applies dark page and component surfaces before interactive rendering

#### Scenario: Themes differ beyond palette

- **WHEN** representative controls and surfaces are built under visually distinct presets such as `github-light` and `material-light`
- **THEN** their generated Ant Design component tokens and global styles express meaningful differences in typography, density, radius, elevation, and interaction treatment as well as color

#### Scenario: Theme families retain structural identity

- **WHEN** representative presets from each named family render headings, cards, menus, and controls
- **THEN** GitHub is compact and border-led, Material spacious and elevated, One Dark tonal and flat, Solarized restrained, Gruvbox dense and square, Everforest soft and relaxed, Catppuccin rounded, Obsidian Minimal whitespace-led, and Obsidian Baseline typographic and structurally bordered

#### Scenario: Theme-specific status treatment

- **WHEN** distinct preset families render Ant Design alerts
- **THEN** GitHub and Everforest alerts use colored status borders, Obsidian Baseline alerts use neutral structural borders, and the remaining families use borderless status fills

#### Scenario: Interaction borders remain visible

- **WHEN** Ant Design components render brand tracks or focus-related borders under any built-in preset
- **THEN** brand tracks use component-level on-surface primary accents, focus-related borders use the shared focus and link aliases, both have at least 3:1 contrast against their actual component surfaces, and disabled states remain subdued

#### Scenario: Component colors preserve their semantic roles

- **WHEN** Ant Design components render normal progress and interaction accents, links, focus indicators, selections, or semantic feedback under any built-in preset
- **THEN** normal accents use the preset's on-surface primary brand colors, links use link colors, focus uses focus colors, selections use the paired selection colors, and info, success, warning, and error feedback retain their matching status colors

### Requirement: Theme-transparent JSX authoring

The CLI-managed stylesheet graph SHALL make the selected preset available through inherited document styling, ordinary Ant Design props, and conventional unbranded semantic Tailwind theme names, and SHALL NOT require application JSX to use an Rtifact-specific class-name vocabulary.

#### Scenario: Native document inherits its theme

- **WHEN** an entry renders semantic headings, paragraphs, links, code, selection, and focusable controls without theme classes
- **THEN** the generated application applies the selected preset's appropriate typography, foreground, interaction, code, selection, and focus styling

#### Scenario: PrismJS line numbers inherit code typography

- **WHEN** an entry activates PrismJS's `line-numbers` plugin on a code block
- **THEN** the generated line-number gutter inherits the code block's font metrics under every selected preset

#### Scenario: Conventional semantic Tailwind utility

- **WHEN** an entry needs an explicit muted foreground or themed surface
- **THEN** it can use conventional semantic utilities such as `text-muted-foreground`, `bg-card`, `border-border`, or `font-heading` without a package-specific prefix

#### Scenario: No branded compatibility vocabulary

- **WHEN** package verification inspects the generated Tailwind theme contract, documentation, and examples
- **THEN** removed branded utilities and package-specific styling helpers are not retained as aliases or presented as supported authoring APIs

### Requirement: Original Rtifact theme authorship

Built-in theme CSS and mappings SHALL be authored specifically for Rtifact's generated document and semantic contract; the project SHALL NOT copy, vendor, concatenate, mechanically transform, or redistribute CSS from an upstream palette, design system, editor theme, or Obsidian theme.

#### Scenario: Palette used as inspiration

- **WHEN** a maintainer creates a preset informed by an upstream theme
- **THEN** the committed implementation contains an original semantic mapping and Rtifact-specific CSS rather than upstream selectors or stylesheet content

#### Scenario: Packaged theme sources inspected

- **WHEN** the npm artifact is inspected
- **THEN** it contains Rtifact theme manifests, a package-owned stylesheet for every selectable theme, and the shared Rtifact foundation, but no vendored upstream or Obsidian theme stylesheet

### Requirement: Theme provenance and notices

Every non-default preset SHALL record its display name, canonical id, supported mode, inspiration source, pinned source revision or release, source license, attribution text, and an explicit statement that Rtifact is not endorsed by the named project; required notices SHALL ship in the npm artifact.

#### Scenario: Theme discovery lists canonical names

- **WHEN** a user runs `rtifact themes` or `rtifact --themes`
- **THEN** the CLI prints only canonical preset ids in catalog order, one per line, without a heading, descriptions, aliases, mode labels, or provenance

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

The controlled stylesheet graph SHALL declare and preserve the cascade order `theme`, `base`, `antd`, `components`, and `utilities`, SHALL import the selected checked-in theme stylesheet, SHALL let Tailwind Preflight own the global reset, SHALL avoid importing Ant Design reset CSS in the normal runtime-styling path, and SHALL keep built-in Ant Design customization in the generated provider token configuration rather than CSS selector overrides.

#### Scenario: Utility overrides Ant Design styling

- **WHEN** a supported Ant Design semantic slot receives a standard Tailwind utility class under a themed build
- **THEN** the utility-layer declaration takes precedence over the Ant Design layer without requiring `!important`

#### Scenario: Plain element receives one reset

- **WHEN** a generated application renders an unstyled HTML element
- **THEN** its reset behavior comes from Tailwind Preflight without a second Ant Design global reset competing with it

#### Scenario: Built-in stylesheet does not patch Ant Design selectors

- **WHEN** a checked-in preset needs distinct component shapes, density, elevation, or interaction states
- **THEN** those differences are supplied through the preset's Ant Design global or component tokens and the stylesheet contains no `.ant-*` component patch

### Requirement: JSX-only packaged examples

Every packaged example SHALL express its application through JSX, semantic HTML, standard Ant Design APIs, and standard Tailwind utilities while relying on the CLI-managed stylesheet graph for theme styling.

#### Scenario: Example source has no stylesheet import

- **WHEN** package verification inspects every documented example entry and its local module graph
- **THEN** no example imports an application `.css` file or requires `--css` to obtain its intended built-in-theme appearance

#### Scenario: Example source has no theme plumbing

- **WHEN** package verification inspects every documented example
- **THEN** no example configures an Ant Design theme boundary, uses a package-branded class name, or hard-codes a light or dark replacement for a built-in semantic color

#### Scenario: Every example builds in both modes

- **WHEN** the verification suite builds every documented example as default HTML output and explicit directory output
- **THEN** every build succeeds with equivalent CLI-managed global and Ant Design theme behavior
