# Dependency review

Last automated review: 2026-07-23

## Policy

- Runtime packages belong in `dependencies`; do not add a package when a small
  standard-library implementation is clearer and safer.
- Dependency pull requests must explain why the package is needed, review its
  maintenance and release history, and include the lockfile change.
- Run `npm audit` and `npm run verify` after dependency changes.
- Do not use `npm audit fix --force` without reviewing API and behavior changes.
- Review direct and transitive licenses before publication and after material
  dependency changes.
- Dependabot may propose updates, but updates require normal review and CI; they
  are never auto-merged.

## Current automated inventory

`npm audit --json` reported zero known vulnerabilities across 142 installed
packages. npm classified 98 as production dependencies and 45 as optional
dependencies; those categories can overlap.

Installed package license declarations:

| License | Packages |
| --- | ---: |
| MIT | 124 |
| MPL-2.0 | 12 |
| ISC | 3 |
| Apache-2.0 | 1 |
| BSD-3-Clause | 1 |
| 0BSD | 1 |

The MPL-2.0 entries are `lightningcss` and its platform-specific packages. This
inventory is evidence for review, not legal advice. A maintainer still needs to
confirm license obligations and notice handling before the first public release.
