## ADDED Requirements

### Requirement: Theme-transparent JSX authoring
The CLI-managed stylesheet graph SHALL make the selected preset available through inherited document styling, ordinary Ant Design props, and conventional unbranded semantic Tailwind theme names, and SHALL NOT require application JSX to use a yolojsx-specific class-name vocabulary.

#### Scenario: Native document inherits its theme
- **WHEN** an entry renders semantic headings, paragraphs, links, code, selection, and focusable controls without theme classes
- **THEN** the generated application applies the selected preset's appropriate typography, foreground, interaction, code, selection, and focus styling

#### Scenario: Conventional semantic Tailwind utility
- **WHEN** an entry needs an explicit muted foreground or themed surface
- **THEN** it can use conventional semantic utilities such as `text-muted-foreground`, `bg-card`, or `border-border` without a `yolo-` prefix

#### Scenario: No branded compatibility vocabulary
- **WHEN** package verification inspects the generated Tailwind theme contract, documentation, and examples
- **THEN** the removed `yolo-*` utilities and package-specific styling helpers are not retained as aliases or presented as supported authoring APIs

### Requirement: JSX-only packaged examples
Every packaged example SHALL express its application through JSX, semantic HTML, standard Ant Design APIs, and standard Tailwind utilities while relying on the CLI-managed stylesheet graph for theme styling.

#### Scenario: Example source has no stylesheet import
- **WHEN** package verification inspects every documented example entry and its local module graph
- **THEN** no example imports an application `.css` file or requires `--css` to obtain its intended built-in-theme appearance

#### Scenario: Example source has no theme plumbing
- **WHEN** package verification inspects every documented example
- **THEN** no example configures an Ant Design theme boundary, uses a `yolo-*` class name, or hard-codes a light or dark replacement for a built-in semantic color

#### Scenario: Every example builds in both modes
- **WHEN** the verification suite builds every documented example as default HTML output and explicit directory output
- **THEN** every build succeeds with equivalent CLI-managed global and Ant Design theme behavior

## MODIFIED Requirements

### Requirement: Coordinated semantic theme contract
Each preset SHALL define one semantic theme manifest that maps page, surface, foreground, border, interaction, status, selection, focus, code, typography, radius, shadow, and density values into conventional unbranded Tailwind v4 theme variables, generated global styles, and official Ant Design algorithms, global tokens, and component tokens.

#### Scenario: Tailwind and Ant Design share a preset
- **WHEN** an entry renders utility-styled HTML and Ant Design components under `--theme everforest-dark`
- **THEN** both styling systems use the Everforest-derived semantic background, foreground, border, interaction, typography, radius, density, and component-state values

#### Scenario: Dark preset sets document color scheme
- **WHEN** a fixed dark preset is selected
- **THEN** the generated document advertises a dark color scheme and applies dark page and component surfaces before interactive rendering

#### Scenario: Themes differ beyond palette
- **WHEN** representative controls and surfaces are built under visually distinct presets such as `github-light` and `material-light`
- **THEN** their generated Ant Design component tokens and global styles express meaningful differences in typography, density, radius, elevation, and interaction treatment as well as color

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

### Requirement: Theme provenance and notices
Every non-default preset SHALL record its display name, canonical id, supported mode, inspiration source, pinned source revision or release, source license, attribution text, and an explicit statement that yolojsx is not endorsed by the named project; required notices SHALL ship in the npm artifact.

#### Scenario: Theme discovery lists canonical names
- **WHEN** a user runs `yolojsx themes` or `yolojsx --themes`
- **THEN** the CLI prints only canonical preset ids in catalog order, one per line, without a heading, descriptions, aliases, mode labels, or provenance

#### Scenario: Package notices are verified
- **WHEN** package verification inspects the published artifact
- **THEN** all required theme source and license notices are present and no unaudited preset is included
