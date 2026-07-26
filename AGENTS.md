# Repository Guidelines

## Project Structure & Module Organization

`bin/yolojsx.js` is the executable entry point. Core ES modules live in `src/`; development verification tools live in `scripts/`. Tests are split between `test/unit/` and `test/integration/`, with shared fixture utilities in `test/helpers.js`. Use `examples/Home.jsx` for manual smoke tests. Product requirements live in `openspec/specs/`; completed design records are under `openspec/changes/archive/`. Do not commit generated output or temporary fixtures.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies. Supported Node versions are `^20.19.0` or `>=22.12.0`.
- `node bin/yolojsx.js examples/Home.jsx` builds the example into `Home.html`; add `--out-dir dist` for directory output.
- `npm test` runs every unit and integration test serially.
- `npm run test:unit` or `npm run test:integration` runs one test group.
- `npm run check` syntax-checks repository JavaScript.
- `npm run format` formats supported files; `npm run format:check` checks formatting without writing.
- `npm run lint` runs ESLint; `npm run lint:fix` applies safe automatic fixes.
- `npm run dev` runs the Vite live development server with hot reload for `website/index.jsx` (or a custom entry file via `node scripts/dev.js <entry>`). Agents must not run this server command automatically; the user will start it in the background when needed.
- `npm run verify:package` packs and extracts the npm artifact, links existing dependencies, and exercises all CLI modes without downloading packages.
- `npm run verify` runs formatting, linting, tests, syntax checks, package-content inspection, and packaged-artifact verification.

There is no separate compilation step for the CLI; source files run directly as native ECMAScript modules.

## Coding Style & Naming Conventions

Use Prettier via `npm run format`. Prefer named exports and small modules with one clear responsibility. Use `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and descriptive lowercase filenames such as `dependencies.js`. Keep changes focused.

## Testing Guidelines

Tests use Node's built-in `node:test` runner and `node:assert/strict`. Name files `*.test.js` and write behavior-focused names. Add unit tests for pure logic and integration tests for CLI builds, diagnostics, filesystem safety, or generated assets. Clean fixtures with `t.after(...)`. Run `npm run verify` before submitting; no numeric coverage threshold is enforced.
