## Context

The repository currently keeps all community, maintainer, and release documents
at its root and explicitly includes them in the npm package. The first-release
checklist repeats recurring release instructions, while the readiness script
requires repository collaboration files and requires those documents to ship in
the package. `DEPENDENCY_REVIEW.md` mixes durable policy with a dated audit
snapshot. CI tests both the minimum Node 20 version and the latest Node 20 patch,
and the conduct policy points to the vulnerability channel while admitting that
the reporting path is unfinished.

This is a repository-maintenance change. It must preserve the CLI, generated
artifacts, runtime dependencies, supported Node range, intentionally packaged
examples, and the user's existing uncommitted documentation edits.

## Goals / Non-Goals

**Goals:**

- Give each document one audience and one authoritative location.
- Keep the npm artifact limited to runtime files, examples, and documentation
  useful to package consumers.
- Make the readiness command accurately describe local, automatable release
  checks without implying that it verifies external hosting or account state.
- Preserve dependency-review policy without committing a snapshot that silently
  becomes stale.
- Keep meaningful minimum-version, newer-runtime, and Windows CI coverage with
  one fewer redundant job.
- Publish an honest solo-maintainer conduct policy with distinct routes for
  non-sensitive project concerns, GitHub platform abuse, and vulnerabilities.

**Non-Goals:**

- Change CLI behavior, generated HTML, themes, output safeguards, or package
  dependencies.
- Delete examples, OpenSpec specifications, archived OpenSpec changes, agent
  integrations, or GitHub issue templates.
- Add an npm publishing workflow or publish the package.
- Automate legal review, GitHub repository settings, npm account settings, or
  maintainer approval.
- Operate or promise a confidential project conduct-reporting channel.

## Decisions

### Separate repository conventions from maintainer tutorials

Keep conventional public documents at the root: `README.md`, `CHANGELOG.md`,
`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`,
`THIRD_PARTY_NOTICES.md`, and the concise `RELEASING.md`.

Move the beginner publishing tutorial to
`docs/maintainers/npm-publishing.md`. Replace the broad open-source checklist
with `docs/maintainers/first-public-release.md`, containing only unfinished
repository, account, legal, approval, and first-publication work. Recurring
release commands and recovery procedures remain authoritative in
`RELEASING.md`; the beginner guide may explain them but must link back rather
than create a second release checklist.

Keeping `RELEASING.md` at the root gives maintainers one short operational entry
point. Moving every maintainer document was rejected because it would hide the
canonical release procedure with no package-size benefit beyond changing the
allowlist.

### Publish only consumer-relevant documentation

The package allowlist will retain `bin`, `src`, `examples`, `README.md`,
`CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, and `LICENSE`. It will exclude release
instructions, first-publication state, contribution process, conduct process,
security reporting, support routing, and dependency-review records.

README links to excluded repository documents will use canonical GitHub URLs so
they remain usable from npm-rendered and installed-package contexts. The notices
link may stay relative because the notices remain in the artifact.

Shipping every repository document was rejected because npm consumers do not
need maintainer approval records or collaboration policy in the installed
package. Removing examples was also rejected because they are intentionally
packaged, documented, and exercised by package verification.

### Keep readiness local and release-critical

Retain the existing `readiness` command and prepublish hook to avoid unnecessary
script churn. Narrow its checks to:

- required package metadata and the intended public registry;
- release-critical files: README, license, changelog, and third-party notices;
- agreement between the package version and changelog release heading;
- inclusion of intended runtime and consumer/legal material in the package
  allowlist;
- exclusion of generated, sensitive, and forbidden tracked files.

The command will not require GitHub issue forms, CI configuration, maintainer
tutorials, community documents, branch protection, account 2FA, private
reporting settings, or approval. Its success message will say that local release
checks passed rather than declaring the whole repository open-source ready.

### Store dependency evidence with the release it describes

Move durable dependency rules into `CONTRIBUTING.md` and reference the existing
`npm run check:licenses` report from `RELEASING.md`. Delete
`DEPENDENCY_REVIEW.md`; record vulnerability and license report summaries,
dates, and reviewed exceptions in the frozen release approval record.

Generating and committing another inventory file was rejected because it would
still become stale between dependency changes and releases. Making the
informational license report part of every normal verification run was rejected
because it does not enforce a policy and would add noise without a new failure
condition.

### Reduce CI without weakening its useful dimensions

Remove only the Ubuntu `20.x` entry. Retain Ubuntu `20.19.0` as the declared
minimum, Ubuntu Node 22 and 24 for newer supported runtimes, and Windows Node 22
for platform-sensitive executable, path, rename, and symlink behavior.

### Use a transparent solo-maintainer fallback

`SECURITY.md` remains the route for private vulnerability reports.
`CODE_OF_CONDUCT.md` will direct non-sensitive project conduct concerns to a
public issue and direct harassment or other GitHub platform violations to
GitHub's abuse-reporting tools. It will explicitly state that the project does
not currently accept confidential conduct reports and warn reporters not to put
private details in public issues.

Using private vulnerability reporting for conduct was rejected because GitHub
security advisories are designed for vulnerabilities. Creating a new mailbox or
alias was rejected because the solo maintainer does not want another contact
channel. A dedicated project alias can be added later if confidential conduct
reporting becomes necessary.

## Risks / Trade-offs

- **README links break outside GitHub** → Use canonical repository URLs for
  documents excluded from the package and inspect npm dry-run output.
- **The smaller readiness gate misses external blockers** → Keep external
  account, hosting, legal, and approval work in the first-public-release guide
  and release record; describe readiness explicitly as local.
- **Dependency audit evidence is lost** → Copy current and future results into
  the release approval record before deleting the dated snapshot.
- **A reduced CI matrix misses a Node 20 patch regression** → Keep the exact
  supported floor, which is the higher-value compatibility boundary.
- **A sensitive conduct concern has no private project route** → Disclose the
  limitation, prohibit sensitive details in public issues, and point platform
  abuse to GitHub's reporting tools.

## Migration Plan

1. Create the maintainer documentation directory, move the beginner guide, and
   replace the broad checklist with the focused first-public-release document.
2. Consolidate dependency policy and update all repository links before deleting
   the dated dependency review.
3. Update the package allowlist and narrow the readiness implementation.
4. Remove the redundant CI matrix entry.
5. Update the conduct policy with the documented solo-maintainer reporting
   routes and confidentiality limitation.
6. Run local readiness, full verification, and npm publish dry-run; inspect that
   package contents and links match the new boundary.

Rollback is a normal Git revert: no registry publication, external data
migration, or runtime format change is part of this work.
