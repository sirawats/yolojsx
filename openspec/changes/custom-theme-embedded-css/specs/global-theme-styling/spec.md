## ADDED Requirements

### Requirement: Readable inline code foundation

The shared Rtifact foundation SHALL give unclassed inline `code` and `kbd` elements compact padding, inline separation, and a slightly reduced font size while preserving the selected theme's semantic code colors and radius.

#### Scenario: Inline code uses shared defaults

- **WHEN** an application renders inline `code` or `kbd` without application classes
- **THEN** the element receives readable shared spacing and typography under every built-in or custom theme

#### Scenario: Custom theme overrides inline code defaults

- **WHEN** a selected custom theme supplies an embedded CSS rule for inline `code` or `kbd`
- **THEN** its `@layer components` rule can override the shared foundation defaults

## MODIFIED Requirements

### Requirement: Custom theme module contract

A local theme module SHALL use its default export as one declarative theme definition, MAY include an optional `css` string field containing embedded custom CSS declarations within that definition, SHALL allow named exports to remain ordinary application modules, and SHALL NOT auto-register or inject named exports into application scope.

#### Scenario: Default theme definition

- **WHEN** a selected module default-exports a valid theme definition
- **THEN** the generated semantic CSS and Ant Design provider configuration are derived from that definition

#### Scenario: Embedded custom CSS string

- **WHEN** a selected custom theme definition includes a valid `css` string property
- **THEN** the CLI embeds that CSS into the application's global stylesheet graph after theme CSS variables under `@layer components`

#### Scenario: Single-file custom theme build with embedded CSS

- **WHEN** building a single HTML artifact with `--theme ./custom-theme.jsx` containing an embedded `css` string
- **THEN** the build succeeds and the generated HTML file contains the embedded CSS rules

#### Scenario: Directory mode custom theme build with embedded CSS

- **WHEN** building a directory output with `--theme ./custom-theme.jsx --out-dir dist`
- **THEN** the build succeeds and the bundled asset CSS file includes the embedded theme CSS rules

#### Scenario: Custom theme CSS variable binding

- **WHEN** embedded custom theme CSS references semantic variables such as `var(--primary)` or `var(--code)`
- **THEN** the rules are placed after `:root` definitions in the cascade so variables resolve correctly

#### Scenario: Reusable named component

- **WHEN** a JSX theme module named-exports a React component and the application imports it explicitly
- **THEN** the normal application build includes and renders that component

#### Scenario: Named export is not imported

- **WHEN** a theme module has a named component export that the application does not import
- **THEN** Rtifact does not expose that component as a global or render it implicitly

### Requirement: Custom theme validation

The CLI SHALL normalize and validate a custom theme definition with the same identifier, provenance, appearance, semantic color, contrast, typography, rhythm, serialization, Ant Design token, and supported component-override constraints applied to built-in themes. If supplied, the optional `css` field SHALL be a string. Theme modules SHALL be treated and documented as trusted local code executed during the build.

#### Scenario: Valid custom manifest

- **WHEN** a local theme default export satisfies the complete theme contract
- **THEN** the CLI applies its resolved semantic and Ant Design configuration in every output mode

#### Scenario: Invalid custom CSS property

- **WHEN** a custom theme definition supplies a non-string value for the `css` field
- **THEN** the CLI exits unsuccessfully before creating output and identifies the invalid theme field

#### Scenario: Missing default export

- **WHEN** a selected local theme module has no object default export
- **THEN** the CLI exits unsuccessfully before creating output and identifies the theme source and missing manifest

#### Scenario: Invalid custom manifest

- **WHEN** a custom definition violates a theme validation constraint
- **THEN** the CLI exits unsuccessfully before creating output and identifies both the theme source and the invalid field or relationship

#### Scenario: Theme module evaluation fails

- **WHEN** compiling or evaluating the selected local theme module fails
- **THEN** the CLI exits unsuccessfully before creating output and reports an actionable diagnostic associated with that module
