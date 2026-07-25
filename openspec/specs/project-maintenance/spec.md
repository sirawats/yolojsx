# project-maintenance Specification

## Purpose

Define the repository's public maintenance documents, release checks, package contents, dependency evidence, CI coverage, and conduct-reporting boundaries.

## Requirements

### Requirement: Documentation has a single maintenance purpose
The repository SHALL keep conventional public project documents and the concise
recurring release guide at the root, SHALL keep beginner and first-publication
material under `docs/maintainers/`, and SHALL avoid maintaining a second
recurring release checklist.

#### Scenario: Maintainer starts a recurring release
- **WHEN** a maintainer prepares a release after initial repository setup
- **THEN** `RELEASING.md` provides the canonical recurring checklist without
  requiring the first-publication checklist

#### Scenario: First-time maintainer needs detailed help
- **WHEN** a maintainer is unfamiliar with npm publishing
- **THEN** the root release guide links to the beginner guide under
  `docs/maintainers/`

### Requirement: npm artifact contains consumer-relevant material
The package allowlist SHALL include runtime source, the executable, intentional
examples, README, license, changelog, and third-party notices, and SHALL exclude
maintainer procedures, first-publication state, dependency-review records, and
community-process documents.

#### Scenario: Package contents are inspected
- **WHEN** `npm pack --dry-run` inspects a release candidate
- **THEN** the intended consumer and legal files are present and maintainer-only
  or community-process documents are absent

#### Scenario: npm README links to repository guidance
- **WHEN** a user follows a README link to contribution, support, security,
  conduct, or release guidance outside the package
- **THEN** the link resolves to the canonical public repository document

### Requirement: Readiness reports only local release checks
The readiness command SHALL validate local release-critical metadata, files,
version consistency, package allowlist contents, and forbidden tracked
artifacts, and SHALL NOT claim to validate external hosting, account, approval,
or reporting-channel state.

#### Scenario: Local release inputs are valid
- **WHEN** all local release-critical checks pass
- **THEN** readiness succeeds with a message limited to local release checks

#### Scenario: Repository collaboration files change
- **WHEN** an issue form, pull-request template, or maintainer tutorial is moved
  or removed without changing package-critical inputs
- **THEN** readiness does not fail solely because of that collaboration change

#### Scenario: Release metadata is inconsistent
- **WHEN** the package version lacks a matching changelog release heading
- **THEN** readiness fails before publication with an actionable message

### Requirement: Dependency review evidence is release-bound
The repository SHALL keep durable dependency policy in contribution guidance,
SHALL provide the existing license-report command to maintainers, and SHALL
record dated vulnerability and license review results with the release candidate
instead of in a standing inventory document.

#### Scenario: Dependency policy is reviewed
- **WHEN** a contributor changes dependencies
- **THEN** contribution guidance states the required lockfile, vulnerability,
  license, verification, and review expectations

#### Scenario: Release dependency evidence is recorded
- **WHEN** a release candidate receives approval
- **THEN** its approval record contains the audit date, results, reviewed license
  exceptions, and any accepted findings for that exact candidate

### Requirement: CI covers meaningful supported environments
CI SHALL test the minimum supported Node 20 version, newer supported Node
versions, and a Windows environment without duplicating the latest Node 20 line.

#### Scenario: CI matrix runs
- **WHEN** a push or pull request triggers verification
- **THEN** the matrix includes Node 20.19.0, newer Node lines, and Windows but no
  separate Ubuntu `20.x` job

### Requirement: Conduct reporting reflects solo-maintainer capacity
The code-of-conduct policy SHALL state that the project does not currently
accept confidential conduct reports, SHALL direct non-sensitive project concerns
to a public issue, SHALL direct GitHub platform abuse to GitHub's abuse-reporting
tools, and SHALL reserve private vulnerability reporting for security issues.

#### Scenario: Contributor has a non-sensitive project concern
- **WHEN** a contributor can describe a conduct concern without private or
  sensitive details
- **THEN** the policy directs them to open a public issue

#### Scenario: Contributor experiences GitHub platform abuse
- **WHEN** conduct may violate GitHub's platform policies
- **THEN** the policy directs the contributor to GitHub's abuse-reporting tools

#### Scenario: Contributor needs confidentiality
- **WHEN** a conduct report would require confidential or sensitive details
- **THEN** the policy discloses that no private project channel is available and
  does not instruct the contributor to publish those details or misuse security
  vulnerability reporting
