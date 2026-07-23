## MODIFIED Requirements

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
The JSX build form SHALL build and package the component as one HTML file by default without retaining an intermediate output directory, SHALL accept `--output` to select its destination, and SHALL temporarily accept `--single-file` as a deprecated compatibility alias for the default mode.

#### Scenario: Default single-file name
- **WHEN** a user runs `yolojsx Home.jsx` from a working directory
- **THEN** the CLI creates `Home.html` in that working directory

#### Scenario: Nested entry default name
- **WHEN** a user runs `yolojsx pages/Dashboard.jsx`
- **THEN** the CLI creates `Dashboard.html` in the invocation working directory

#### Scenario: Explicit single-file name
- **WHEN** a user runs `yolojsx Home.jsx --output index.html`
- **THEN** the CLI creates `index.html` at the path resolved from the invocation working directory

#### Scenario: Deprecated explicit selection
- **WHEN** a user runs `yolojsx Home.jsx --single-file`
- **THEN** the CLI creates `Home.html` and writes a deprecation warning identifying the now-default behavior

#### Scenario: No retained intermediate directory
- **WHEN** a default HTML-file build succeeds
- **THEN** temporary Vite output is cleaned and no `dist` directory is created solely for that build

### Requirement: Single-file option compatibility
The CLI SHALL distinguish default HTML-file mode from explicit directory mode and SHALL reject option combinations whose meanings conflict.

#### Scenario: Output in default mode
- **WHEN** a JSX build uses `--output public/index.html` without `--single-file`
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
- **WHEN** a user invokes `yolojsx pack dist` without `--output`
- **THEN** the CLI exits unsuccessfully and explains that the destination HTML file is required

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
