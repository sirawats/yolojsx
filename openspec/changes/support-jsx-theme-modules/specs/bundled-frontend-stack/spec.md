## ADDED Requirements

### Requirement: Supplied stack in theme modules

The CLI SHALL compile selected TypeScript and JSX theme modules with the same
supplied frontend-package resolution and compatible React deduplication used by
the application build, without requiring those packages to be installed beside
the theme file.

#### Scenario: Zero-install JSX theme component

- **WHEN** a selected `.jsx` theme module imports React and Ant Design, named-exports a component, and the input directory has no local frontend packages
- **THEN** theme loading and the application build both succeed using the compatible packages supplied by yolojsx

#### Scenario: Theme component imports React Icons

- **WHEN** a named component exported by a selected theme module imports an icon from a supported `react-icons` collection
- **THEN** the application build resolves the supplied icon package and includes the imported icon

#### Scenario: Theme module imports local helper

- **WHEN** a selected theme module derives its default definition from an imported local TypeScript helper
- **THEN** the theme loader resolves and evaluates that local module through the isolated Vite graph

#### Scenario: Theme module imports non-core dependency

- **WHEN** a selected theme module imports a non-core package
- **THEN** the loader applies normal input-project resolution and reports the importing theme source if the package is unavailable

## MODIFIED Requirements

### Requirement: Tailwind utility generation

The CLI SHALL process Tailwind CSS for the input component, its local source
tree, and the selected local theme module without requiring user-authored
Tailwind or Vite configuration.

#### Scenario: Entry uses a Tailwind utility

- **WHEN** the entry contains a supported Tailwind utility class
- **THEN** the generated CSS contains the styles required for that utility

#### Scenario: Imported local component uses a utility

- **WHEN** a local component imported by the entry contains a supported Tailwind utility class
- **THEN** the generated CSS contains the styles required for that imported component

#### Scenario: Theme component uses a utility outside the entry tree

- **WHEN** a selected JSX theme module outside the entry's scanned source directory contains a supported Tailwind utility and the application imports that component
- **THEN** the generated CSS contains the styles required for that theme component

#### Scenario: Ant Design and Tailwind are used together

- **WHEN** an application renders Ant Design components alongside elements using Tailwind utilities
- **THEN** the production build includes both styling systems in the documented order

### Requirement: Tailwind CSS-first theme processing

The CLI SHALL compose semantic variables from the selected built-in preset or
local theme manifest through the supplied Tailwind v4 CSS-first build path
without loading a user-authored Tailwind configuration file.

#### Scenario: Preset exposes Tailwind theme values

- **WHEN** a selected built-in preset defines semantic colors used by generated utilities
- **THEN** Tailwind processes those values from the controlled CSS entry and emits the required styles

#### Scenario: Custom theme exposes Tailwind theme values

- **WHEN** a selected local theme manifest defines semantic colors used by generated utilities
- **THEN** Tailwind processes the normalized values from the controlled CSS entry and emits the required styles
