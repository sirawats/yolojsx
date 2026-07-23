## MODIFIED Requirements

### Requirement: Managed output replacement
The CLI SHALL identify output directories it generated and SHALL obtain explicit overwrite confirmation before replacing an existing managed directory unless `--force` is supplied.

#### Scenario: Rebuild managed output interactively
- **WHEN** the selected output contains a valid `yolojsx` ownership marker and `--force` is absent
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
- **THEN** the CLI writes the application and a valid ownership marker without prompting

### Requirement: Protection of unowned files
The CLI SHALL obtain explicit interactive confirmation before destructively cleaning a non-empty output directory it does not recognize as managed, or SHALL require `--force` when interactive confirmation is unavailable.

#### Scenario: Confirm unowned replacement
- **WHEN** the selected output is non-empty, has no valid ownership marker, and the interactive user types `yes`
- **THEN** the CLI warns that the directory is unowned and may replace it after a successful build

#### Scenario: Decline unowned replacement
- **WHEN** the selected output is non-empty, has no valid ownership marker, and the user types `no`
- **THEN** the CLI exits without deleting or overwriting its contents

#### Scenario: Non-interactive unowned directory
- **WHEN** the selected output is non-empty, unowned, stdin is not interactive, and `--force` is absent
- **THEN** the CLI refuses replacement and directs the user to `--force`

#### Scenario: Explicit forced replacement
- **WHEN** the selected output is a valid non-dangerous directory and the user supplies `--force`
- **THEN** the CLI may replace the directory without prompting after displaying that forced replacement is occurring

## ADDED Requirements

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
- **WHEN** `yolojsx pack dist --output index.html` succeeds
- **THEN** every file and directory beneath `dist` remains unchanged

#### Scenario: Output inside source directory
- **WHEN** a user selects an output path within the directory being packaged
- **THEN** the CLI rejects the operation before writing output even when `--force` is supplied
