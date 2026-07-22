# jsx-app-build Specification

## Purpose

Define how the `yolojsx` CLI accepts one JSX component and produces an isolated, deployable static React application with actionable diagnostics.

## Requirements

### Requirement: CLI invocation
The package SHALL expose a `yolojsx` executable that supports a JSX build form accepting exactly one JSX entry path and a `pack` form accepting exactly one build-directory path, and SHALL support invocation after global installation and through `npx yolo-jsx`.

#### Scenario: Build through the global executable
- **WHEN** a user runs `yolojsx Home.jsx` after installing the package globally
- **THEN** the CLI builds `Home.jsx` as the application entry

#### Scenario: Build through npx
- **WHEN** a user runs `npx yolo-jsx Home.jsx`
- **THEN** the package executes the same build behavior as the global executable

#### Scenario: Pack an existing build
- **WHEN** a user runs `yolojsx pack dist --output index.html`
- **THEN** the CLI packages the compatible application in `dist` into `index.html`

#### Scenario: Missing entry argument
- **WHEN** a user invokes a build or pack form without its required input path
- **THEN** the CLI prints concise usage information and exits with a non-zero status

### Requirement: JSX component entry
The CLI SHALL accept an existing `.jsx` module whose default export is a React component and SHALL render that component into a generated application root.

#### Scenario: Default-exported component
- **WHEN** the entry module default-exports a valid React component
- **THEN** the generated application mounts that component into the generated HTML document

#### Scenario: Invalid entry path
- **WHEN** the entry does not exist, is not a readable file, or does not use the supported extension
- **THEN** the CLI rejects the build before creating output and identifies the invalid entry

#### Scenario: Missing usable default export
- **WHEN** the entry cannot be built as a default-exported React component
- **THEN** the CLI exits unsuccessfully and reports the entry-module problem

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

### Requirement: Isolated build configuration
The CLI SHALL build with its controlled inline configuration and SHALL NOT load a Vite configuration file merely because one exists in the current working directory or beside the input.

#### Scenario: Unrelated Vite configuration exists
- **WHEN** the CLI is invoked from a directory containing `vite.config.*`
- **THEN** the generated application uses the CLI's configuration without executing or merging the unrelated file

### Requirement: Build diagnostics
The CLI SHALL report input validation and compiler failures with a non-zero exit status and SHALL retain original source paths in actionable diagnostics.

#### Scenario: JSX syntax error
- **WHEN** the input module or a local dependency contains invalid JSX syntax
- **THEN** the CLI exits unsuccessfully and reports the originating source path and build error

#### Scenario: Successful build summary
- **WHEN** a build completes successfully
- **THEN** the CLI exits successfully and reports the resolved output directory

### Requirement: Temporary workspace cleanup
The CLI SHALL avoid modifying the input source tree and SHALL remove its temporary generated application files after both successful and failed builds.

#### Scenario: Successful temporary build
- **WHEN** the build completes successfully
- **THEN** no generated HTML, mount module, or Tailwind entry remains in the input source directory

#### Scenario: Failed temporary build
- **WHEN** the build fails after its temporary workspace is created
- **THEN** the temporary workspace is cleaned without hiding the original build error
