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
The CLI SHALL refuse to replace an existing destination file unless the user explicitly supplies `--force`.

#### Scenario: Existing artifact without force
- **WHEN** the selected HTML destination already exists and `--force` is absent
- **THEN** the CLI exits unsuccessfully without changing the existing file

#### Scenario: Existing artifact with force
- **WHEN** the selected HTML destination is an existing regular file and `--force` is supplied
- **THEN** the CLI may replace it after displaying that forced replacement is occurring

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
