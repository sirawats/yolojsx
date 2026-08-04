# Rtifact build quality checklist

Use this checklist when a change can affect how the `rtifact` CLI turns an
entry such as `Sample.jsx` and an optional theme into its build output.

- **Build output** is the generated portable HTML file, self-contained HTML
  file, or deployable output directory.
- **Build process** is the complete path from CLI argument and input validation
  through theme and dependency discovery, Vite and Tailwind processing,
  normalization, compression, publication, bootstrap, diagnostics, and cleanup.

The checklist protects users from process crashes and hangs, unreasonable CPU
or memory use, unintended code or configuration loading, path escape, input or
unrelated-file mutation, lost previous output, and incomplete or corrupt
artifacts.

See [rtifact-html-build.md](./rtifact-html-build.md) for the detailed build flow.
Limits and public behavior belong in code and OpenSpec; do not duplicate their
numeric values here.

## How to use this document

1. Apply the short release-blocker list to every build change.
2. Apply only the change-scoped section matching the phases touched.
3. Run periodic stress audits separately; missing periodic evidence does not by
   itself block an unrelated pull request.

An unchecked item blocks release only when it is an applicable release blocker,
or when the change touched that behavior and lacks the focused evidence required
below. A demonstrated fatal defect always blocks release. A theoretical concern
must first be reproduced or measured before it is classified as a defect.

## Release blockers

- [ ] Reads and recursive discovery are limited to the intended input and
      reachable dependency graph, with explicit file-count, per-item, and
      aggregate bounds where user input can cause growth.
- [ ] Representation expansion is rejected before it can cause unreasonable
      memory or CPU use; small bounded input cannot multiply into effectively
      unbounded buffered output.
- [ ] Entry, theme, pack input, and unrelated files remain unchanged after
      success and failure.
- [ ] Input and output paths reject invalid types, path escape, and symbolic-link
      boundary crossing. `--force` bypasses confirmation only.
- [ ] User Vite configuration, environment files, and public assets are not
      loaded implicitly.
- [ ] Vite writes only to a temporary workspace; publication begins only after
      a complete output and required ownership metadata exist.
- [ ] Replacing output is authorized again at the mutation boundary, and a
      failed rebuild does not remove the previous successful output.
- [ ] A failed publication preserves either the previous output at its
      destination or a clearly identified recoverable backup.
- [ ] Portable output contains every required local resource or rejects the
      unsupported build before publication.
- [ ] Payload and bootstrap validation fail visibly before restoring partial
      document state or executing application code.
- [ ] Fatal failures exit non-zero without a success path or byte count, and
      diagnostics do not expose source contents, credentials, environment
      values, or unrelated filesystem data.
- [ ] Every changed blocker has one focused failure test that would fail if its
      protection were removed.

## Change-scoped checks

Apply the rows for the phases changed. Do not require unrelated rows merely
because they are in this document.

| Changed area                           | Required evidence                                                                                                                                                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry, theme, or source discovery      | Only reachable JavaScript and TypeScript sources enter discovery; unrelated siblings and `node_modules` do not widen Tailwind scanning; the selected theme is included explicitly; changing or oversized reads fail safely before Tailwind and leave no output. |
| Vite configuration or production build | Programmatic builds remain isolated from neighboring config, environment, and public files; package dependencies enter the production resource budget; default HTML, `--self-contained`, and `--out-dir` retain their intended runtime behavior.                |
| Asset handling or portable packaging   | Required local HTML, CSS, JavaScript, fonts, images, and other assets resolve inside the build; missing or unsupported resources fail before publication; repeated references cannot bypass the normalized-size budget; `pack` leaves its input unchanged.      |
| JavaScript compatibility validation    | Use bundle structure or explicit syntax checks only for behavior the CLI can reliably identify. JSX and custom code remain trusted local code; do not claim that static inspection proves the absence of arbitrary aliased runtime APIs.                        |
| Output validation or publication       | Managed, unowned, file, directory, missing-parent, symlink-swap, stage-failure, and rollback behavior remain covered for each changed output mode. Success cleans stages/backups; failure preserves recovery data.                                              |
| Bootstrap or payload format            | Version and complete payload shape are validated before DOM restoration; corrupt data, unsupported import maps, script termination attempts, and module-load failures fail closed with a visible message.                                                       |
| Diagnostics or cleanup                 | Relevant source path and cause remain available without code frames or secret content; cleanup failure does not hide the primary failure; safety errors never recommend `--force`.                                                                              |
| Dependencies or release packaging      | Package contents, supported Node versions, licenses, audit results, and compiled CLI behavior are checked.                                                                                                                                                      |

## Resource-budget guidance

- Put each limit at the shared boundary used by every affected output mode.
- Bound both input and the next larger representation. Account for decoded text,
  transforms, data URLs, normalized JSON, gzip, base64, and final HTML when they
  can coexist.
- Check projected size while constructing an expanding representation when a
  final size check would occur too late.
- Count a physical input once and reuse an approved snapshot when two phases
  must observe identical contents.
- Generate large fixtures during tests and remove them with `t.after(...)`; do
  not commit large binaries or generated output.
- Prefer one focused boundary test over separate tests for every caller. Test
  all output modes only when the shared boundary or mode-specific behavior
  changed.

## Baseline regression matrix

Keep these automated because they protect common, high-impact contracts:

- [ ] Reachable Tailwind utilities are generated and unrelated sibling
      utilities are absent.
- [ ] Oversized or excessive reachable sources fail before Tailwind without
      leaving output or stages.
- [ ] Neighboring Vite config, environment, and public files cannot affect a
      build.
- [ ] Dangerous paths and symbolic-link destinations remain rejected even with
      `--force`.
- [ ] Failed directory and HTML rebuilds preserve the previous output.
- [ ] Pack input remains unchanged; output-inside-input and unsupported local
      resource graphs are rejected.
- [ ] Payload termination attempts, corrupt payloads, and bootstrap failures do
      not execute application code or leave a partial document.
- [ ] Custom themes and application-imported CSS/assets build in every output
      mode whose behavior they affect.
- [ ] Package verification exercises the compiled and packed CLI.

## Periodic stress audits

Run these before a major release, after changing resource limits or compression
strategy, or when production evidence suggests a problem. They are not routine
per-change release blockers unless the change directly affects the measured
behavior or the audit reveals a defect.

- Measure peak memory and elapsed CPU time for realistically large imported CSS,
  images, fonts, dependency graphs, normalized JSON, gzip, and base64 output.
- Verify repeated successful and failed builds do not leak retained heap or
  temporary files when Rtifact is intentionally used repeatedly in one process.
- Exercise process termination between destination-to-backup and
  stage-to-destination renames; confirm stranded backups are recognizable and
  recoverable.
- Recheck limits against current supported Node, Vite, Rolldown, Tailwind, and
  browser behavior.

Record measurements and follow-up issues outside this checklist. A missing
periodic measurement is not equivalent to a failed measurement.

## Release evidence

For ordinary changes, run `npm run verify`; it includes formatting, linting,
tests, type checking, syntax/package checks, and packaged-artifact verification.

For dependency or release work, also run:

- [ ] `npm audit`
- [ ] `npm run check:licenses`
- [ ] `npm run readiness`

Before sign-off:

- [ ] No generated HTML, `dist/`, `lib/`, tarball, temporary fixture, stage, or
      backup is included.
- [ ] Public behavior changes update the applicable OpenSpec requirement and
      `Unreleased` changelog.
- [ ] Review evidence names the changed boundary, failure behavior, and focused
      regression test without requiring a reconstruction of the full build.
