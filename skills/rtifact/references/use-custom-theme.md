# Custom Rtifact theme modules

Read this reference whenever an artifact consumes a local `.ts` or `.jsx` theme module. For authoring or repairing the theme itself, use the `rtifact-create-theme` skill; it contains the complete definition, contrast matrix, and failure guide.

## Two independent exports

A theme module may serve two roles:

1. Its **default export** is a declarative `ThemeDefinition` consumed by the CLI.
2. Its **named exports** are ordinary React components imported explicitly by artifact JSX.

`--theme` does not inject named components. Import them normally:

```jsx
import { BrandPage, BrandHero } from "./brand-theme.jsx";
```

## Path resolution

The theme file does not need to share a directory with the artifact; it may be any readable `.ts` or `.jsx` file. The CLI resolves relative `--theme` paths from the command's current working directory:

```sh
rtifact src/Report.jsx --theme ./themes/brand-theme.jsx
```

Application imports resolve from the importing file. With this layout:

```text
project/
├── themes/brand-theme.jsx
└── src/Report.jsx
```

use:

```jsx
import { BrandPage } from "../themes/brand-theme.jsx";
```

A value is treated as a file path when it is absolute, starts with `.`, contains a forward or backslash (`/` or `\`), or has a file extension. Other values are treated as preset names such as `material-dark`.

## Runtime and dependency boundaries

- Theme modules are compiled and executed during the build. Do not use `window`, `document`, or `localStorage` at module top level.
- Theme modules may import React, Ant Design, React Icons, PrismJS, or relative local files. Other bare imports must exist in local `node_modules`.
- Treat theme modules as trusted local code. Never embed secrets.
- Do not import Rtifact theme CSS or add an application `ConfigProvider`; the output already supplies the theme boundary.
- Custom themes do not appear in `rtifact themes`, and they do not apply to `rtifact pack`.

## Build order

Validate the smallest theme before writing branded components:

```sh
rtifact Minimal.jsx --theme ./brand-theme.jsx --output Minimal.html
```

Then build the real artifact. On failure, fix the named role from the diagnostic and retry the same command. Do not switch output modes to evade a theme validation error.
