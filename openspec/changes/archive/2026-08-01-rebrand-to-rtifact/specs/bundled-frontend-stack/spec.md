## MODIFIED Requirements

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
