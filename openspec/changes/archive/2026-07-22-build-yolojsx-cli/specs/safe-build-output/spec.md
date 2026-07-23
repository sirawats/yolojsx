## ADDED Requirements

### Requirement: Default output directory
The CLI SHALL use a `dist` directory beneath the invocation working directory when no output option is provided.

#### Scenario: Default output selection
- **WHEN** a user runs `yolojsx Home.jsx` from `/workspace/site` without an output option
- **THEN** the resolved output directory is `/workspace/site/dist`

### Requirement: Configurable output directory
The CLI SHALL accept `-o <path>` and `--out-dir <path>` and resolve relative values from the invocation working directory.

#### Scenario: Relative custom output
- **WHEN** a user runs `yolojsx Home.jsx --out-dir public/app` from `/workspace/site`
- **THEN** the resolved output directory is `/workspace/site/public/app`

#### Scenario: Absolute custom output
- **WHEN** a user provides a valid absolute output path
- **THEN** the CLI writes the application to that exact directory

### Requirement: Managed output replacement
The CLI SHALL identify output directories it generated and SHALL replace stale contents in an identified managed directory during a later successful build.

#### Scenario: Rebuild managed output
- **WHEN** the selected output contains a valid `yolojsx` ownership marker from an earlier build
- **THEN** the CLI may remove stale generated contents and replace them with the new successful build

#### Scenario: First successful build
- **WHEN** the selected output is absent or empty and the build succeeds
- **THEN** the CLI writes the application and a valid ownership marker

### Requirement: Protection of unowned files
The CLI SHALL refuse to destructively clean a non-empty output directory it does not recognize as managed unless the user supplies `--force`.

#### Scenario: Non-empty unowned directory
- **WHEN** the selected output is non-empty, has no valid ownership marker, and `--force` is absent
- **THEN** the CLI exits unsuccessfully before deleting or overwriting its contents

#### Scenario: Explicit forced replacement
- **WHEN** the selected output is a valid non-dangerous directory and the user supplies `--force`
- **THEN** the CLI may replace the directory after displaying that forced replacement is occurring

### Requirement: Dangerous output rejection
The CLI SHALL reject output targets whose cleanup could erase the filesystem root, the invocation working directory, the input file, or an ancestor directory containing the input.

#### Scenario: Working directory selected as output
- **WHEN** the resolved output directory equals the invocation working directory
- **THEN** the CLI rejects the build before performing filesystem mutations

#### Scenario: Source ancestor selected as output
- **WHEN** the resolved output directory contains the input source file
- **THEN** the CLI rejects the build even when `--force` is supplied

### Requirement: Preserve last successful output on compilation failure
The CLI SHALL avoid deleting a managed output's last successful build before a replacement build has completed successfully.

#### Scenario: Rebuild fails to compile
- **WHEN** an existing managed output is selected and the new build fails
- **THEN** the previous successful output remains available and the CLI reports the failure
