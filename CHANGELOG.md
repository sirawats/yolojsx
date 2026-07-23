# Changelog

## Unreleased

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
