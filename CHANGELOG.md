# Changelog

## Unreleased

## 1.0.1 - 2026-08-01

- Update agent skills and reference documentation for custom theme creation, dual-export module patterns, Tailwind class generation, and offline CDN build troubleshooting.
- Add Demo GIF showcase and section emojis to `README.md`.

## 1.0.0 - 2026-08-01

- **Breaking:** rebrand the package, executable, plugins, skills, generated
  identifiers, and repository references as Rtifact with the `rtifact` command.
- **Breaking:** rename JSX document metadata to `RTIFACT` and directory ownership
  metadata to `.rtifact-output.json` without retaining public aliases.
- Lead documentation and agent guidance with Rtifact's core outcome: portable,
  interactive HTML artifacts produced from compact agent-authored JSX.
- Replace the previous visual identity with a simple Rtifact wordmark.

## 0.1.7 - 2026-07-31

- Add local `.ts` and `.jsx` modules to `--theme`, using their validated default
  manifests for semantic CSS and Ant Design while allowing explicitly imported
  named component exports.
- Preserve Rtifact-supplied React, Ant Design, React Icons, and Tailwind support
  for zero-install JSX theme modules in every output mode.
- Author every bundled preset manifest as checked JSX while preserving its
  existing catalog behavior and published JavaScript path.
- **Breaking:** remove `--css`; import application-specific CSS from JSX or TSX,
  and use a theme module for coordinated global semantics and component tokens.

## 0.1.6 - 2026-07-31

- Rewrite the CLI, website, scripts, and tests in TypeScript while keeping the
  bundled examples as JSX, and accept TSX application entries.
- Give borderless Material Light cards a distinct tonal surface.
- Keep normal Ant Design progress and interaction accents on each preset's
  brand palette while preserving focus, selection, link, and status colors.
- Keep shared Ant Design interaction borders, including enabled sliders,
  visibly distinct from disabled states across dark themes.
- Keep disabled Ant Design menu items visually distinct from enabled items.
- Keep explicit dark menus on dark presets aligned with each preset instead of
  Ant Design's built-in navy surfaces.
- Add an exhaustive Ant Design component showcase for reviewing theme states.
- Add API test report, internal setup guide, and code review report examples
  centered on actionable, human-readable agent output.
- Keep fragment navigation inside the website's isolated example preview.
- Keep PrismJS line-number gutters aligned with themed code typography in every
  generated artifact and document the supported plugin pattern for AI agents.

## 0.1.5 - 2026-07-29

- **Breaking:** make direct HTML builds load exact-version React and Ant Design
  runtimes from esm.sh by default, reducing generated file size while requiring
  network access at startup.
- Add `--self-contained` for offline HTML output and keep `pack` output
  self-contained.
- Resolve Ant Design and CSS-in-JS through their ESM entries so self-contained
  and directory builds exclude unused component families.
- Refine theme status colors, give GitHub and Everforest alerts colored borders,
  Obsidian Baseline alerts neutral borders, and the remaining alerts borderless;
  separate accessible GitHub links from actions.
- Differentiate theme families through heading typography, density, radius,
  elevation, and bordered versus borderless Card treatment.
- Remove bundled example overrides that masked inherited document styles and
  Ant Design component tokens.

## 0.1.4 - 2026-07-26

- Supply `prism-themes`, resolve a named `RTIFACT.prismTheme`, and add
  `rtifact prism-themes` discovery, with PrismJS's `prism` theme as the
  warning-backed fallback.
- Revise every bundled example around the product vision with clearer
  information hierarchy, honest sample framing, useful interaction, responsive
  layouts, and stronger accessibility.
- Add product vision documentation (`docs/product-vision.md`) and extend theme
  definitions with status and canonical visual metadata.
- Implement npm trusted publishing with OIDC provenance in release workflows
  and update maintainer publishing guidance.
- Resolve cross-platform command execution issues on Windows during verification
  and add website build verification to CI workflows.

## 0.1.3 - 2026-07-26

- Read optional `RTIFACT` title and icon metadata from JSX entries for
  browser-tab identity.
- Add a canonical Rtifact AI-agent skill and Git-installable adapters for Codex,
  Claude Code, Antigravity/Gemini CLI, and OpenCode without adding plugin files
  to the npm package.
- Synchronize npm and plugin manifest versions through `npm version`, and reject
  version drift during repository verification.

## 0.1.2 - 2026-07-23

- Add a beginner-focused npm publishing guide with safe dry-run, account
  security, release, verification, upgrade, dist-tag, and recovery procedures.
- Consolidate the npm package and executable under the `rtifact` identifier.
- Add open-source contribution, conduct, security, support, dependency-review,
  issue, and pull-request guidance.
- Add Linux and Windows CI across supported Node.js lines plus Dependabot update
  configuration.
- Add an explicit public npm registry target and a pre-publish readiness gate
  that verifies repository identity, release metadata, and tracked-file hygiene.
- Make one compressed `<EntryName>.html` the default JSX build output; use
  `--out-dir dist` for the former directory default.
- Add 21 fixed global themes as original, checked-in Rtifact stylesheets with
  coordinated Ant Design tokens. Unsuffixed family aliases select light themes;
  dark themes require an explicit dark preset id.
- Add `rtifact themes`, `--theme`, and post-preset `--css` support.
- Keep `--single-file` temporarily as a deprecated compatibility alias.
- Ship pinned inspiration/license notices in `THIRD_PARTY_NOTICES.md`.
- Add technical-specification, API-reference, calculator, SaaS, analytics, and
  editorial examples, with build coverage for their suggested themes.
- **Breaking:** remove the public branded Tailwind utilities, custom properties,
  and surface, muted, and reading helpers.
  Pages now inherit native document styling, Ant Design components use official
  global and component tokens, and custom layouts can use conventional semantic
  utilities such as `bg-background`, `bg-card`, `text-muted-foreground`, and
  `border-border`.
- Keep output modes, command-line theme IDs, and light/dark alias behavior
  unchanged by the authoring migration. `--css` remains the explicit extension
  point for application-wide CSS.
- Print only canonical theme names from `rtifact themes` and add
  `rtifact --themes` as an equivalent discovery command.
