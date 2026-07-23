# bundled-frontend-stack Specification

## Purpose

Define the zero-configuration React, Tailwind CSS, and Ant Design environment supplied by `yolo-jsx`, including dependency-resolution and runtime compatibility guarantees.

## Requirements

### Requirement: Supplied React runtime
The CLI SHALL supply compatible React and React DOM runtime instances without requiring those packages to be installed beside the input file.

#### Scenario: React is not installed in the input directory
- **WHEN** a valid entry uses React JSX and the input directory has no local React installation
- **THEN** the build succeeds using the React runtime supplied by `yolo-jsx`

#### Scenario: One React instance
- **WHEN** the generated mount module and user component are bundled
- **THEN** they resolve to one compatible React runtime instance

### Requirement: Supplied Ant Design components
The CLI SHALL make the supported Ant Design package available to input modules without requiring a local Ant Design installation.

#### Scenario: Component imports Ant Design
- **WHEN** the entry imports and renders a component from `antd`
- **THEN** the build succeeds and the rendered application includes the component's required runtime styling

### Requirement: Supplied Ant Design theme integration
The CLI SHALL supply one compatible Ant Design runtime graph and SHALL apply each selected preset through the generated `StyleProvider` and `ConfigProvider` boundary using official Ant Design algorithms, global tokens, CSS-variable configuration, and component tokens without requiring those packages to be installed beside the input file.

#### Scenario: Themed Ant Design component
- **WHEN** an entry imports an Ant Design component and selects a non-default preset
- **THEN** the generated provider applies the preset's global tokens, component tokens, and fixed algorithm before rendering the entry

#### Scenario: Light alias applies a fixed Ant Design theme
- **WHEN** a user selects an unsuffixed family alias such as `material`
- **THEN** the mounted provider applies the canonical light configuration without consulting the system color preference

#### Scenario: Standard component variants need no theme classes
- **WHEN** an entry renders supported Ant Design default, primary, text, link, ghost, or danger component variants using ordinary Ant Design props
- **THEN** the preset's official component tokens determine their normal, hover, active, focus, and disabled appearance without a yolojsx class name

#### Scenario: Built-in themes avoid generated selector overrides
- **WHEN** package verification inspects built-in theme stylesheets and generated configuration
- **THEN** Ant Design customization is represented by provider tokens and algorithms rather than CSS rules targeting generated `.ant-*` component selectors

### Requirement: Tailwind utility generation
The CLI SHALL process Tailwind CSS for the input component and its local source tree without requiring user-authored Tailwind or Vite configuration.

#### Scenario: Entry uses a Tailwind utility
- **WHEN** the entry contains a supported Tailwind utility class
- **THEN** the generated CSS contains the styles required for that utility

#### Scenario: Imported local component uses a utility
- **WHEN** a local component imported by the entry contains a supported Tailwind utility class
- **THEN** the generated CSS contains the styles required for that imported component

#### Scenario: Ant Design and Tailwind are used together
- **WHEN** an application renders Ant Design components alongside elements using Tailwind utilities
- **THEN** the production build includes both styling systems in the documented order

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

### Requirement: Non-core dependency resolution
The CLI SHALL preserve normal input-project resolution for bare imports that are not part of the stack guaranteed by `yolo-jsx`.

#### Scenario: Locally installed user dependency
- **WHEN** an entry imports a non-core package installed in its project context
- **THEN** the build resolves and bundles that package from the input project

#### Scenario: Missing user dependency
- **WHEN** an entry imports a non-core package that is not resolvable from its project context
- **THEN** the build fails with a diagnostic identifying the unresolved import and its importing source file

### Requirement: Controlled stack versions
The package SHALL declare and test a compatible set of frontend build and runtime dependencies and SHALL declare the Node.js engine range required by that set.

#### Scenario: Supported Node.js runtime
- **WHEN** the CLI runs on a declared supported Node.js version
- **THEN** its bundled build stack can complete the documented example build

#### Scenario: Unsupported Node.js runtime
- **WHEN** the CLI starts on a Node.js version outside its declared supported range
- **THEN** it exits unsuccessfully with a message describing the required range
