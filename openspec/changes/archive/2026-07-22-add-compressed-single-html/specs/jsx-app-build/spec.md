## MODIFIED Requirements

### Requirement: CLI invocation
The package SHALL expose a `yolojsx` executable that supports a JSX build form accepting exactly one JSX entry path and a `pack` form accepting exactly one build-directory path, and SHALL support invocation after global installation and through `npx yolojsx`.

#### Scenario: Build through the global executable
- **WHEN** a user runs `yolojsx Home.jsx` after installing the package globally
- **THEN** the CLI builds `Home.jsx` as the application entry

#### Scenario: Build through npx
- **WHEN** a user runs `npx yolojsx Home.jsx`
- **THEN** the package executes the same build behavior as the global executable

#### Scenario: Pack an existing build
- **WHEN** a user runs `yolojsx pack dist --output index.html`
- **THEN** the CLI packages the compatible application in `dist` into `index.html`

#### Scenario: Missing entry argument
- **WHEN** a user invokes a build or pack form without its required input path
- **THEN** the CLI prints concise usage information and exits with a non-zero status

### Requirement: Deployable static application
The standard directory-build form SHALL produce a static application containing an HTML entry and all JavaScript, CSS, and module-graph assets required to render the component.

#### Scenario: Successful production directory build
- **WHEN** a valid component is built without `--single-file`
- **THEN** the output contains an `index.html` that references production assets within the output directory

#### Scenario: Relative module and asset imports
- **WHEN** the entry imports local modules or assets using relative paths
- **THEN** the build resolves those imports relative to their original source modules and includes their required output

#### Scenario: Portable default base
- **WHEN** the user does not specify a public base path for a directory build
- **THEN** generated asset references use a relative base suitable for serving the output beneath an arbitrary path

#### Scenario: Custom public base
- **WHEN** the user supplies `--base /application/` for a directory build
- **THEN** generated public asset references use `/application/` as the build base

## ADDED Requirements

### Requirement: Direct single-file build selection
The JSX build form SHALL accept `--single-file` to build and package the component as one HTML file without retaining an intermediate output directory.

#### Scenario: Default single-file name
- **WHEN** a user runs `yolojsx Home.jsx --single-file` from a working directory
- **THEN** the CLI creates `Home.html` in that working directory

#### Scenario: Nested entry default name
- **WHEN** a user runs `yolojsx pages/Dashboard.jsx --single-file`
- **THEN** the CLI creates `Dashboard.html` in the invocation working directory

#### Scenario: Explicit single-file name
- **WHEN** a user runs `yolojsx Home.jsx --single-file --output index.html`
- **THEN** the CLI creates `index.html` at the path resolved from the invocation working directory

#### Scenario: No retained intermediate directory
- **WHEN** a direct single-file build succeeds
- **THEN** temporary Vite output is cleaned and no `dist` directory is created solely for that build

### Requirement: Single-file option compatibility
The CLI SHALL reject option combinations whose directory-output and file-output meanings conflict.

#### Scenario: Output without single-file mode
- **WHEN** a JSX build uses `--output` without `--single-file`
- **THEN** the CLI exits unsuccessfully and explains that `--output` selects a single HTML artifact

#### Scenario: Directory output with single-file mode
- **WHEN** a JSX build combines `--single-file` with `--out-dir` or `--base`
- **THEN** the CLI exits unsuccessfully and identifies the conflicting options

#### Scenario: Pack output omitted
- **WHEN** a user invokes `yolojsx pack dist` without `--output`
- **THEN** the CLI exits unsuccessfully and explains that the destination HTML file is required
