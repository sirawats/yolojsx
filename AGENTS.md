# Repository Guidelines

## Project Structure & Module Organization

`bin/yolojsx.js` is the executable entry point. Core ES modules live in `src/`; development verification tools live in `scripts/`. Tests are split between `test/unit/` and `test/integration/`, with shared fixture utilities in `test/helpers.js`. Use `examples/Home.jsx` for manual smoke tests. Product requirements live in `openspec/specs/`; completed design records are under `openspec/changes/archive/`. Do not commit generated output or temporary fixtures.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies. Supported Node versions are `^20.19.0` or `>=22.12.0`.
- `node bin/yolojsx.js examples/Home.jsx` builds the example into `dist/`.
- `npm test` runs every unit and integration test serially.
- `npm run test:unit` or `npm run test:integration` runs one test group.
- `npm run check` syntax-checks repository JavaScript.
- `npm run verify:package` packs and extracts the npm artifact, links existing dependencies, and exercises all CLI modes without downloading packages.
- `npm run verify` runs tests, syntax checks, package-content inspection, and packaged-artifact verification.

There is no separate compilation step for the CLI; source files run directly as native ECMAScript modules.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, trailing commas in multiline constructs, and explicit `.js` extensions in imports. Prefer named exports and small modules with one clear responsibility. Use `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and descriptive lowercase filenames such as `dependencies.js`. No formatter or linter is configured, so match surrounding code and keep changes focused.

## Testing Guidelines

Tests use Node's built-in `node:test` runner and `node:assert/strict`. Name files `*.test.js` and write behavior-focused names. Add unit tests for pure logic and integration tests for CLI builds, diagnostics, filesystem safety, or generated assets. Clean fixtures with `t.after(...)`. Run `npm run verify` before submitting; no numeric coverage threshold is enforced.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no repository-specific commit convention can be inferred. Use short, imperative subjects such as `Add base-path validation`, and keep unrelated changes separate. Pull requests should explain user-visible behavior, list verification commands, link relevant issues or OpenSpec changes, and update `README.md` when CLI behavior changes. Include terminal output for CLI changes; screenshots are only useful for generated UI regressions.

## Safety & Release Notes

Preserve output safeguards and the `.yolojsx-output.json` ownership marker. Never weaken destructive-path checks without dedicated tests. Full isolated dependency installation is a release check, not part of the edit-test loop; follow `RELEASING.md` before publishing.
