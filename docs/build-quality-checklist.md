# Rtifact build quality checklist

Use this checklist for changes to entry or theme loading, source discovery,
Vite configuration, Tailwind generation, asset handling, portable packaging,
output publication, cleanup, or build diagnostics.

The goal is to prevent process crashes and hangs, uncontrolled memory growth,
execution of unintended local configuration, path traversal, partial output,
and destruction of user files. A checked item needs code or test evidence;
successful happy-path output alone is not evidence.

See [rtifact-html-build.md](./rtifact-html-build.md) for the complete build
flow.

## Stop-ship rule

Do not release when any applicable item marked **critical** is unchecked, or
when a failure can do any of the following:

- terminate the process through avoidable out-of-memory growth;
- scan or buffer an unbounded filesystem or resource graph;
- overwrite, remove, or mutate an input or unrelated path;
- leave a previous successful output missing after a failed rebuild;
- follow a symbolic link across an input or output boundary;
- load user Vite configuration, environment files, or public assets implicitly;
- publish an incomplete, corrupt, or unvalidated artifact; or
- execute application code after bootstrap or payload validation fails.

`--force` may bypass confirmation for an otherwise valid destination. It must
never bypass path, type, symlink, input-preservation, staging, or rollback
checks.

## 1. Change framing

- [ ] List every build phase touched by the change: validation, theme loading,
      source discovery, workspace creation, Vite build, normalization,
      compression, publication, bootstrap, or cleanup.
- [ ] Trace every caller of the changed helper. Put the protection at the
      shared trust or resource boundary instead of patching one CLI mode.
- [ ] State which paths, source contents, generated assets, and external URLs
      the phase is allowed to read or write.
- [ ] State the maximum file count, per-item size, aggregate size, and peak
      in-memory representation for every newly buffered collection.
- [ ] Add one failure test that would fail if the protection is removed.
- [ ] Confirm all three build modes remain covered: default HTML,
      `--self-contained`, and `--out-dir`. Include `pack` when normalization or
      publication changes.

## 2. Memory and resource exhaustion

### Source discovery — critical

- [ ] Tailwind automatic detection remains disabled with `source(none)`.
- [ ] Tailwind receives an explicit bounded source, never an entry parent,
      invocation directory, workspace root, broad recursive glob, or
      `node_modules` tree.
- [ ] Discovery follows only JavaScript and TypeScript modules reachable from
      the entry. Unrelated sibling files cannot enter the scan.
- [ ] Bare package imports and non-source assets are externalized during the
      write-free discovery pass.
- [ ] The explicitly selected custom theme source is included without widening
      discovery to the theme's containing directory.
- [ ] File-count, per-file byte, and aggregate-byte limits are enforced before
      allocation or Tailwind processing. Current limits are 2,000 files,
      4 MiB per file, and 32 MiB total.
- [ ] Reads are bounded even if a file grows between metadata lookup and read.
      A changing file fails safely instead of causing an unbounded allocation.
- [ ] Duplicate and concurrent module loads share one pending read and count a
      physical source only once.
- [ ] The approved source snapshot is reused by the production build so
      Tailwind and Vite do not observe different file contents.
- [ ] Rejection occurs before Tailwind starts and leaves no output or staging
      directory.

### Build and packaging — critical

- [ ] Every recursive file walk has an explicit scope and rejects symbolic
      links. It does not retain file contents unless the next step needs them.
- [ ] Limits account for representation expansion, not only input bytes:
      decoded text, transformed modules, generated CSS, JavaScript chunks,
      normalized payload JSON, gzip buffers, and base64 expansion may coexist.
- [ ] Generated CSS, executable bundles, inlined assets, and normalized
      portable payloads have measured worst-case behavior and a documented
      rejection ceiling before full buffering or compression.
- [ ] A single large local asset cannot cause multiple full-size copies to grow
      without a bound during Vite build, data-URL conversion, JSON encoding,
      gzip, or base64 encoding.
- [ ] Dependency graphs cannot silently bypass the applicable build budget.
      Package dependencies excluded from Tailwind discovery still enter the
      production bundle.
- [ ] One-shot CLI builds do not start watchers, servers, polling loops, or
      unbounded retries.
- [ ] Temporary maps, buffers, plugin state, and workspaces become unreachable
      after success and failure; no process-global cache grows per build.
- [ ] Repeated builds in one process show a stable retained heap after garbage
      collection. Compare retained memory, not only peak RSS.

The current reachable-source limits protect Tailwind discovery. They do not by
themselves bound generated CSS, production dependency bundling, asset inlining,
or the final normalized and compressed payload. Treat those as open checks
until a measured ceiling or streaming design proves them safe.

### Required exhaustion fixtures

| Fixture                                        | Required result                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Thousands of unrelated sibling source files    | Build succeeds without reading them; their utility classes are absent   |
| One reachable source over 4 MiB                | Build fails before Tailwind; no output or stage remains                 |
| More than 2,000 reachable sources              | Build fails with the file-count diagnostic                              |
| Reachable sources over 32 MiB total            | Build fails with the aggregate-size diagnostic                          |
| Source grows while being read                  | Build fails as a changing source; allocation stays bounded              |
| Large imported CSS, image, font, or dependency | Peak memory is measured and stays within the documented build budget    |
| Repeated successful and failed builds          | Retained heap and temporary-file count do not grow with iteration count |

Generate large fixtures during the test and remove them with `t.after(...)`;
do not commit large binary fixtures.

## 3. Filesystem and user-data safety

### Input boundaries — critical

- [ ] Entry, custom-theme, and pack-input paths are resolved from the documented
      working directory and canonicalized where containment matters.
- [ ] Required inputs are readable regular files or directories of the expected
      type.
- [ ] Source entry, custom theme, pack input, and unrelated siblings remain
      byte-for-byte unchanged after success and failure.
- [ ] Pack traversal rejects symbolic links, root escapes, unresolved required
      references, and non-local executable entries.
- [ ] User-controlled path text appears only in diagnostics or validated
      filesystem operations; it is never interpolated into a shell command.

### Output boundaries — critical

- [ ] Directory output rejects the filesystem root, the invocation directory,
      source ancestors, theme ancestors, symbolic links, and non-directories.
- [ ] HTML output requires an `.html` regular-file destination and rejects
      directories, symbolic links, and an output inside the pack input.
- [ ] Missing output parents are canonicalized through their nearest existing
      ancestor before containment checks.
- [ ] Existing managed, unowned, and file outputs require the documented
      confirmation or `--force` authorization before the expensive build.
- [ ] Validation is still true at the mutation boundary. If validation and
      rename/removal are separated, a path-swap or symlink-swap test covers the
      time-of-check/time-of-use window.
- [ ] Temporary workspaces use unique OS temporary directories. Publication
      stages and backups use unique names beside the destination so rename
      remains on one filesystem.

### Publication and rollback — critical

- [ ] Vite never writes directly into the selected destination.
- [ ] Directory output is complete and has a valid ownership marker before
      publication begins.
- [ ] HTML is fully normalized, compressed, encoded, and written to an exclusive
      staging file before destination replacement.
- [ ] The previous output is not removed before a complete replacement exists.
- [ ] If stage publication fails, the previous output is restored and the
      original failure remains the primary diagnostic.
- [ ] A failed compile, transform, normalization, compression, copy, or marker
      write leaves the last successful output unchanged.
- [ ] Success leaves no stage or backup. Failure removes new temporary data and
      preserves any recoverable backup.
- [ ] The crash window between destination-to-backup and stage-to-destination is
      documented and tested. A stranded backup must be recognizable and
      recoverable; it must never be mistaken for disposable unrelated data.

## 4. Build isolation and code-execution safety

- [ ] Every programmatic Vite build sets `configFile: false`, `envDir: false`,
      and `publicDir: false`; every Vite output sets `copyPublicDir: false`.
- [ ] A neighboring `vite.config.*`, `.env*`, or `public/` fixture cannot affect
      discovery, theme loading, application output, or diagnostics.
- [ ] Package aliases resolve only Rtifact's supplied frontend stack, and React
      plus React DOM remain deduplicated.
- [ ] Default portable output externalizes only the controlled runtime imports.
      Directory and self-contained modes bundle the intended runtime graph.
- [ ] CDN import maps use exact-version HTTPS URLs and are compared with the
      controlled mapping before packaging.
- [ ] Unmapped executable imports fail before publication.
- [ ] Build diagnostics do not print environment values, source contents,
      credentials, or unrelated filesystem data.
- [ ] No new build hook spawns a shell, starts a network listener, downloads
      code, or writes outside the controlled workspace without an explicit
      public contract and test.
- [ ] Documentation continues to state that JSX, custom CSS, and custom theme
      modules are trusted local code. Rtifact must not claim to sandbox
      untrusted code.
- [ ] Custom theme execution remains isolated from user Vite configuration and
      is the only intentional build-time execution of user module code.

## 5. Portable artifact and pack safety

- [ ] Normalization accepts exactly one local executable entry and at most one
      controlled import map; extra script shapes are rejected.
- [ ] All required local HTML, CSS, and JavaScript references resolve inside the
      build directory before they are inlined.
- [ ] CSS URL escapes, missing assets, additional chunks, dynamic imports,
      workers, service workers, runtime-loaded WASM, and relative runtime
      `fetch()` calls fail before publication.
- [ ] Remote, `data:`, `blob:`, and fragment references are preserved only where
      the format contract permits them.
- [ ] Application source cannot terminate the outer payload script. Payload data
      remains inert until it is decoded and validated.
- [ ] Payload version, base64 decoding, gzip decompression, JSON parsing, import
      map support, and module loading each fail closed with a visible message.
- [ ] Corrupt or unsupported payloads never restore a partial document or start
      application code.
- [ ] `pack` treats its input directory as read-only and creates no output inside
      it, including through canonicalized symlink paths.

## 6. Failure behavior and diagnostics

- [ ] Every fatal build or packaging error exits non-zero and prints exactly one
      concise top-level `rtifact:` diagnostic.
- [ ] Source syntax, missing dependency, path, and source-limit failures retain
      the relevant source path and cause.
- [ ] Limit diagnostics state the exceeded limit and a practical remediation;
      they do not suggest using `--force` for a safety violation.
- [ ] Cleanup failure is reported without hiding the original build failure.
- [ ] A failed build never prints a success path or byte count.
- [ ] Default HTML packaging failures may recommend `--out-dir`, but never when
      that mode would repeat a destructive or security failure.

## 7. Minimum regression matrix

- [ ] Reachable child utilities are generated; unrelated sibling utilities are
      not generated (`test/integration/build.test.ts`).
- [ ] Oversized reachable Tailwind source fails without output or stage
      (`test/integration/failures.test.ts`).
- [ ] Existing managed and unowned directories retain confirmation and ownership
      behavior (`test/integration/output.test.ts`).
- [ ] Filesystem root, working directory, source ancestor, theme ancestor, and
      symlink destinations remain rejected even with `--force`.
- [ ] A failed rebuild preserves the previous directory and HTML outputs and
      cleans stages and backups.
- [ ] Pack input is unchanged; output-inside-input and unsupported resource
      graphs are rejected (`test/integration/single-file.test.ts`).
- [ ] Payload script termination, path escapes, controlled import maps, corrupt
      payloads, and bootstrap failures remain covered
      (`test/unit/single-file.test.ts`).
- [ ] Custom TS and JSX themes build in default, self-contained, and directory
      modes without loading neighboring Vite or environment configuration.
- [ ] Application-imported CSS and assets still build after discovery isolation
      changes.
- [ ] Package verification exercises the compiled and packed CLI rather than
      only the TypeScript source tree.

## 8. Release evidence

Record the command, result, and relevant test name or measurement beside the
change or pull request. Required final gates:

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run verify:package`
- [ ] `npm run verify`

For dependency or release changes, also run:

- [ ] `npm audit`
- [ ] `npm run check:licenses`
- [ ] `npm run readiness`

Before sign-off:

- [ ] No generated HTML, `dist/`, `lib/`, tarball, temporary fixture, stage, or
      backup is included in the change.
- [ ] Public behavior changes update the applicable OpenSpec requirement and the
      `Unreleased` changelog.
- [ ] A reviewer can identify the enforced limit, the failure point, the cleanup
      behavior, and the regression test without reconstructing the entire build.
- [ ] Every unchecked item has an owner and blocks release when its failure could
      cause memory exhaustion, unintended code execution, path escape, user-data
      loss, or publication of a corrupt artifact.
