## Why

The current examples expose yolojsx's theme plumbing through long `yolo-*` Tailwind utilities, package-specific helper classes, hard-coded color overrides, and repeated Ant Design style corrections. Themes should instead be ambient CLI infrastructure so developers can write ordinary semantic HTML, standard Tailwind utilities, and normal Ant Design component props without learning a yolojsx styling dialect.

## What Changes

- Extend each fixed preset's Ant Design configuration from global tokens alone to official Ant Design algorithms, global tokens, and component tokens for meaningful component appearance and interaction states.
- Keep theme application inside the CLI-generated `StyleProvider` and `ConfigProvider` boundary; built-in themes will not override generated `.ant-*` selectors.
- **BREAKING**: Remove the documented `yolo-*` Tailwind color/font/radius/shadow utilities and package-specific helpers as the application authoring contract, replacing them with conventional unbranded semantic theme names where an explicit utility is still necessary.
- Make document colors, typography, links, focus, selection, code, and other native-element defaults apply without theme classes.
- Rewrite the packaged examples to use semantic HTML, ordinary Ant Design props and structural components, and standard Tailwind layout utilities, with no imported application CSS and no `yolo-*` class names.
- Make `yolojsx themes` and `yolojsx --themes` equivalent concise discovery commands that print only canonical preset ids, one per line, while retaining detailed provenance in package metadata and notices.
- Preserve CLI-managed checked-in theme stylesheets, the existing cascade, custom `--css` support, fixed light/dark selection, provenance, and parity between HTML-file and directory output modes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `global-theme-styling`: Replace the branded theme-authoring vocabulary with a theme-transparent semantic contract, strengthen native-element defaults, require JSX-only packaged examples that do not import CSS, and simplify CLI theme discovery.
- `bundled-frontend-stack`: Expand the supplied Ant Design provider integration to use official component tokens and algorithms for component variants and states without selector overrides.

## Impact

- Affects CLI argument parsing and theme discovery, the theme manifest and validation in `src/themes.js`, checked-in files under `src/themes/`, the generated provider in `src/templates.js`, documentation, all packaged examples, and theme/build/package verification.
- Removes documented application-facing `yolo-*` utilities and helpers; consumers using those names will need to migrate to inherited styling, Ant Design props, or the replacement semantic Tailwind names.
- Does not add runtime dependencies, a CSS import requirement, a user configuration file, a yolojsx component library, or a new proprietary JSX/class-name API.
