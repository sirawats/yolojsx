# Contributing to yolojsx

Thanks for helping improve yolojsx. Contributions should keep the CLI small,
predictable, and safe around user files.

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Report vulnerabilities through [SECURITY.md](SECURITY.md), not a public issue.

## Before opening work

- Search existing issues and pull requests.
- Use a bug report for reproducible incorrect behavior.
- Use a feature request before investing in a large behavior or dependency
  change.
- Keep unrelated changes in separate pull requests.
- Do not include generated HTML, `dist/`, tarballs, credentials, or temporary
  fixtures.

Changes to CLI behavior, output safety, theme contracts, or package format should
update the relevant specification under `openspec/specs/`. Large changes should
have an OpenSpec proposal before implementation.

## Development setup

Supported Node.js versions are `^20.19.0` or `>=22.12.0`.

```sh
cd yolojsx
npm ci
npm run verify
```

Useful focused commands:

```sh
npm run test:unit
npm run test:integration
npm run check
npm run pack:check
npm run verify:package
```

Use `node bin/yolojsx.js examples/Home.jsx` for a manual default-output smoke
test. It creates `Home.html`, which is ignored. Use `--out-dir dist` to exercise
directory output.

## Dependency changes

- Use a dependency only when the standard library or existing packages do not
  provide a clearer solution.
- Explain why each new package is needed, review its maintenance and release
  history, and include the lockfile change.
- Run `npm audit`, `npm run check:licenses`, and `npm run verify`.
- Review direct and transitive licenses; record accepted findings with the
  release candidate.
- Do not use `npm audit fix --force` without reviewing its API and behavior
  changes.
- Treat Dependabot updates like normal pull requests; do not auto-merge them.

## Code style

- Use native ECMAScript modules and explicit `.js` import extensions.
- Use two-space indentation, double quotes, semicolons, and trailing commas in
  multiline constructs.
- Prefer named exports and small modules with one clear responsibility.
- Use `camelCase` for variables and functions and `UPPER_SNAKE_CASE` for
  constants.
- Match surrounding code; no formatter or linter is currently configured.

## Commits and branches

Use Conventional Commit messages such as `feat: add a theme` or
`fix(cli): preserve the output marker`. Name branches `type/lowercase-description`;
accepted types are `build`, `chore`, `ci`, `docs`, `feat`, `feature`, `fix`,
`hotfix`, `perf`, `refactor`, `release`, `revert`, `style`, and `test`.

`npm install` installs Git hooks that check commit messages and branch names
locally. Git hooks are feedback, not a security boundary, and can be bypassed.

## Tests

Tests use `node:test` and `node:assert/strict`.

- Add unit tests for pure parsing, validation, and transformation logic.
- Add integration tests for CLI builds, diagnostics, filesystem safety,
  generated assets, or package behavior.
- Use the fixture helpers in `test/helpers.js`.
- Register fixture cleanup with `t.after(...)`.
- Preserve the output ownership marker and destructive-path protections.
- Run `npm run verify` before submitting.

## Documentation and release notes

Update README examples and help text when user-visible CLI behavior changes. Add
an `Unreleased` changelog entry for user-visible fixes, features, deprecations,
and breaking changes. Update OpenSpec requirements when the public behavior
contract changes.

## Pull requests

A useful pull request:

- explains the problem and user-visible result;
- links the relevant issue or OpenSpec change;
- keeps the diff focused;
- lists verification commands and results;
- includes tests for changed behavior;
- calls out compatibility, security, dependency, or output-safety risks; and
- contains no generated output or unrelated cleanup.

Maintainers may ask for a change to be split, documented, or covered by a more
specific test before merging.
