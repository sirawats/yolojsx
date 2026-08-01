## MODIFIED Requirements

### Requirement: Theme-transparent JSX authoring

The CLI-managed stylesheet graph SHALL make the selected preset available through inherited document styling, ordinary Ant Design props, and conventional unbranded semantic Tailwind theme names, and SHALL NOT require application JSX to use a Rtifact-specific class-name vocabulary.

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
