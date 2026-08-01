## MODIFIED Requirements

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
