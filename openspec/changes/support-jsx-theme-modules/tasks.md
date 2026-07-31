## 1. Theme Resolution and Loading

- [x] 1.1 Make the existing theme-definition normalization and single-theme validation reusable for custom manifests while preserving built-in catalog validation
- [x] 1.2 Add readable regular `.ts` and `.jsx` theme-path validation resolved from the invocation working directory
- [x] 1.3 Implement the write-free Vite default-export loader with existing React transformation, core aliases, deduplication, and actionable source-aware errors
- [x] 1.4 Add focused unit tests for preset precedence, path resolution, missing or unsupported files, missing defaults, invalid manifests, and loader failures

## 2. CLI and Application Build Integration

- [x] 2.1 Change argument parsing and help so `--theme` retains a preset-or-path value for asynchronous CLI resolution
- [x] 2.2 Remove the `--css` argument, custom CSS path validator, build option, generated stylesheet import, and obsolete tests
- [x] 2.3 Pass the canonical custom-theme source through build orchestration and add it as an explicit Tailwind `@source`
- [x] 2.4 Keep named theme exports on the normal application module graph with supplied package aliases and no automatic component injection

## 3. Behavioral Verification

- [x] 3.1 Add integration fixtures covering `.ts` and `.jsx` manifests, an explicitly imported named component, a local helper, and zero-install React, Ant Design, and React Icons resolution
- [x] 3.2 Verify custom theme semantic CSS, Ant Design runtime tokens, and Tailwind utilities in default file, self-contained file, and directory outputs
- [x] 3.3 Verify invalid custom themes fail before output mutation, unknown preset diagnostics remain intact, and `--css` is rejected as an unknown option
- [x] 3.4 Verify application-imported CSS and file-relative assets still build through the normal Vite graph
- [x] 3.5 Run the built-in theme catalog regression tests and the focused unit and integration suites

## 4. Public Contract and Final Gate

- [x] 4.1 Update README CLI help and authoring guidance with the module contract, explicit component import example, trusted-code boundary, and `--css` migration
- [x] 4.2 Update the official yolojsx skill references and any mirrored CLI guidance to describe preset-or-module themes and normal CSS imports
- [x] 4.3 Add an Unreleased changelog entry covering TS/JSX theme modules and the breaking `--css` removal
- [x] 4.4 Run `npm run verify` and confirm package verification includes the updated documentation and all CLI output modes

## 5. Bundled JSX Preset Migration

- [x] 5.1 Rename every `src/themes/*.ts` preset manifest to `.jsx`, add JSDoc `@satisfies`, and preserve all values
- [x] 5.2 Update repository-only TypeScript, build, and lint coverage so preset JSX emits to unchanged `lib/themes/*.js` paths
- [x] 5.3 Update fixture references and add checks that no `.ts` preset manifests remain
- [x] 5.4 Add an Unreleased changelog note for the bundled-source migration
- [x] 5.5 Run catalog tests and `npm run verify`
