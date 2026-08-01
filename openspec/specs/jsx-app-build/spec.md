# jsx-app-build Specification

## Purpose

Define how the Rtifact CLI accepts one JSX or TSX component and produces a portable HTML artifact or deployable static React application with actionable diagnostics.

## Requirements

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

### Requirement: Deployable static application

The explicit directory-build form SHALL produce a static application containing an HTML entry and all JavaScript, CSS, and module-graph assets required to render the component.

#### Scenario: Successful production directory build

- **WHEN** a valid component is built with `--out-dir dist`
- **THEN** the output contains an `index.html` that references production assets within the output directory

#### Scenario: Relative module and asset imports

- **WHEN** the entry imports local modules or assets using relative paths
- **THEN** the build resolves those imports relative to their original source modules and includes their required output

#### Scenario: Portable default base

- **WHEN** the user does not specify a public base path for a directory build
- **THEN** generated asset references use a relative base suitable for serving the output beneath an arbitrary path

#### Scenario: Custom public base

- **WHEN** the user supplies `--out-dir dist --base /application/`
- **THEN** generated public asset references use `/application/` as the build base

### Requirement: Direct single-file build selection

The JSX build form SHALL build and package the component as one CDN-backed HTML file by default without retaining an intermediate output directory, SHALL accept `--output` to select its destination, SHALL accept `--self-contained` to embed runtime dependencies, and SHALL temporarily accept `--single-file` as a deprecated compatibility alias for the CDN-backed default mode.

#### Scenario: Default single-file name

- **WHEN** a user runs `rtifact Home.jsx` from a working directory
- **THEN** the CLI creates CDN-backed `Home.html` in that working directory

#### Scenario: Nested entry default name

- **WHEN** a user runs `rtifact pages/Dashboard.jsx`
- **THEN** the CLI creates CDN-backed `Dashboard.html` in the invocation working directory

#### Scenario: Explicit single-file name

- **WHEN** a user runs `rtifact Home.jsx --output index.html`
- **THEN** the CLI creates CDN-backed `index.html` at the path resolved from the invocation working directory

#### Scenario: Explicit self-contained file

- **WHEN** a user runs `rtifact Home.jsx --self-contained`
- **THEN** the CLI creates `Home.html` with the controlled runtime embedded

#### Scenario: Deprecated explicit selection

- **WHEN** a user runs `rtifact Home.jsx --single-file`
- **THEN** the CLI creates CDN-backed `Home.html` and writes a deprecation warning identifying the now-default file mode

#### Scenario: No retained intermediate directory

- **WHEN** a default or self-contained HTML-file build succeeds
- **THEN** temporary Vite output is cleaned and no `dist` directory is created solely for that build

### Requirement: Self-contained single-file option compatibility

The CLI SHALL accept `--self-contained` only for direct JSX file builds and SHALL keep the `pack` action self-contained without requiring that option.

#### Scenario: Self-contained output destination

- **WHEN** a JSX build uses `--self-contained --output public/index.html`
- **THEN** the CLI writes the self-contained artifact to the resolved explicit file destination

#### Scenario: Self-contained mode conflicts with directory options

- **WHEN** a JSX build combines `--self-contained` with `--out-dir` or `--base`
- **THEN** argument validation fails before building and explains that directory output already manages its own local assets

#### Scenario: Pack remains self-contained

- **WHEN** a user invokes `rtifact pack dist --output index.html`
- **THEN** the CLI embeds the compatible build runtime without requiring `--self-contained`

#### Scenario: Self-contained selector is not a pack option

- **WHEN** a user supplies `--self-contained` to the `pack` action
- **THEN** argument validation fails and explains that `pack` output is already self-contained

### Requirement: Single-file option compatibility

The CLI SHALL distinguish default HTML-file mode from explicit directory mode and SHALL reject option combinations whose meanings conflict.

#### Scenario: Output in default mode

- **WHEN** a JSX build uses `--output` without `--single-file`
- **THEN** the CLI selects that destination for the default HTML artifact

#### Scenario: Directory output selection

- **WHEN** a JSX build supplies `--out-dir public/app`
- **THEN** the CLI selects directory mode instead of creating a sibling HTML artifact

#### Scenario: File and directory output conflict

- **WHEN** a JSX build combines `--output` with `--out-dir`
- **THEN** the CLI exits unsuccessfully and identifies the conflicting output modes

#### Scenario: Base without directory mode

- **WHEN** a JSX build supplies `--base /application/` without `--out-dir`
- **THEN** the CLI exits unsuccessfully and explains that `--base` is available only for directory builds

#### Scenario: Deprecated selector conflicts with directory mode

- **WHEN** a JSX build combines `--single-file` with `--out-dir` or `--base`
- **THEN** the CLI exits unsuccessfully and identifies the conflicting options

#### Scenario: Pack output omitted

- **WHEN** a user invokes `rtifact pack dist` without `--output`
- **THEN** the CLI exits unsuccessfully and explains that the destination HTML file is required

### Requirement: Isolated build configuration

The CLI SHALL build with its controlled inline configuration and SHALL NOT load a Vite configuration file merely because one exists in the current working directory or beside the input.

#### Scenario: Unrelated Vite configuration exists

- **WHEN** the CLI is invoked from a directory containing `vite.config.*`
- **THEN** the generated application uses the CLI's configuration without executing or merging the unrelated file

### Requirement: Build diagnostics

The CLI SHALL report input validation, compiler, and packaging failures with a non-zero exit status, SHALL retain original source paths in actionable diagnostics, and SHALL report the resolved file or directory destination after success.

#### Scenario: JSX syntax error

- **WHEN** the input module or a local dependency contains invalid JSX syntax
- **THEN** the CLI exits unsuccessfully and reports the originating source path and build error

#### Scenario: Successful build summary

- **WHEN** a build completes successfully
- **THEN** the CLI exits successfully and reports the resolved output file or directory

#### Scenario: Default packaging limitation

- **WHEN** a default HTML-file build cannot represent an application that uses an unsupported chunk, worker, runtime-loaded resource, or relative runtime fetch
- **THEN** the CLI identifies the incompatible feature and recommends retrying with `--out-dir dist`

### Requirement: Temporary workspace cleanup

The CLI SHALL avoid modifying the input source tree and SHALL remove its temporary generated application files after both successful and failed builds.

#### Scenario: Successful temporary build

- **WHEN** the build completes successfully
- **THEN** no generated HTML, mount module, or Tailwind entry remains in the input source directory

#### Scenario: Failed temporary build

- **WHEN** the build fails after its temporary workspace is created
- **THEN** the temporary workspace is cleaned without hiding the original build error
