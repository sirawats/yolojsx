# compressed-html-package Specification

## Purpose

Define how `yolojsx` converts a compatible application into one gzip-backed HTML artifact that validates, restores, and starts itself in a supported browser.

## Requirements

### Requirement: Self-contained compressed artifact
The packager SHALL produce one valid HTML file whose application payload is gzip-compressed and embedded within that file, and the artifact SHALL NOT require neighboring local files to start the packaged application.

#### Scenario: Package a compatible application
- **WHEN** the packager receives a compatible application containing HTML, JavaScript, CSS, and local build assets
- **THEN** it emits one HTML file containing a gzip payload and no references to required neighboring local files

#### Scenario: Compression is retained in the artifact
- **WHEN** the generated HTML file is inspected
- **THEN** the substantial application payload is represented as gzip-compressed bytes encoded for safe HTML embedding rather than as uncompressed source text

### Requirement: Browser-side application startup
The artifact SHALL use an embedded bootstrap to decompress and start the application through the browser's native `DecompressionStream` gzip support.

#### Scenario: Open through a local file URL
- **WHEN** a user opens the artifact through `file://` in a browser supporting `DecompressionStream("gzip")`
- **THEN** the bootstrap restores the document content and starts the packaged application without a web server

#### Scenario: Frontend stack remains functional
- **WHEN** the packaged application uses supplied React, Tailwind CSS, and Ant Design functionality
- **THEN** the restored application retains its rendering, generated utility styles, and component styling

#### Scenario: Browser lacks decompression support
- **WHEN** the artifact is opened in a browser without compatible native gzip decompression
- **THEN** the document displays a concise compatibility error instead of remaining blank

#### Scenario: Embedded payload is corrupt
- **WHEN** the bootstrap cannot decode, decompress, or parse its embedded payload
- **THEN** the document displays a concise loading error and does not execute a partial application

### Requirement: Versioned normalized payload
The packager SHALL normalize application markup, ordered styles, executable code, and metadata into a versioned payload with no unresolved required local resource references.

#### Scenario: Supported payload version
- **WHEN** the bootstrap restores a payload version it supports
- **THEN** it applies the payload fields in their defined order before starting the application

#### Scenario: Unsupported payload version
- **WHEN** the bootstrap encounters an unknown payload version
- **THEN** it reports an incompatible artifact error without executing the payload

### Requirement: Compatible build validation
The `pack` workflow SHALL validate that an input build can be represented by the supported single-file payload and SHALL reject it before creating output when required resources cannot be normalized.

#### Scenario: Compatible existing build
- **WHEN** the input directory has one HTML entry, a supported executable entry bundle, local styles, and convertible local assets
- **THEN** the packager normalizes and packages the build successfully

#### Scenario: Missing HTML entry
- **WHEN** the input directory does not contain a readable `index.html`
- **THEN** the packager exits unsuccessfully and identifies the missing entry

#### Scenario: Unsupported resource graph
- **WHEN** the input requires unresolved local references, additional executable chunks, workers, runtime-loaded WASM, or runtime-relative file reads
- **THEN** the packager exits unsuccessfully with a diagnostic identifying the unsupported resource

### Requirement: Packaging diagnostics
The CLI SHALL report the resolved artifact path after success and SHALL report packaging failures with a non-zero exit status.

#### Scenario: Successful package summary
- **WHEN** single-file packaging completes successfully
- **THEN** the CLI reports the resolved HTML output path and resulting file size

#### Scenario: Packaging fails
- **WHEN** normalization, compression, or publication fails
- **THEN** the CLI exits unsuccessfully with an actionable diagnostic and does not report success
