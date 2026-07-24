## Why

Repository setup and first-release work accumulated duplicated checklists, dated
audit snapshots, maintainer-only files in the npm artifact, and a release gate
that checks unrelated repository paperwork. Cleaning these boundaries now keeps
the public repository understandable and makes the package and release checks
reflect what consumers actually need.

## What Changes

- Re-scope the open-source checklist to first-publication work and keep recurring
  release steps in the existing release guide.
- Move the beginner npm publishing guide and remaining first-publication material
  under `docs/maintainers/`.
- Exclude maintainer and community-process documents from the npm artifact while
  retaining consumer-facing package documentation and intentional examples.
- Narrow the readiness check to release-critical metadata, legal notices,
  changelog/version consistency, and forbidden tracked artifacts.
- Consolidate permanent dependency-review policy into contribution guidance and
  record time-sensitive audit results with individual releases instead of in a
  committed snapshot.
- Remove the redundant latest-Node-20 Linux CI job while preserving minimum
  supported Node, newer Node, and Windows coverage.
- Replace the unfinished conduct-reporting placeholder with an honest
  solo-maintainer policy: public issues for non-sensitive project concerns,
  GitHub abuse reporting for platform violations, and private vulnerability
  reporting only for security.
- Preserve existing CLI behavior, runtime dependencies, tests, package examples,
  and OpenSpec history.

## Capabilities

### New Capabilities

- `project-maintenance`: Defines repository documentation ownership, npm package
  documentation boundaries, local release-readiness checks, dependency-review
  records, CI coverage, and transparent solo-maintainer conduct reporting.

### Modified Capabilities

None.

## Impact

The change affects root and maintainer documentation, `package.json`,
`scripts/check-readiness.js`, the dependency-license reporting workflow, and the
GitHub Actions CI matrix. It reduces npm artifact contents and one CI job without
changing the `yolojsx` CLI, generated output, supported Node range, runtime
dependencies, or public application behavior. The conduct policy will explicitly
disclose that the solo maintainer does not offer confidential project conduct
reporting.
