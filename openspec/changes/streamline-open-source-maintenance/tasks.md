## 1. Organize Maintainer Documentation

- [x] 1.1 Create `docs/maintainers/`, move the current beginner publishing guide
  to `docs/maintainers/npm-publishing.md`, preserve its uncommitted approval
  revisions, and update inbound and internal links.
- [x] 1.2 Replace `OPEN_SOURCE_CHECKLIST.md` with a focused
  `docs/maintainers/first-public-release.md` containing only unfinished
  repository, account, legal, approval, and first-publication tasks; leave
  recurring release and recovery steps in `RELEASING.md`.
- [x] 1.3 Move durable dependency-change policy into `CONTRIBUTING.md`, document
  `npm run check:licenses` and release-bound audit evidence in `RELEASING.md` and
  the publishing approval template, then delete `DEPENDENCY_REVIEW.md`.
- [x] 1.4 Update README and repository documentation links so documents excluded
  from the npm artifact use canonical GitHub URLs and all moved-document links
  resolve.

## 2. Tighten Package and Local Release Checks

- [x] 2.1 Reduce the `package.json` files allowlist to runtime source, executable,
  intentional examples, README, license, changelog, and third-party notices.
- [x] 2.2 Narrow `scripts/check-readiness.js` to release-critical metadata,
  documents, changelog/version agreement, intended package contents, and
  forbidden tracked artifacts; remove collaboration-file and maintainer-document
  requirements and report success as local release checks.
- [x] 2.3 Extend packaged-artifact verification with the smallest assertion that
  required consumer/legal documents are present and excluded maintainer or
  community-process documents are absent.

## 3. Reduce Redundant CI

- [x] 3.1 Remove only the Ubuntu Node `20.x` matrix entry while retaining Ubuntu
  Node `20.19.0`, Node 22, Node 24, and Windows Node 22 verification.

## 4. Document Solo-Maintainer Conduct Routing

- [x] 4.1 Update `CODE_OF_CONDUCT.md` and the first-public-release checklist to
  disclose that no confidential conduct channel is available, route
  non-sensitive project concerns to public issues, route GitHub platform abuse
  to GitHub's reporting tools, keep vulnerabilities under `SECURITY.md`, and
  remove the unfinished private-channel requirement.
- [x] 4.2 Recheck Markdown links and stale conduct-reporting language, then run
  `git diff --check`, `npm run readiness`, and `npm run verify`.

## 5. Verify the Maintenance Boundary

- [x] 5.1 Search for stale filenames, broken relative Markdown links, dated
  dependency snapshots, and claims that local readiness validates external
  settings.
- [x] 5.2 Run `npm run check:licenses`, `npm run readiness`, and
  `npm run verify`.
- [x] 5.3 Run and inspect `npm pack --dry-run` and
  `npm publish --dry-run --access public --tag latest`; confirm the intended
  reduced file list and do not run a live publish command.
