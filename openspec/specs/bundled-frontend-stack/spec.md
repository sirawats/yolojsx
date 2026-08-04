# bundled-frontend-stack Specification

## Purpose

Define the zero-configuration React, Tailwind CSS, and Ant Design environment supplied by Rtifact, including dependency-resolution and runtime compatibility guarantees.

## Requirements

### Requirement: Supplied React runtime

The CLI SHALL supply compatible React and React DOM runtime instances without requiring those packages to be installed beside the input file.

#### Scenario: React is not installed in the input directory

- **WHEN** a valid entry uses React JSX and the input directory has no local React installation
- **THEN** the build succeeds using the React runtime supplied by Rtifact

#### Scenario: One React instance

- **WHEN** the generated mount module and user component are bundled
- **THEN** they resolve to one compatible React runtime instance

### Requirement: Supplied Ant Design components

The CLI SHALL make the supported Ant Design package available to input modules without requiring a local Ant Design installation.

#### Scenario: Component imports Ant Design

- **WHEN** the entry imports and renders a component from `antd`
- **THEN** the build succeeds and the rendered application includes the component's required runtime styling

### Requirement: Tree-shakeable supplied runtime

The CLI SHALL resolve supplied frontend packages through tree-shakeable module entry points when the package publishes them, while preserving the documented package imports and one compatible React runtime.

#### Scenario: Unused Ant Design components are excluded

- **WHEN** an entry imports a subset of named Ant Design components
- **THEN** the generated application excludes unrelated Ant Design component families from its executable bundle

#### Scenario: Output mode parity after tree-shaking

- **WHEN** the same entry is built as self-contained file output and directory output
- **THEN** both outputs retain equivalent React, Ant Design, theme, and interaction behavior

### Requirement: Controlled CDN runtime graph

The CLI SHALL define one exact-version CDN mapping for the supported external runtime set and SHALL ensure React, React DOM, Ant Design, and Ant Design CSS-in-JS consumers share one compatible React instance.

#### Scenario: Default file versions match the supplied stack

- **WHEN** a default JSX file build is generated
- **THEN** every remote runtime mapping uses the exact corresponding version controlled and tested by the installed Rtifact package

#### Scenario: Application-specific packages remain embedded

- **WHEN** a default file entry imports Prism language modules or named React Icons
- **THEN** the selected Prism and React Icons code remains in the application payload rather than becoming an additional remote runtime dependency

### Requirement: Supplied React Icons and Prism packages

The CLI SHALL make the package's supported `react-icons` collection imports, `prismjs` runtime, language-module and plugin imports, and discovered PrismJS and `prism-themes` stylesheets available to JSX entries without requiring those packages to be installed beside the input file.

#### Scenario: Entry imports a React Icons collection

- **WHEN** an entry imports a named icon from a supported collection such as `react-icons/lu` and the input project has no local React Icons installation
- **THEN** the build succeeds using the React Icons package supplied by Rtifact and the rendered application includes the icon

#### Scenario: Entry imports PrismJS language definitions and plugins

- **WHEN** an entry imports PrismJS, the language definitions required by its code samples, and the line-numbers plugin with its stylesheet while the input project has no local PrismJS installation
- **THEN** the build succeeds using the PrismJS package supplied by Rtifact and the rendered application includes highlighted code with theme-aligned line numbers

#### Scenario: Entry selects a Prism theme

- **WHEN** an entry names a theme discovered from the supplied `prism-themes` package in `RTIFACT.prismTheme`
- **THEN** the build includes only the selected theme stylesheet

#### Scenario: Entry selects an unknown Prism theme

- **WHEN** an entry names a Prism theme that is not installed
- **THEN** the build includes PrismJS's default stylesheet and reports the fallback as a warning

### Requirement: Supplied stack in theme modules

The CLI SHALL compile selected TypeScript and JSX theme modules with the same supplied frontend-package resolution and compatible React deduplication used by the application build, without requiring those packages to be installed beside the theme file.

#### Scenario: Zero-install JSX theme component

- **WHEN** a selected `.jsx` theme module imports React and Ant Design, named-exports a component, and the input directory has no local frontend packages
- **THEN** theme loading and the application build both succeed using the compatible packages supplied by Rtifact

#### Scenario: Theme component imports React Icons

- **WHEN** a named component exported by a selected theme module imports an icon from a supported `react-icons` collection
- **THEN** the application build resolves the supplied icon package and includes the imported icon

#### Scenario: Theme module imports local helper

- **WHEN** a selected theme module derives its default definition from an imported local TypeScript helper
- **THEN** the theme loader resolves and evaluates that local module through the isolated Vite graph

#### Scenario: Theme module imports non-core dependency

- **WHEN** a selected theme module imports a non-core package
- **THEN** the loader applies normal input-project resolution and reports the importing theme source if the package is unavailable

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
- **THEN** the preset's official component tokens determine their normal, hover, active, focus, and disabled appearance without an Rtifact-specific class name

#### Scenario: Built-in themes avoid generated selector overrides

- **WHEN** package verification inspects built-in theme stylesheets and generated configuration
- **THEN** Ant Design customization is represented by provider tokens and algorithms rather than CSS rules targeting generated `.ant-*` component selectors

### Requirement: Tailwind utility generation

The CLI SHALL process Tailwind CSS for the input component, reachable JavaScript and TypeScript modules, and the selected local theme module without requiring user-authored Tailwind or Vite configuration. Before invoking Tailwind, it SHALL use an isolated write-free build to discover that module graph, snapshot its source, and reject graphs containing more than 2,000 source files, any source file larger than 4 MiB, or more than 32 MiB of source in total.

#### Scenario: Entry uses a Tailwind utility

- **WHEN** the entry contains a supported Tailwind utility class
- **THEN** the generated CSS contains the styles required for that utility

#### Scenario: Imported local component uses a utility

- **WHEN** a local component imported by the entry contains a supported Tailwind utility class
- **THEN** the generated CSS contains the styles required for that imported component

#### Scenario: Source tree contains unrelated code

- **WHEN** the directory containing the entry also contains JavaScript or TypeScript files that are not reachable from the entry
- **THEN** the Tailwind content scanner does not read those unrelated files

#### Scenario: Reachable source exceeds a safety limit

- **WHEN** the reachable JavaScript and TypeScript graph exceeds its file-count, per-file, or total-byte safety limit
- **THEN** the CLI rejects the build with an actionable diagnostic before invoking Tailwind

#### Scenario: Theme component uses a utility outside the entry directory

- **WHEN** a selected JSX theme module outside the entry's directory contains a supported Tailwind utility and the application imports that component
- **THEN** the generated CSS contains the styles required for that theme component

#### Scenario: Ant Design and Tailwind are used together

- **WHEN** an application renders Ant Design components alongside elements using Tailwind utilities
- **THEN** the production build includes both styling systems in the documented order

### Requirement: Tailwind CSS-first theme processing

The CLI SHALL compose semantic variables from the selected built-in preset or local theme manifest through the supplied Tailwind v4 CSS-first build path without loading a user-authored Tailwind configuration file.

#### Scenario: Preset exposes Tailwind theme values

- **WHEN** a selected built-in preset defines semantic colors used by generated utilities
- **THEN** Tailwind processes those values from the controlled CSS entry and emits the required styles

#### Scenario: Custom theme exposes Tailwind theme values

- **WHEN** a selected local theme manifest defines semantic colors used by generated utilities
- **THEN** Tailwind processes the normalized values from the controlled CSS entry and emits the required styles

### Requirement: Coordinated cascade layers

The supplied frontend stack SHALL integrate Tailwind and Ant Design using a declared layer order that keeps Preflight below component styles and utilities above supported Ant Design semantic slots.

#### Scenario: Tailwind utility and Ant Design component coexist

- **WHEN** an application renders an Ant Design component with supported Tailwind utility overrides
- **THEN** the build includes both styling systems and applies the documented `theme`, `base`, `antd`, `components`, and `utilities` precedence

#### Scenario: Directory and file output parity

- **WHEN** the same themed entry is built as default HTML output and explicit directory output
- **THEN** both outputs apply equivalent global, Tailwind, and Ant Design theme semantics

### Requirement: Non-core dependency resolution

The CLI SHALL preserve normal input-project resolution for bare imports that are not part of the stack guaranteed by Rtifact.

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
