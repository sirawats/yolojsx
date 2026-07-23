## ADDED Requirements

### Requirement: Supplied Ant Design theme integration
The CLI SHALL supply the supported Ant Design theme-provider and CSS-layer integration required by a selected preset without requiring those packages to be installed beside the input file, and SHALL preserve one compatible React and Ant Design runtime graph.

#### Scenario: Themed Ant Design component
- **WHEN** an entry imports an Ant Design component and selects a non-default preset
- **THEN** the generated mount applies the preset's global tokens or algorithms through the supplied Ant Design provider

#### Scenario: Light alias applies a fixed Ant Design theme
- **WHEN** a user selects an unsuffixed family alias such as `material`
- **THEN** the mounted provider applies the canonical light configuration without consulting the system color preference

### Requirement: Tailwind CSS-first theme processing
The CLI SHALL compose built-in semantic variables and optional custom CSS through the supplied Tailwind v4 CSS-first build path without loading a user-authored Tailwind configuration file.

#### Scenario: Preset exposes Tailwind theme values
- **WHEN** a selected preset defines semantic colors used by generated utilities or custom CSS
- **THEN** Tailwind processes those values from the controlled CSS entry and emits the required styles

#### Scenario: Custom CSS uses Tailwind directives
- **WHEN** a validated custom stylesheet uses supported Tailwind v4 CSS-first directives within the documented extension contract
- **THEN** the controlled Tailwind integration processes them without requiring a `tailwind.config.js`

### Requirement: Coordinated cascade layers
The supplied frontend stack SHALL integrate Tailwind and Ant Design using a declared layer order that keeps Preflight below component styles and utilities above supported Ant Design semantic slots.

#### Scenario: Tailwind utility and Ant Design component coexist
- **WHEN** an application renders an Ant Design component with supported Tailwind utility overrides
- **THEN** the build includes both styling systems and applies the documented `theme`, `base`, `antd`, `components`, and `utilities` precedence

#### Scenario: Directory and file output parity
- **WHEN** the same themed entry is built as default HTML output and explicit directory output
- **THEN** both outputs apply equivalent global, Tailwind, and Ant Design theme semantics
