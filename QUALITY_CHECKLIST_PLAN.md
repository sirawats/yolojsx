# Build quality implementation plan

Status: implementation complete through Phase 6; hosted matrix and final calibration pending

Target: Node `^20.19.0 || >=22.12.0`, macOS, Linux, and Windows

Quality source: [`docs/build-quality-checklist.md`](docs/build-quality-checklist.md)

## Outcome

Make every CLI mode fail safely and predictably:

```text
rtifact Sample.jsx --theme custom.jsx --output sample.html
rtifact Sample.jsx --self-contained --output sample.html
rtifact Sample.jsx --out-dir dist
rtifact pack dist --output sample.html
```

The complete process—from path validation and dependency discovery through
Vite, Tailwind, packaging, publication, browser bootstrap, diagnostics, and
cleanup—must satisfy the checklist. A successful command must produce a
complete artifact. A failed command must preserve inputs, unrelated files, and
the previous successful output.

## Architectural decisions

### 1. Keep inputs in place; isolate generated work

Do **not** copy `Sample.jsx`, a custom theme, or the whole project into a
temporary directory. Copying breaks relative imports, bare-package resolution,
workspace packages, and source identity unless Rtifact also reproduces the
project layout and dependency tree.

Instead:

- canonicalize input paths once;
- read first-party sources through bounded, identity-checked file handles;
- reuse the approved source snapshot during the production build;
- give Vite a unique root created with `mkdtemp(path.join(os.tmpdir(), ...))`;
- import the canonical entry and theme through virtual absolute imports;
- keep `configFile`, `envDir`, and `publicDir` disabled; and
- write generated output only inside the temporary workspace until publication.

This preserves normal module resolution while isolating generated files and
neighboring project configuration.

### 2. Run build work in a child process

The parent CLI should own validation, confirmation, output authorization,
publication, diagnostics, and cleanup. A direct Node child process should own
custom-theme evaluation, source discovery, Vite/Tailwind, normalization, and
compression.

```text
Parent CLI
  validate inputs/output → confirm replacement → create OS temp workspace
       │
       └── Build worker process
             canonical read-only inputs
             → bounded discovery/build
             → prepared file or directory inside temp workspace
       │
  validate prepared output → copy to sibling stage
  → revalidate destination → atomic-style rename publication → cleanup
```

Use `child_process.spawn()` with `process.execPath`, no shell, bounded JSON on a
dedicated control pipe, capped warnings and result metadata, a V8 heap limit,
and a finite timeout. The worker returns only metadata and a workspace-relative
prepared-output path; artifact contents never travel through IPC.

This contains accidental `process.exit()`, infinite theme evaluation, V8 OOM,
and native build-process crashes. It is not an operating-system security
sandbox: JSX and custom themes remain trusted local code and may read accessible
files or use the network. A temp directory alone cannot change that.

### 3. Keep publication parent-owned and destination-local

Prepared output may live on another filesystem under the OS temp directory.
The parent therefore copies it into a unique stage beside the destination and
uses rename only between sibling paths. This avoids `EXDEV` and retains the
best atomicity available on macOS, Linux, and Windows.

Never depend on rename-overwrite behavior: it differs across operating systems.
Move the authorized destination to a unique backup first, move the completed
stage into place, and restore once on failure.

### 4. Prefer structural guarantees over impossible static proofs

Use Vite/Rolldown output structure to reject additional local chunks and
resources. AST inspection may reject explicit imports and other reliably
recognizable syntax, but it must not claim to prove the absence of arbitrary
aliased calls such as `const load = window.fetch`.

Rtifact is a portable packager, not a JavaScript sandbox. Narrow the public
contract accordingly instead of growing an endless list of fragile AST
patterns.

## Deep module seams

Keep the external interfaces small and put platform and recovery complexity
behind them.

### Stable filesystem reads

Add one shared filesystem module with three interfaces:

```ts
canonicalizePotentialPath(path): Promise<string>
capturePathIdentity(path): Promise<PathIdentity>
readStableFile(path, maxBytes): Promise<Buffer>
```

Its implementation should:

- use `lstat`, `open`, and `FileHandle.stat()` with bigint stats;
- reject symbolic links and non-regular files;
- compare type, device, inode, and size before trusting the opened handle;
- allocate at most `maxBytes + 1` and reject growth;
- canonicalize missing paths through the nearest existing ancestor; and
- close every handle in `finally`.

Reuse it from source discovery, pack reads, ownership-marker reads, and output
authorization. Do not require POSIX `O_NOFOLLOW`: current Node documentation
notes that Windows does not provide it. The cross-platform lstat/open/fstat
identity pattern is the baseline; POSIX-only flags must not be the only safety
mechanism.

### Build worker

Expose one interface:

```ts
runBuildJob(job): Promise<PreparedOutput>
```

`BuildJob` is a discriminated union for default HTML, self-contained HTML,
directory output, and `pack`. `PreparedOutput` contains only kind, relative
workspace path, byte counts, and capped warnings. The parent rejects absolute
or escaping worker paths and rechecks the returned file/tree before staging it.

Tests and callers should exercise this interface instead of reaching into
worker IPC details.

### Publication

Keep the existing directory/file inspection interfaces, but route both commit
paths through one internal publication state machine:

```text
authorized → staged → backed-up → published → backup-removed
                               ↘ restored
                               ↘ recovery-failed (backup frozen in place)
```

The implementation, not callers, owns rename ordering, recovery messages, and
cleanup. Inject filesystem operations only through a private test seam.

## Implementation phases

### Phase 0 — Align the contract before adding code

- [x] Update the compressed-package OpenSpec with the final HTML ceiling.
- [x] Define portable validation as structural plus explicitly detectable
      syntax; remove any claim of complete static detection of runtime APIs.
- [x] Continue documenting JSX, custom CSS, and custom themes as trusted local
      code.
- [x] Decide `srcset` support explicitly. The minimal safe contract is to reject
      all `srcset` during `pack` until a standards-compliant parser is justified.
- [x] Specify that remaining local CSS `@import` rules are rejected. Vite output
      should already have flattened supported local imports.
- [x] State the build timeout, worker-failure behavior, cleanup behavior, and
      whether the limits are public compatibility guarantees.
- [x] Update the `Unreleased` changelog with the chosen behavior.

Exit: implementation and tests can quote an exact requirement rather than infer
an unlimited compatibility promise.

### Phase 1 — Fix confirmed portable-output defects first

- [ ] Reject local and ambiguous CSS `@import` forms, including quoted,
      unquoted `url(...)`, whitespace, comments, and case variants. Preserve
      only the remote/data forms explicitly allowed by the contract; fail closed
      on ambiguous syntax.
- [ ] Add the unquoted-import regression that currently produces nested
      `url(icon.png)` inside an embedded stylesheet.
- [ ] Implement the selected `srcset` contract. Do not split on commas with a
      naive string operation because data URLs may contain commas.
- [ ] Validate that the decoded payload is a non-array object before reading its
      version, then validate every field before touching the DOM.
- [ ] Keep application code inert until complete payload and import-map support
      validation passes.

Prefer rejecting unsupported residual syntax to adding recursive CSS or HTML
parsers without a product requirement.

Exit: every accepted package is complete; every unsupported form fails before
publication with one actionable diagnostic.

### Phase 2 — Consolidate stable reads and path identity

- [ ] Extract the repeated canonicalization and lstat/open/fstat logic into the
      shared filesystem module described above.
- [ ] Use it for entry, custom theme, Tailwind snapshot, production inputs where
      Vite permits controlled loading, pack files, and ownership markers.
- [ ] Deduplicate graph accounting by canonical physical identity rather than
      only path text, so aliases and hard links cannot multiply or evade counts.
- [ ] Store `dev`/`ino` as bigint internally. If an existing destination cannot
      provide stable identity, refuse destructive replacement rather than let
      `--force` weaken the check.
- [ ] Keep the last-moment output identity/canonical-path revalidation. Document
      that Node exposes path-based rename rather than a portable directory-handle
      rename, so Rtifact reduces but cannot eliminate a malicious same-user race.

Tests:

- regular file, directory, symlink, junction/reparse point, hard link, growth
  during read, replacement between lstat/open, missing ancestor, and permission
  failure;
- paths containing spaces, Unicode, mixed separators, and case changes; and
- no shell interpolation anywhere.

Exit: all filesystem trust decisions use one implementation and the same tests.

### Phase 3 — Introduce the build worker and real temp isolation

- [ ] Add a runtime worker entry included in both source-level CLI development
      and the compiled npm package.
- [ ] Parent validates paths/output, asks for confirmation, then creates the
      workspace with `os.tmpdir()` + `mkdtemp()`; never use a literal `/tmp`.
- [ ] Worker sets its Vite root and working directory to that workspace while
      importing canonical inputs through virtual absolute imports.
- [ ] Worker retains `configFile: false`, `envDir: false`, `publicDir: false`,
      `copyPublicDir: false`, controlled aliases, and React deduplication.
- [ ] Evaluate custom-theme bundles inside the worker. Validate the returned
      declarative theme before it affects generated CSS or runtime tokens.
- [ ] Use no shell and no grandchildren. Set `windowsHide: true` on Windows.
- [ ] Cap IPC messages and never send artifact strings or source contents.
- [ ] Add a measured heap cap and finite timeout. Map timeout, signal, OOM,
      abnormal exit, malformed IPC, and missing prepared output to one concise
      build failure.
- [ ] Parent owns cleanup in `finally` after the child exits. Use bounded
      `rm({ recursive: true, force: true, maxRetries, retryDelay })` only for
      cleanup failures such as Windows antivirus/file-lock delays; never retry
      publication indefinitely.

Tests:

- theme calls `process.exit()`;
- theme never finishes;
- worker exits, throws, sends malformed metadata, or returns an escaping path;
- worker leaves a locked file or partial output; and
- source CLI and packed CLI both locate and execute the worker.

Exit: build-process failure cannot terminate the parent or publish partial
output, and all platforms use the same Node-stdlib implementation.

### Phase 4 — Enforce budgets before expensive expansion

- [ ] Keep central limits in `src/resource-limits.ts`; specs reference them
      conceptually rather than duplicating numbers in the checklist.
- [ ] Replace repeated string concatenation in async replacement with an array
      builder plus an incremental byte counter. Reject the next append before
      crossing the normalized limit.
- [ ] Count the JSON-escaped representation, not only raw string bytes.
- [ ] Cache each encoded asset once, but charge its full encoded length on every
      insertion into HTML, CSS, or JavaScript.
- [ ] Stop directory walking immediately at file-count or aggregate limits and
      reject every symbolic link/reparse point.
- [ ] Keep per-input and aggregate production graph accounting in a pre-load
      plugin; keep generated per-file and aggregate validation before prepared
      output is accepted.
- [ ] Treat the worker heap cap as containment for Vite/native buffering that a
      plugin cannot prevent. Do not misdescribe `generateBundle` checks as
      pre-allocation protection.
- [ ] Replace synchronous gzip/base64/full-HTML construction with a staged file
      writer if measurement shows unacceptable coexistence. Preferred design:
      bounded JSON string → `createGzip()` → small base64 transform with a
      two-byte carry → HTML stage writer with a final byte counter.
- [ ] If the measured peak is already reasonable after early normalized-byte
      rejection, keep `gzipSync`; do not add streaming solely for elegance.

Focused tests:

- each materially distinct file-count, per-file, aggregate-input,
  aggregate-output, normalized, and final-artifact failure path;
- one large asset referenced repeatedly until the normalized budget rejects it;
- one dependency excluded from Tailwind discovery but included in production
  accounting;
- source or asset growth during read; and
- successful and failing builds leave no workspace or stage.

Exit: every collection has a bounded next representation, and a realistic
fixture demonstrates rejection before unreasonable memory or CPU use.

### Phase 5 — Make publication one explicit state machine

- [ ] Parent validates the worker's prepared output as a regular file or a
      symlink-free directory tree inside its workspace.
- [ ] Copy prepared output to a unique, exclusive sibling stage. Never rename
      directly from OS temp because it may be another volume.
- [ ] Revalidate destination identity immediately before its first rename.
- [ ] For existing output: rename destination to backup, rename stage to
      destination, then remove backup only after success.
- [ ] Attempt restoration once. If it succeeds, report that the prior output was
      restored. If it fails, preserve and report the backup path and never move
      it again during `finally`.
- [ ] On success remove all stages/backups; on failure remove only new temporary
      data, never uncertain recovery data.
- [ ] Keep backup and stage names recognizable and collision-resistant.
- [ ] Preserve the primary error and append cleanup/recovery context without
      duplicating source frames or secrets.

Tests:

- every state transition and injected failure;
- transient and permanent recovery failure;
- absent and existing destinations;
- directory and HTML output;
- destination swap after confirmation and before commit;
- Windows locked destination/backup behavior; and
- no cleanup call targets an input, repository root, filesystem root, or final
  output.

Exit: no failure path can lose the previous output or advertise nonexistent
recovery data.

### Phase 6 — Simplify compatibility validation and diagnostics

- [ ] Prefer emitted bundle/file structure for local chunks, workers, WASM, and
      assets.
- [ ] Keep AST validation only for explicit syntax that is both useful and
      reliably identifiable, such as remaining import declarations and dynamic
      imports.
- [ ] Remove the arbitrary 400-character Prism worker heuristic. A dormant
      dependency helper that emits no worker resource should not be treated as
      a runtime worker solely from source text.
- [ ] Give every limit error the actual exceeded ceiling, the affected resource,
      and a practical remediation.
- [ ] Keep exactly one top-level `rtifact:` diagnostic, source path/location,
      primary cause, and bounded nested context; omit code frames and source
      contents.
- [ ] Cap worker warnings and error text so failures cannot allocate or print
      unbounded diagnostics.

Exit: validation makes promises it can keep, and every failure remains concise
and actionable.

### Phase 7 — Cross-platform verification

Expand CI to:

| OS      | Node versions               | Purpose                                                             |
| ------- | --------------------------- | ------------------------------------------------------------------- |
| Ubuntu  | 20.19, 22, latest supported | Minimum runtime, main verification, package readiness               |
| Windows | 20.19, 22                   | NTFS rename/locking, separators, reparse points, worker termination |
| macOS   | 22                          | APFS paths, symlinks, same-volume publication, worker lifecycle     |

Use only Node filesystem/path/process interfaces in implementation and tests.
Do not invoke `cp`, `rm`, `find`, `chmod`, shell quoting, Unix signals, or
PowerShell from production code.

Platform-specific assertions:

- Windows: drive-letter case, backslashes, junctions/reparse points, locked
  files, `EPERM`/`EBUSY` cleanup, and no dependency on `O_NOFOLLOW` or POSIX mode
  bits.
- macOS: case-preserving paths, symlink swaps, Unicode filenames, and APFS
  rename behavior.
- Linux: minimum Node version, permission failures, hard links, and the full
  stress fixture.
- All: spaces/Unicode, missing parents, output on a different volume from OS
  temp, abnormal worker exit, and packaged CLI smoke tests.

GitHub-hosted Windows runners are the accepted Windows platform evidence. Linux
or macOS path tests must not be represented as Windows evidence.

Exit: `npm run verify` passes on the matrix and the packaged CLI produces the
same logical result on every OS.

### Phase 8 — Periodic stress and release evidence

- [x] Add a separate, non-default stress command for large dependency, asset,
      compression, timeout, retained-heap, and crash-window measurements.
- [x] Record peak RSS/heap, elapsed time, artifact size, cleanup result, OS,
      Node version, and fixture shape.
- [ ] Calibrate worker heap and timeout from the slowest supported CI platform
      with margin; do not guess from one developer machine.
- [ ] Run stress/readiness before major releases or after changing limits,
      compression, Vite/Rolldown, or worker execution.
- [ ] Run `npm audit`, `npm run check:licenses`, `npm run readiness`, and
      `npm run verify` for dependency/release changes.
- [ ] Update `rtifact-html-build.md`, OpenSpec, README/help where public behavior
      changes, and the changelog.
- [ ] Confirm no generated HTML, `dist`, `lib`, tarball, workspace, stage, or
      backup is committed.

Exit: routine pull requests stay fast, while expensive evidence is collected
when it is relevant.

## Checklist coverage map

| Quality invariant                               | Primary phase          |
| ----------------------------------------------- | ---------------------- |
| Bounded intended discovery and dependency graph | 2, 3, 4                |
| Bounded representation expansion                | 4                      |
| Input and unrelated-file immutability           | 2, 3                   |
| Path/type/symlink safety and `--force` behavior | 2, 5                   |
| Vite/env/public isolation                       | 3                      |
| Temporary build and complete staging            | 3, 5                   |
| Mutation-boundary authorization                 | 2, 5                   |
| Previous-output and backup recovery             | 5                      |
| Complete portable resources                     | 0, 1, 6                |
| Bootstrap fail-closed behavior                  | 1                      |
| Safe fatal diagnostics                          | 3, 5, 6                |
| Focused regression evidence                     | Every applicable phase |
| Periodic memory/CPU/crash evidence              | 8                      |

## Explicitly rejected approaches

- **Copy the whole input project to temp:** breaks or duplicates dependency and
  workspace resolution, expands I/O, and still does not sandbox executed code.
- **Copy only entry/theme files to temp:** breaks relative imports and source
  identity.
- **Treat a temp directory as a security sandbox:** processes can still access
  the filesystem and network.
- **Use worker threads for crash containment:** native crashes and process-wide
  resource exhaustion can still affect the parent; a child process is the
  clearer seam.
- **Depend on POSIX permissions, `O_NOFOLLOW`, signals, `fork` semantics, or
  shell commands:** they do not provide the same contract on Windows.
- **Promise complete static detection of runtime fetch/worker behavior:** normal
  JavaScript aliases and computed calls make that impossible.
- **Stream every byte before measuring:** early budget accounting may already
  make the simpler bounded in-memory implementation safe.
- **Add configuration for every limit immediately:** keep fixed documented
  limits until real workloads show that calibration is needed.

## Definition of done

- All applicable release blockers in the quality checklist have code and
  focused test evidence.
- The confirmed CSS packaging defect is fixed.
- The repeated-reference fixture proves early bounded rejection.
- Parent survives worker exit, timeout, and memory failure without publishing.
- Previous output survives every injected publication failure.
- Default, self-contained, directory, and pack modes pass on Linux, macOS, and
  Windows CI.
- Public specifications describe guarantees the implementation can actually
  enforce.
- `npm run verify` and applicable dependency/release gates pass.

## Current-document references

- Node's cross-platform temp root: `node:os` `tmpdir()`.
- Unique temporary paths and stable handles: `node:fs/promises` `mkdtemp()`,
  `open()`, `lstat()`, `realpath()`, and `FileHandle.stat()`.
- Publication: `rename()` only between sibling paths; never assume a
  never-overwrite rename across platforms.
- Current Node documentation notes that `O_NOFOLLOW` is not available on
  Windows, which is why the plan relies on portable identity checks and worker
  containment rather than a POSIX-only flag.
