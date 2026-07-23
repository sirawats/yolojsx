# Open-source and npm publication readiness

Use this checklist before making the repository public and before every npm
release. Check a box only when there is reviewable evidence such as a file,
command result, CI run, registry setting, or maintainer approval.

Last evaluated: 2026-07-23

## Current assessment

The local build and package verification are healthy, and repository-owned
community, CI, dependency, and publication safeguards are now present. The
project is not yet ready for its first public release because repository identity
metadata, private reporting, protected hosting settings, npm authentication, and
the final release record require maintainer or platform action.

Already confirmed:

- [x] MIT license is declared in `package.json` and shipped as `LICENSE`.
- [x] README, changelog, beginner npm publishing guide, release guide, examples,
  and third-party notices exist.
- [x] Supported Node.js versions and executable names are declared.
- [x] Package contents use an explicit `files` allowlist.
- [x] The CLI entry point is executable in Git.
- [x] `npm run verify` passes tests, syntax checks, package inspection, and the
  extracted-package smoke test.
- [x] Generated root HTML, `dist/`, tarballs, dependencies, and macOS metadata
  are ignored.
- [x] Contribution, conduct, security, support, dependency-review, issue, and
  pull-request guidance are present.
- [x] Cross-platform GitHub Actions CI and Dependabot configuration are present.
- [x] `npm run readiness` and `prepublishOnly` block publishing when repository
  identity or release metadata is incomplete.
- [x] The public npm registry had no `yolojsx` package on 2026-07-23.
- [x] `npm audit` reported zero known vulnerabilities on 2026-07-23.

First-public-release blockers:

- [x] Add `repository`, `homepage`, `bugs`, and maintainer identity metadata to
  `package.json`.
- [x] Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [ ] Decide whether `.agent/`, `.claude/`, `.codex/`, `AGENTS.md`, and archived
  OpenSpec records are intentionally public; remove internal-only material.
- [ ] Scan the full Git history for credentials, private URLs, personal data,
  generated artifacts, and oversized files.
- [x] Add CI configuration for supported Node.js lines on Linux and Windows.
- [ ] Run the CI workflow in the public host and make required jobs branch
  protection checks.
- [x] Confirm the `yolojsx` npm name is currently available or controlled by
  the maintainer.
- [ ] Configure an npm maintainer account, strong 2FA, and preferably trusted
  publishing from protected CI.
- [x] Complete an automated dependency vulnerability and license inventory.
- [ ] Complete the human license review, including MPL-2.0 obligations.
- [ ] Run the release-candidate dry run and clean-install smoke tests.
- [ ] Enable a private vulnerability and conduct-reporting channel.

## 1. Ownership, licensing, and public history

- [ ] Confirm every source file, example, theme adaptation, image, font, and
  document can legally be published under MIT.
- [ ] Confirm all contributors agreed to the repository license; decide whether
  a DCO or CLA is needed.
- [ ] Verify `LICENSE`, `package.json#license`, README, and repository hosting
  license detection all identify MIT.
- [ ] Re-audit `THIRD_PARTY_NOTICES.md` against every bundled or adapted source.
- [ ] Review dependency licenses separately from theme inspiration notices.
- [ ] Scan the current tree and full Git history with a secret scanner.
- [ ] Search for credentials, tokens, `.npmrc` files, private registry URLs,
  internal hostnames, email addresses, absolute local paths, and customer data.
- [ ] Review large blobs and generated files in history before publishing the
  repository; rewriting public history later is disruptive.
- [ ] Confirm no confidential issue references, commit messages, or archived
  design notes are being exposed.

## 2. Public repository essentials

- [x] `README.md` explains installation, CLI usage, examples, limitations,
  browser requirements, security implications, and license.
- [x] `CHANGELOG.md` records user-visible and breaking changes.
- [x] `RELEASING.md` documents maintainer release and recovery procedures.
- [x] `NPM_PUBLISHING_GUIDE.md` explains npm concepts, safe dry runs, first and
  later releases, account security, verification, and recovery for beginners.
- [x] Add `CONTRIBUTING.md` with setup, tests, style, issue, and pull-request
  expectations.
- [x] Add `CODE_OF_CONDUCT.md` with enforcement expectations and private
  reporting instructions.
- [x] Add `SECURITY.md` with supported versions, private reporting instructions,
  response expectations, and disclosure policy.
- [x] Add `SUPPORT.md`; defer governance, funding, and citation files until the
  project needs them.
- [x] Add issue and pull-request templates for the selected contribution flow.
- [ ] Enable the private reporting feature referenced by the conduct and security
  policies.
- [ ] Configure repository topics, description, homepage, default branch, and
  license detection.
- [ ] Enable branch protection, required CI, review requirements, and restricted
  release/environment permissions.
- [ ] Document which maintainers can merge, tag, publish, deprecate, or rotate
  credentials.

## 3. Source and build quality

- [x] Tests cover argument parsing, CLI behavior, output safety, packaging,
  examples, themes, and failure diagnostics.
- [x] Output replacement protections and `.yolojsx-output.json` ownership checks
  have dedicated tests.
- [x] Failed builds preserve prior output and report secondary cleanup failures
  without hiding the original error.
- [x] Configure CI on Node.js `20.19.x`, the latest Node.js 20 release, and
  current supported Node.js 22+ releases.
- [ ] Confirm those jobs pass on the public repository.
- [x] Configure a Windows CI job because executable shims, symlinks, paths,
  and rename behavior are platform-sensitive.
- [x] Configure a Linux CI job matching typical npm consumers.
- [x] Add and document the policy for dependency updates and lockfile review.
- [x] Run `npm audit` and record the result in `DEPENDENCY_REVIEW.md`.
- [ ] Review runtime error messages for sensitive path disclosure and actionable
  remediation.
- [ ] Verify no test depends on network access, local global packages, or
  maintainer-only files unless explicitly documented.
- [ ] Confirm a clean clone can run `npm ci` followed by `npm run verify`.

## 4. npm package metadata

- [x] `name`, `version`, `description`, `keywords`, `license`, `engines`, `bin`,
  dependencies, and `files` are present.
- [x] The package is not marked `"private": true`.
- [x] `yolojsx` points to the intended executable.
- [x] Add a canonical `repository` URL.
- [x] Add `homepage` and `bugs` URLs.
- [x] Add `author` or `contributors` with the level of public identity the
  maintainers intend to expose.
- [x] Set an explicit `publishConfig.registry` for
  `https://registry.npmjs.org/` to prevent publishing to the wrong registry.
- [ ] If the package becomes scoped, set public access deliberately and use
  `npm publish --access public` for its first public publication.
- [x] Confirm the package description and keywords match current default
  single-file behavior.
- [x] Ship release, community, security, dependency-review, examples, and
  checklist documentation through the explicit package allowlist.
- [x] Verify all runtime imports are in `dependencies`, while development-only
  tools are not accidentally required at runtime.
- [x] Confirm `0.1.0` follows SemVer and cannot collide with an
  already-published immutable npm version because `yolojsx` is unregistered.

## 5. Package contents and install behavior

- [x] `npm run pack:check` prints a reviewable package manifest.
- [x] `npm run verify:package` extracts the actual tarball and exercises the
  executable in global-bin and npm-exec layouts across all supported build modes.
- [x] Theme CSS, notices, examples, runtime source, and executable files are
  included.
- [x] Tests, local agent configuration, OpenSpec records, generated HTML,
  temporary directories, credentials, and dependency trees are excluded.
- [ ] Review `npm pack --dry-run` manually for every release candidate.
- [ ] Inspect the tarball itself with `npm pack` and `tar -tzf`, not only the
  working tree.
- [ ] Install the tarball in an empty directory without linking this checkout's
  `node_modules`.
- [ ] Test global installation and the executable from the installed tarball.
- [ ] Test the documented `npx` command against the tarball or a prerelease.
- [ ] Build each documented example from outside the repository.
- [ ] Open default HTML output through `file://` in supported browsers.
- [ ] Serve directory output and verify assets under both relative and custom
  base paths.
- [ ] Confirm uninstalling the package leaves no files outside npm-managed
  locations.

## 6. npm account and supply-chain security

- [x] `npm whoami --registry=https://registry.npmjs.org/` reports the intended
  `sirawats` maintainer account.
- [ ] Confirm the account controls the package name and has a verified email.
- [ ] Enable strong account 2FA; for interactive publishing, prefer the
  `auth-and-writes` mode.
- [ ] Prefer npm trusted publishing from a protected CI environment over a
  long-lived automation token.
- [ ] If a token is unavoidable, use a granular, least-privilege, expiring token
  stored only in the CI secret store.
- [x] Make the readiness check reject a tracked `.npmrc`; never commit OTPs,
  recovery codes, or registry tokens.
- [ ] Require approval for the production publishing environment.
- [x] Review third-party CI actions and configure Dependabot updates for action
  major versions.
- [ ] Enable provenance only in a supported CI environment; do not assume local
  `npm publish --provenance` can produce a valid statement.
- [ ] Verify the published npm page links provenance to the expected public
  repository and workflow.
- [ ] Ensure at least two trusted maintainers can recover the project without
  sharing credentials.

## 7. Release-candidate gate

Record the exact candidate being approved:

```text
Version:
Commit SHA:
Release tag:
Registry:
Dist-tag:
Reviewer:
Date:
```

- [ ] Working tree is clean and the release commit is pushed.
- [x] Version and changelog are final; no release remains under only
  `Unreleased`.
- [ ] `npm ci` succeeds from a clean clone.
- [ ] `npm run verify` succeeds on the release commit.
- [x] `npm audit` has no unreviewed findings.
- [x] `npm pack --dry-run` contains only intended files.
- [ ] The isolated tarball installation and browser smoke tests pass.
- [x] The registry returns E404 for `yolojsx`, so version `0.1.0` is unused.
- [x] `npm publish --dry-run` passes against the intended registry.
- [ ] The intended dist-tag is explicit: stable releases normally use `latest`;
  prereleases should use a tag such as `next`.
- [ ] A second maintainer or reviewer approves the tarball manifest, version,
  changelog, and publish command.

## 8. Publish

For the current unscoped package, a maintainer-driven stable publication is:

```sh
npm whoami --registry=https://registry.npmjs.org/
npm view yolojsx versions --json
npm run verify
npm publish --dry-run
npm publish
```

Adjust the final command deliberately:

- Use `npm publish --tag next` for a prerelease that must not become `latest`.
- Use `npm publish --access public` for the first public release of a scoped
  package.
- Use `npm publish --provenance` only from the configured supported CI publisher.

Before running the final command:

- [ ] Re-read the exact package name, version, registry, access, and dist-tag.
- [ ] Confirm no existing npm version will be overwritten; npm versions are
  immutable.
- [ ] Confirm the command is running from the intended clean checkout or CI
  artifact.
- [ ] Capture the publication URL and command result in the release record.

## 9. Post-publication verification

- [ ] Run `npm view yolojsx@<version>` and verify metadata, dist-tag, repository,
  license, engines, and executable declarations.
- [ ] Run `npm dist-tag ls yolojsx` and confirm the intended tag moved.
- [ ] Install `yolojsx@<version>` in a new empty directory from npm.
- [ ] Run `yolojsx --version`.
- [ ] Run the README's default file build and explicit directory build.
- [ ] Inspect the npm package page for README rendering, provenance, links, and
  third-party notices.
- [ ] Create and push the matching signed Git tag and public release notes.
- [ ] Announce only after registry installation and smoke tests pass.
- [ ] Monitor issue and security-report channels after release.

## 10. Broken-release response

- [ ] Stop announcements and identify the affected versions and dist-tags.
- [ ] Move `latest` back to the last known-good version when appropriate.
- [ ] Deprecate the broken version with a concise migration message.
- [ ] Publish a corrected patch rather than attempting to overwrite a version.
- [ ] Avoid unpublishing unless npm policy and the short post-publication window
  clearly permit and justify it.
- [ ] Document the incident, consumer impact, correction, and prevention work.

## Current npm references

These upstream npm sources were checked when this checklist was written:

- [npm publish command](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npm-publish.md)
- [npm profile and 2FA](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npm-profile.md)
- [Scoped package publication](https://github.com/npm/cli/blob/latest/docs/lib/content/using-npm/scope.md)
- [Package files and ignore behavior](https://github.com/npm/cli/wiki/Files-&-Ignores)
- [npm CLI provenance option](https://github.com/npm/cli/blob/latest/cli/workspaces/config/lib/definitions/definitions.js)

Recheck current npm documentation before each release because registry security
and publishing requirements change.
