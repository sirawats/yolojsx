# First public release

Use this checklist only for the repository's first public GitHub and npm
release. [RELEASING.md](../../RELEASING.md) remains the recurring release
checklist, and [npm-publishing.md](npm-publishing.md) explains the npm workflow
for first-time maintainers.

Current candidate: `rtifact@0.1.2`.

## Repository and legal review

- [ ] Decide whether `.agent/`, `.claude/`, `.codex/`, `AGENTS.md`, and archived
      OpenSpec records are intentionally public.
- [ ] Scan the full Git history for credentials, private URLs, personal data,
      generated artifacts, and oversized files.
- [ ] Confirm every source file, example, theme adaptation, document, and
      contributor can be published under the declared MIT license.
- [ ] Re-audit `THIRD_PARTY_NOTICES.md` and complete the human dependency-license
      review, including MPL-2.0 obligations.
- [ ] Confirm repository license detection reports MIT.

## GitHub configuration

- [ ] Configure the repository description, topics, homepage, default branch,
      and license detection.
- [ ] Run CI on the public host and make the required verification job a branch
      protection check.
- [ ] Configure merge, review, tag, and release permissions.
- [ ] Enable GitHub private vulnerability reporting.
- [x] Confirm `CODE_OF_CONDUCT.md` discloses that confidential project reports
      are unavailable and routes GitHub platform abuse to GitHub's reporting tools.

## npm account and recovery

- [ ] Confirm the publishing account has a verified email and controls the
      `rtifact` name.
- [ ] Enable strong account 2FA.
- [ ] Prefer trusted publishing from a protected CI environment; otherwise use
      a granular, expiring token stored only in the CI secret store.
- [ ] Ensure a second trusted maintainer can recover the project, or document the
      solo-maintainer recovery policy.
- [ ] Configure provenance only if the selected publishing environment supports
      it.

## Approve the first candidate

- [ ] Complete every check in `RELEASING.md` from a clean clone.
- [ ] Record `npm audit` and `npm run check:licenses` dates, summaries, reviewed
      exceptions, and accepted findings with the exact release candidate.
- [ ] Confirm `npm pack --dry-run` and `npm publish --dry-run` contain only the
      intended files for the version in `package.json`.
- [ ] Complete isolated tarball installation and browser smoke tests.
- [ ] Record approval for the exact version and commit using the template in
      `npm-publishing.md`.
- [ ] Obtain independent approval, or record the solo-maintainer exception and a
      second-pass self-review without inventing another reviewer.

## Publish and verify

- [ ] Follow `npm-publishing.md` for the live publication; do not publish merely
      to test the command.
- [ ] Verify registry metadata, dist-tags, executable behavior, README rendering,
      links, and third-party notices.
- [ ] Install the exact public version in an empty directory and run both output
      modes.
- [ ] Create the matching signed Git tag and release notes only after registry
      verification succeeds.

After the first release is verified, remove this checklist; Git and the release
approval record retain the historical evidence.
