# Changelog

## Unreleased

## 0.1.3 - 2026-07-26

- Add a canonical yolojsx AI-agent skill and Git-installable adapters for Codex,
  Claude Code, Antigravity/Gemini CLI, and OpenCode without adding plugin files
  to the npm package.
- Synchronize npm and plugin manifest versions through `npm version`, and reject
  version drift during repository verification.

## 0.1.2 - 2026-07-23

- Add a beginner-focused npm publishing guide with safe dry-run, account
  security, release, verification, upgrade, dist-tag, and recovery procedures.
- Rename the npm package and executable from `yolo-jsx` to `yolojsx`.
- Add open-source contribution, conduct, security, support, dependency-review,
  issue, and pull-request guidance.
- Add Linux and Windows CI across supported Node.js lines plus Dependabot update
  configuration.
- Add an explicit public npm registry target and a pre-publish readiness gate
  that verifies repository identity, release metadata, and tracked-file hygiene.
- Make one compressed `<EntryName>.html` the default JSX build output; use
  `--out-dir dist` for the former directory default.
- Add 21 fixed global themes as original, checked-in yolojsx stylesheets with
  coordinated Ant Design tokens. Unsuffixed family aliases select light themes;
  dark themes require an explicit dark preset id.
- Add `yolojsx themes`, `--theme`, and post-preset `--css` support.
- Keep `--single-file` temporarily as a deprecated compatibility alias.
- Ship pinned inspiration/license notices in `THIRD_PARTY_NOTICES.md`.
- Add technical-specification, API-reference, calculator, SaaS, analytics, and
  editorial examples, with build coverage for their suggested themes.
- **Breaking:** remove the public `yolo-*` Tailwind utilities, `--yolo-*` custom
  properties, and `yolo-surface`, `yolo-muted`, and `yolo-reading` helpers.
  Pages now inherit native document styling, Ant Design components use official
  global and component tokens, and custom layouts can use conventional semantic
  utilities such as `bg-background`, `bg-card`, `text-muted-foreground`, and
  `border-border`.
- Keep output modes, command-line theme IDs, and light/dark alias behavior
  unchanged by the authoring migration. `--css` remains the explicit extension
  point for application-wide CSS.
- Print only canonical theme names from `yolojsx themes` and add
  `yolojsx --themes` as an equivalent discovery command.
