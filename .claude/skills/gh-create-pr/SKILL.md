---
name: gh-create-pr
description: Create GitHub pull requests with gh after reading repository PR templates and reviewing the current branch's committed diff against an explicit target branch or master. Use when the user asks to open, create, or submit a PR, or to prepare a compact review-ready PR title and description from branch changes.
---

# Create GitHub Pull Request

## Workflow

Batch every independent read-only CLI inspection into one Bash tool call with newline-separated commands. Include `git`, `gh`, `rg`, and file-reading commands that can run with the inputs currently known; do not spend one tool call per command. When the diff reveals additional files to inspect, batch those reads into one follow-up Bash call. Keep state-changing operations such as fetch, push, temporary-file writes, and `gh pr create` separate.

1. Establish the PR scope.
   - Require a Git repository, an authenticated `gh`, and a named current branch.
   - Use the user's target branch when provided; otherwise use `master`.
   - Resolve the freshest available base ref, preferring `origin/<base>` after fetching it when an `origin` remote exists, then falling back to the local branch.
   - Check whether the current branch already has an open PR. Do not create a duplicate; return its URL and ask before changing it.

2. Read repository instructions and the PR template before drafting.
   - Locate tracked templates with `git ls-files | rg -i '(^|/)(pull_request_template\.md|pull_request_template/.*\.md)$'`.
   - Use the user's selected template. If there is one unambiguous default, use it. If multiple specialized templates apply and the choice changes the body, ask which one to use.
   - Treat the template as the body schema: preserve meaningful headings and required checklists, follow its comments, fill applicable fields, and remove irrelevant placeholder text.

3. Inspect the committed branch delta, not only the working tree. Run these and the read-only checks from steps 1-2 together in one Bash execution after resolving the base ref.

   ```bash
   git status --short
   git log --oneline <base-ref>..HEAD
   git diff --stat <base-ref>...HEAD
   git diff --name-status <base-ref>...HEAD
   git diff <base-ref>...HEAD
   ```

   Read the changed implementation, tests, specs, and documentation needed to explain behavior accurately. If the working tree is dirty, state that uncommitted changes are excluded from the PR.

4. Draft a compact title and body.
   - Follow repository title conventions when they exist; otherwise use a concise imperative title that names the outcome.
   - Explain why the change exists, the reviewer-visible behavior, and the important implementation choices.
   - Group related changes instead of listing every file or commit.
   - Report exact validation commands and outcomes. Say `Not run` with a reason when applicable.
   - Mention breaking behavior, migrations, configuration, dependencies, security/data effects, deployment steps, screenshots, or follow-ups only when the diff makes them relevant.
   - Prefer roughly 100-300 words unless the template or change genuinely needs more.

   When no template exists, use only:

   ```markdown
   ## Summary

   - <what changed and why>
   - <important behavior or implementation detail>

   ## Validation

   - `<command>` — <result>
   ```

5. Run the PR-quality checklist before creation.
   - [ ] Base and head branches are correct, distinct, and based on the committed three-dot diff.
   - [ ] No open PR already exists for the head branch.
   - [ ] Title is specific, scoped, and consistent with repository conventions.
   - [ ] Body covers every material behavior change and explains why it matters.
   - [ ] Repository template headings, required fields, and applicable checkboxes are complete.
   - [ ] Tests and checks are reported truthfully; skipped validation has a reason.
   - [ ] Relevant risks, compatibility concerns, migrations, config/dependency changes, and UI evidence are included.
   - [ ] Description contains no secrets, credentials, debug output, vague filler, or raw file inventory.
   - [ ] Ready versus draft status matches the user's request and the actual state of the work.

6. Create the PR.
   - Ensure `HEAD` is available on a remote. Use the existing upstream; if none exists and the correct push remote is ambiguous, ask before pushing.
   - Write the reviewed body to a temporary file to avoid shell-quoting damage.
   - If the user asked only for a draft description, stop after presenting it. Otherwise run:

   ```bash
   gh pr create --base <base> --title <title> --body-file <body-file>
   ```

   Add `--draft` only when requested. Do not add reviewers, labels, assignees, milestones, or projects unless requested. Return the created PR URL and any validation gaps.
