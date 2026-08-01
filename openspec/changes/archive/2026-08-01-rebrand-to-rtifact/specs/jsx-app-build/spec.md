## MODIFIED Requirements

### Requirement: CLI invocation

The package SHALL expose a `rtifact` executable that supports a build form accepting exactly one JSX or TSX entry path and a `pack` form accepting exactly one build-directory path, and SHALL support invocation after global installation and through `npx rtifact`.

#### Scenario: Build through the global executable

- **WHEN** a user runs `rtifact Home.jsx` after installing the package globally
- **THEN** the CLI builds `Home.jsx` as the application entry

#### Scenario: Build through npx

- **WHEN** a user runs `npx rtifact Home.jsx`
- **THEN** the package executes the same build behavior as the global executable

#### Scenario: Pack an existing build

- **WHEN** a user runs `rtifact pack dist --output index.html`
- **THEN** the CLI packages the compatible application in `dist` into `index.html`

#### Scenario: Missing entry argument

- **WHEN** a user invokes a build or pack form without its required input path
- **THEN** the CLI prints concise usage information and exits with a non-zero status

### Requirement: JSX component entry

The CLI SHALL accept an existing `.jsx` or `.tsx` module whose default export is a React component, SHALL render that component into a generated application root, and SHALL apply an optional named `RTIFACT` metadata export containing `title`, `icon`, and `prismTheme` to the generated document.

#### Scenario: Default-exported component

- **WHEN** the entry module default-exports a valid React component
- **THEN** the generated application mounts that component into the generated HTML document

#### Scenario: Invalid entry path

- **WHEN** the entry does not exist, is not a readable file, or does not use the supported extension
- **THEN** the CLI rejects the build before creating output and identifies the invalid entry

#### Scenario: Missing usable default export

- **WHEN** the entry cannot be built as a default-exported React component
- **THEN** the CLI exits unsuccessfully and reports the entry-module problem

#### Scenario: Application title and icon

- **WHEN** the entry exports `RTIFACT` with a title and an imported local, remote, or data URL icon
- **THEN** the generated application uses that title and icon in the browser tab

#### Scenario: Theme-aware PrismJS tokens

- **WHEN** the entry exports a discovered Prism theme name as the string literal `RTIFACT.prismTheme`
- **THEN** the generated application resolves and applies only that `prism-themes` stylesheet

#### Scenario: Prism theme discovery

- **WHEN** the user runs `rtifact prism-themes` or `rtifact --prism-themes`
- **THEN** the CLI lists canonical theme names discovered from the installed PrismJS and `prism-themes` packages

#### Scenario: Unknown Prism theme

- **WHEN** `RTIFACT.prismTheme` names a theme absent from the discovered catalog
- **THEN** the build succeeds with PrismJS's default `prism` theme and the CLI prints a warning

#### Scenario: No application metadata

- **WHEN** the entry does not export `RTIFACT`
- **THEN** the generated application keeps the `Rtifact` title and adds no favicon
