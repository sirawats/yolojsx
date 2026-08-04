# Build quality checklist evaluation and fix handoff

Evaluation date: 2026-08-04  
Scope: unstaged tracked changes from `git diff` plus untracked implementation
files, evaluated on top of the staged baseline  
Checklist: [`docs/build-quality-checklist.md`](docs/build-quality-checklist.md)  
Implementation plan: [`QUALITY_CHECKLIST_PLAN.md`](QUALITY_CHECKLIST_PLAN.md)  
Engineering response: [`EVALUATE_EXPLAIN.md`](EVALUATE_EXPLAIN.md)

## Decision

**HOLD pending hosted evidence.** The local implementation blockers described
below have now been corrected. Production release still requires the scheduled
or manually dispatched Linux, Windows, and macOS stress matrix and final
timeout/heap calibration from its results.

The sections below preserve the original fix instructions for traceability;
they no longer describe open implementation defects.

The engineering response correctly accepts the findings. Keep the existing
focused fixes; do not revert them. Complete the work below before describing
the quality plan as finished or releasing the affected build changes.

Use this completion statement until every acceptance gate in this document
passes:

> The initial follow-up patch is implemented and verified, but its acceptance
> criteria and the full quality plan are not yet satisfied.

The focused follow-up is locally complete. Do not describe the release as ready
until the hosted evidence gates are complete.

## Required fix 1 — Detect real residual CSS imports

### Defect

[`inlineCssAssets()`](src/single-file.ts#L381) recognizes only the literal token
`@import`. CSS escape processing makes a rule such as
`@\69mport "theme.css"` an import, so it can remain in an accepted payload. The
portable artifact then omits the imported stylesheet and resources reachable
through it.

The current whole-text regex also rejects harmless `@import` text inside quoted
strings. Comments are removed, but strings are not parsed.

### Implementation boundary

Replace the literal regex with a narrow CSS-aware residual-import scan that:

- skips comments and quoted strings;
- reads actual at-keyword identifiers and decodes CSS escapes;
- recognizes case-insensitive `import` at-rules;
- permits only explicitly supported remote or data imports;
- rejects local, empty, malformed, or ambiguous imports before URL inlining;
  and
- leaves other at-rules unchanged.

Prefer a small scanner if it can implement the required lexical rules clearly.
Use a parser only through a supported direct dependency; do not import a
transitive dependency merely because it currently exists under `node_modules`.

Do not implement recursive CSS-import packaging. The product contract is
complete-or-reject, and rejection is the smaller reliable solution.

### Required tests

- quoted and unquoted local imports;
- uppercase/mixed-case imports;
- escaped import identifiers, including `@\69mport`;
- malformed or ambiguous imports;
- permitted remote and data imports;
- `@import` text inside a string and comment does not trigger rejection; and
- rejection occurs before publication and preserves previous output.

Exit condition: no valid local import syntax can remain in an accepted payload,
and harmless text is not mistaken for a resource edge.

## Required fix 2 — Bind pack accounting to approved file identities

### Defect

[`listFiles()`](src/single-file.ts#L110) charges each path's enumerated size but
stores only the path. [`readPackFile()`](src/single-file.ts#L196) later calls
`readStableFile()` without that approved identity. A file can be replaced or
grow after enumeration, remain individually below 16 MiB, and cause the bytes
actually read to exceed the previously charged 64 MiB aggregate.

`readStableFile()` currently proves stability only for its own lstat/open/read
sequence. It does not know whether it opened the object approved during pack
enumeration.

### Implementation boundary

Replace the path-only `FileMap` value with a pack-file record containing at
least:

- canonical or validated absolute path;
- bigint `dev`, `ino`, and approved `size`; and
- the normalized relative path as the map key.

Then:

1. Capture the record during enumeration.
2. Apply per-file and aggregate accounting to the captured sizes.
3. Deduplicate physical accounting by `dev`/`ino`, including hard-link aliases,
   as required by Phase 2 of the plan.
4. Pass the approved identity to every later `readStableFile()` call.
5. Reject replacement, growth, shrinkage, unsupported type, disappearance, or
   unreadable input before compression or publication.
6. Continue charging every normalized insertion even when encoded bytes are
   cached or the same physical asset is referenced repeatedly.

Do not add a timing-dependent race test or a generalized production lifecycle
hook solely for tests. Test the captured inventory record and its later read at
the smallest real internal seam.

### Required tests

- replacement after enumeration with a different identity and the same size;
- growth and shrinkage after enumeration;
- several individually valid files whose changed contents would exceed the
  aggregate limit;
- hard-link aliases and physical-identity accounting;
- symlink, directory, missing file, and permission failure; and
- failure leaves pack input unchanged and creates no output or stage.

Exit condition: normalization reads exactly the physical files and sizes that
were approved and charged during enumeration.

## Required fix 3 — Move build execution behind a child-process boundary

### Defect

The plan requires a bounded build worker, but custom themes still execute via
`import()` in the parent process at
[`src/theme-modules.ts`](src/theme-modules.ts#L86), called by
[`src/cli.ts`](src/cli.ts#L113). A defective trusted theme can call
`process.exit()`, loop indefinitely, or exhaust the parent heap without the
required diagnostic, cleanup, and previous-output guarantees.

This is process-failure containment, not hostile-code sandboxing. JSX and custom
themes remain trusted local code and may access resources available to the user.

### Implementation boundary

Implement the deliberately small worker described in Phase 3 of the plan:

- parent owns input/output validation, confirmation, output authorization,
  publication, diagnostics, and cleanup;
- one direct Node child owns theme evaluation, source discovery, Vite/Tailwind,
  normalization, compression, and prepared-output creation;
- use `process.execPath` or `child_process.fork()` without a shell, worker pool,
  grandchildren, or generalized RPC;
- send one bounded job message and return bounded metadata plus a
  workspace-relative prepared-output path;
- never send source text or artifact contents through IPC;
- use a generous finite timeout and a measured V8 heap ceiling;
- cap warnings, diagnostics, and IPC message sizes;
- treat nonzero exit, signal, timeout, malformed IPC, missing output, and invalid
  prepared output as one controlled build failure; and
- keep parent-owned cleanup in `finally`, using bounded retries only for known
  transient Windows filesystem errors.

Measure heap and timeout behavior before selecting defaults. Do not guess small
limits merely to satisfy a test.

### Required tests

- custom theme calls `process.exit()`;
- custom theme or worker does not terminate before timeout;
- worker exits abnormally or is killed;
- worker exceeds its memory limit;
- worker sends malformed, oversized, or incomplete IPC;
- worker reports success without a valid prepared output;
- every failure exits nonzero, produces one bounded `rtifact:` diagnostic,
  cleans the temporary workspace, and preserves existing output; and
- a normal custom-theme build still passes in default, self-contained, and
  directory modes.

Exit condition: the parent survives exit, timeout, and memory failure without
publishing or losing prior output.

## Required fix 4 — Correct the public specification

[`compressed-html-package/spec.md`](openspec/specs/compressed-html-package/spec.md#L132)
says every packaging ceiling rejects "before compression or publication." The
128 MiB final HTML size is necessarily known only after compression, base64,
and shell construction.

Change the contract to:

- every packaging budget rejects before publication; and
- the 96 MiB normalized-payload ceiling rejects before compression.

Keep the changelog and detailed build documentation synchronized with the final
wording.

Exit condition: the public specification promises only behavior the
implementation can enforce.

## Required compatibility and diagnostic cleanup

These are not evidence of corrupt publication, but they are part of the touched
plan phases and must be resolved before claiming the full plan complete.

### Attribute-aware `srcset` rejection

The whole-markup regex at [`src/single-file.ts`](src/single-file.ts#L438) can
reject text, comments, or names such as `data-srcset`. Replace it with a small
attribute-aware scan over actual HTML start tags. Continue rejecting every real
`srcset` attribute; do not add candidate parsing or resource packaging.

Test real quoted/unquoted and mixed-case attributes, plus harmless text,
comments, and `data-srcset`.

### Accurate stable-read diagnostics

Do not label every `readStableFile()` error as "changed while reading." Preserve
`StableFileError.reason` for changed, too-large, and unsupported input, and keep
ordinary missing-file, permission, and I/O causes actionable without exposing
source contents.

### Compatibility validation scope

Keep the corrected rule that JavaScript inspection is compatibility validation,
not a sandbox. Complete Phase 6 by removing the arbitrary 400-character Prism
worker heuristic and relying on emitted bundle structure or explicitly
detectable syntax. Do not grow an endless AST pattern list for aliases and
computed properties.

## Remaining plan completion gates

The four fixes above remove the known blockers, but the full plan is complete
only when these existing phase requirements are also satisfied:

- stable filesystem decisions cover entry, custom theme, Tailwind snapshot,
  production inputs where controlled loading is possible, pack files, ownership
  markers, and output identity;
- production graph accounting uses canonical physical identity instead of only
  path strings;
- worker-prepared output is validated by the parent and copied to an exclusive
  stage beside the destination before destination mutation;
- file and directory publication follow the same explicit one-restoration
  state machine and preserve the primary error plus recovery context;
- success removes all stages and backups, while failure removes only new
  temporary data and preserves a recognizable backup when restoration fails;
- warnings and diagnostics are bounded;
- CI covers Ubuntu Node 20.19/22/latest, Windows Node 20.19/22, and macOS Node 22;
  and
- Windows junction/reparse, locked-file cleanup, macOS Unicode/rename, Linux
  hard-link/permission, different-volume staging, and abnormal worker lifecycle
  cases have focused evidence.

Periodic stress evidence is required for this work because it changes resource
limits, normalization expansion, compression, and worker containment. Keep it
outside the ordinary unit suite, but record peak RSS/heap, elapsed time,
artifact size, cleanup result, OS, Node version, and the calibrated timeout/heap
limits before release.

## Existing work to retain

The following unstaged protections are valid and should remain:

- literal quoted, unquoted, uppercase, local, and ambiguous CSS imports reject;
- repeated data-URL insertions are charged before joining expanded output;
- JSON-escaped normalized bytes are bounded;
- all actual `srcset` attributes currently fail closed by contract;
- runtime syntax inspection is documented as compatibility validation rather
  than a sandbox;
- file-output restoration is attempted once and preserves a named backup when
  recovery fails;
- bounded stable reads are shared by Tailwind discovery, pack reads, and
  ownership markers; and
- the repository verification gate passes.

## Final acceptance checklist

- [x] Every required fix and touched-phase cleanup above has a focused regression
      test.
- [x] Parent survives worker exit, timeout, memory failure, malformed IPC, and
      invalid prepared output without publishing.
- [x] Pack normalization is bound to the enumerated physical identities and
      sizes.
- [x] No supported local CSS import syntax remains in accepted output.
- [x] Previous file and directory output survives every injected publication
      failure, or a named recoverable backup remains.
- [ ] Default HTML, `--self-contained`, `--out-dir`, and `pack` pass on the
      required Linux, Windows, and macOS matrix.
- [ ] Relevant periodic resource measurements are recorded and limits are
      calibrated from evidence.
- [x] `npm run verify` passes.
- [x] Because this is resource/release work, `npm audit`,
      `npm run check:licenses`, and `npm run readiness` pass.
- [x] OpenSpec, changelog, and detailed build documentation match implemented
      behavior.
- [x] No generated HTML, `dist/`, `lib/`, tarball, workspace, stage, backup,
      credentials, or temporary fixture is included.

## Current verification evidence

After the final local fixes, `npm run verify` passed on 2026-08-04 with 108 unit
and integration tests, TypeScript checking, syntax/package checks, and packaged
CLI verification. A schema-v2 local stress run also passed 45/45 builds and
cleanups, worker exit/timeout cleanup, publication crash-window restoration,
and retained-parent-heap recording. The user-provided audit, license, and
readiness gates remain passing because this follow-up changed no dependencies.

The two unchecked gates require hosted Linux, Windows, and macOS stress results
and evidence-based final calibration; they cannot be completed by a local run.

The HOLD may be removed only after the final acceptance checklist is supported
by code, focused tests, platform evidence, and synchronized public contracts.
