# Repository Guidelines

## Project Structure & Module Organization

`bin/yolojsx.js` is the executable entry point. Core ES modules live in `src/`: argument parsing, path and output safety, dependency resolution, templates, build orchestration, and CLI error handling are kept separate. Tests are split between `test/unit/` and `test/integration/`, with shared fixture utilities in `test/helpers.js`. Use `examples/Home.jsx` for manual smoke tests. Product requirements live in `openspec/specs/`; completed design records are under `openspec/changes/archive/`. Do not commit generated `dist/` output or temporary fixtures.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies. Supported Node versions are `^20.19.0` or `>=22.12.0`.
- `node bin/yolojsx.js examples/Home.jsx` builds the example into `dist/`.
- `npm test` runs every unit and integration test serially.
- `npm run test:unit` or `npm run test:integration` runs one test group.
- `npm run pack:check` previews the files included in the npm package.

There is no separate compilation step for the CLI; source files run directly as native ECMAScript modules.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, trailing commas in multiline constructs, and explicit `.js` extensions in imports. Prefer named exports and small modules with one clear responsibility. Use `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and descriptive lowercase filenames such as `dependencies.js`. No formatter or linter is configured, so match surrounding code and keep changes focused.

## Testing Guidelines

Tests use Node's built-in `node:test` runner and `node:assert/strict`. Name files `*.test.js` and write behavior-focused test names, for example `test("rejects unsafe output paths", ...)`. Add unit tests for pure parsing/path logic and integration tests for CLI builds, diagnostics, filesystem safety, or generated assets. Clean temporary fixtures with `t.after(...)`. Run `npm test` before submitting; no numeric coverage threshold is currently enforced.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no repository-specific commit convention can be inferred. Use short, imperative subjects such as `Add base-path validation`, and keep unrelated changes separate. Pull requests should explain user-visible behavior, list verification commands, link relevant issues or OpenSpec changes, and update `README.md` when CLI behavior changes. Include terminal output for CLI changes; screenshots are only useful for generated UI regressions.

## Safety & Release Notes

Preserve output-directory safeguards and the `.yolojsx-output.json` ownership marker. Never weaken destructive-path checks without dedicated tests. Follow `RELEASING.md` before publishing, including package-content and packed-tarball smoke checks.
