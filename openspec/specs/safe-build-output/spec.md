# safe-build-output Specification

## Purpose

Define output path selection, ownership tracking, staged replacement, and safeguards that prevent Rtifact from destroying unrelated files.

## Requirements

### Requirement: Default HTML output

The CLI SHALL derive the default HTML destination from the JSX entry basename and place it beneath the invocation working directory when neither `--output` nor `--out-dir` is provided.

#### Scenario: Default output selection

- **WHEN** a user runs `rtifact Home.jsx` from `/workspace/site` without an output option
- **THEN** the resolved HTML destination is `/workspace/site/Home.html`

#### Scenario: Nested entry output selection

- **WHEN** a user runs `rtifact pages/Dashboard.jsx` from `/workspace/site` without an output option
- **THEN** the resolved HTML destination is `/workspace/site/Dashboard.html`

### Requirement: Configurable output directory

The CLI SHALL accept `-o <path>` and `--out-dir <path>` and resolve relative values from the invocation working directory.

#### Scenario: Relative custom output

- **WHEN** a user runs `rtifact Home.jsx --out-dir public/app` from `/workspace/site`
- **THEN** the resolved output directory is `/workspace/site/public/app`

#### Scenario: Absolute custom output

- **WHEN** a user provides a valid absolute output path
- **THEN** the CLI writes the application to that exact directory

### Requirement: Managed output replacement

The CLI SHALL identify output directories it generated through a valid `.rtifact-output.json` ownership marker and SHALL obtain explicit overwrite confirmation before replacing an existing managed directory unless `--force` is supplied.

#### Scenario: Rebuild managed output interactively

- **WHEN** the selected output contains a valid Rtifact ownership marker and `--force` is absent
- **THEN** the CLI prompts the user to type `yes` or `no` before replacing the directory

#### Scenario: Confirm managed replacement

- **WHEN** the user types `yes` at the managed-output prompt
- **THEN** the CLI may remove stale generated contents and replace them with the new successful build

#### Scenario: Decline managed replacement

- **WHEN** the user types `no` at the managed-output prompt
- **THEN** the CLI exits without changing the existing directory

#### Scenario: Force managed replacement

- **WHEN** the user supplies `--force` for an existing managed directory
- **THEN** the CLI replaces it without prompting after the replacement build succeeds

#### Scenario: First successful build

- **WHEN** the selected output is absent and the build succeeds
- **THEN** the CLI writes the application and a valid `.rtifact-output.json` ownership marker without prompting

### Requirement: Protection of unowned files

The CLI SHALL obtain explicit interactive confirmation before destructively cleaning a non-empty output directory it does not recognize as Rtifact-managed, or SHALL require `--force` when interactive confirmation is unavailable.

#### Scenario: Confirm unowned replacement

- **WHEN** the selected output is non-empty, has no valid Rtifact ownership marker, and the interactive user types `yes`
- **THEN** the CLI warns that the directory is unowned and may replace it after a successful build

#### Scenario: Decline unowned replacement

- **WHEN** the selected output is non-empty, has no valid Rtifact ownership marker, and the user types `no`
- **THEN** the CLI exits without deleting or overwriting its contents

#### Scenario: Non-interactive unowned directory

- **WHEN** the selected output is non-empty, unowned, stdin is not interactive, and `--force` is absent
- **THEN** the CLI refuses replacement and directs the user to `--force`

#### Scenario: Explicit forced replacement

- **WHEN** the selected output is a valid non-dangerous directory and the user supplies `--force`
- **THEN** the CLI may replace the directory without prompting after displaying that forced replacement is occurring

#### Scenario: Output from the previous product identity

- **WHEN** a non-empty output directory contains only an ownership marker written under the previous product identity
- **THEN** Rtifact treats the directory as unowned and applies the same confirmation or `--force` safeguards before replacement

### Requirement: Single-file destination validation

The CLI SHALL resolve single-file destinations from the invocation working directory, require an `.html` filename, and reject destinations that are directories or otherwise cannot safely represent one file.

#### Scenario: Relative explicit destination

- **WHEN** a user supplies `--output public/index.html`
- **THEN** the CLI resolves the destination beneath the invocation working directory and creates required parent directories without removing their other contents

#### Scenario: Non-HTML destination

- **WHEN** a user supplies an output filename that does not end in `.html`
- **THEN** the CLI rejects the destination before building or packaging

#### Scenario: Destination is a directory

- **WHEN** the resolved destination exists as a directory
- **THEN** the CLI rejects it even when `--force` is supplied and does not remove the directory

### Requirement: Existing single-file protection

The CLI SHALL obtain explicit interactive confirmation before replacing an existing destination file unless the user supplies `--force`.

#### Scenario: Confirm existing artifact replacement

- **WHEN** the selected HTML destination exists and the interactive user types `yes`
- **THEN** the CLI may replace it after the new artifact has been staged successfully

#### Scenario: Decline existing artifact replacement

- **WHEN** the selected HTML destination exists and the interactive user types `no`
- **THEN** the CLI exits without changing the existing file

#### Scenario: Non-interactive existing artifact

- **WHEN** the selected HTML destination exists, stdin is not interactive, and `--force` is absent
- **THEN** the CLI refuses replacement and directs the user to `--force`

#### Scenario: Existing artifact with force

- **WHEN** the selected HTML destination is an existing regular file and `--force` is supplied
- **THEN** the CLI may replace it without prompting after displaying that forced replacement is occurring

### Requirement: Atomic single-file publication

The CLI SHALL fully build, normalize, compress, and stage a single-file artifact before replacing its destination and SHALL preserve the previous successful destination when an earlier step fails.

#### Scenario: Direct build fails

- **WHEN** a direct single-file rebuild fails to compile or package
- **THEN** the existing destination remains unchanged and temporary output is cleaned

#### Scenario: Pack operation fails

- **WHEN** packaging an existing build fails validation or compression
- **THEN** the existing destination remains unchanged and no partial artifact is published

#### Scenario: Successful replacement

- **WHEN** a staged artifact is complete and destination replacement succeeds
- **THEN** no staging or backup file remains beside the destination

### Requirement: Pack input preservation

The `pack` command SHALL treat its source directory as read-only and SHALL reject an output path inside that source directory.

#### Scenario: Successful packaging

- **WHEN** `rtifact pack dist --output index.html` succeeds
- **THEN** every file and directory beneath `dist` remains unchanged

#### Scenario: Output inside source directory

- **WHEN** a user selects an output path within the directory being packaged
- **THEN** the CLI rejects the operation before writing output even when `--force` is supplied

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

### Requirement: Mutation-boundary output authorization

The CLI SHALL retain the filesystem identity and canonical destination observed
when replacement is authorized and SHALL revalidate that state immediately
before renaming or removing any destination. `--force` SHALL NOT bypass this
check.

#### Scenario: Authorized destination is swapped

- **WHEN** a directory or HTML destination changes identity, type, symbolic-link state, or canonical path after validation or confirmation
- **THEN** publication fails without renaming, removing, or following the replacement object

#### Scenario: Backup restoration also fails

- **WHEN** publication fails after the prior destination became a backup and restoring that backup also fails
- **THEN** the original publication failure remains primary, the recoverable backup is preserved, and the diagnostic identifies its path

### Requirement: Contained build preparation

The CLI SHALL run custom-theme evaluation, source discovery, Vite/Tailwind execution, normalization, and compression in a single-purpose child process whose working directory is its OS-temporary workspace. Every nested Vite workspace and prepared output SHALL remain beneath that parent-owned workspace. The child SHALL return bounded control metadata rather than artifact contents. The parent SHALL resolve the real workspace and prepared-output paths, reject symbolic-link ancestors and physical escapes, validate the prepared tree, and retain sole authority over final publication.

The current internal worker safeguards are a 120-second timeout and a 768 MiB V8 old-space ceiling. These values are implementation safeguards subject to evidence-based adjustment, not public compatibility guarantees or user-configurable options.

#### Scenario: Worker fails or exceeds a limit

- **WHEN** the worker times out, exits abnormally, is terminated by a signal or memory failure, returns malformed or oversized control data, or returns invalid prepared output
- **THEN** the parent exits unsuccessfully, preserves any previous destination, removes the worker workspace with bounded cleanup retries, and reports only bounded, control-character-sanitized failure information with credential-like environment values redacted and without copying raw child stderr

#### Scenario: Prepared output traverses a symbolic-link ancestor

- **WHEN** worker metadata names an output whose resolved path is outside the workspace or whose workspace-relative path traverses any symbolic-link ancestor
- **THEN** the parent rejects it before copying or publication

#### Scenario: Cleanup also fails

- **WHEN** publication or recovery fails and subsequent stage or workspace cleanup also fails
- **THEN** the publication or recovery error remains primary and the diagnostic appends cleanup context, including any recoverable backup path already reported
