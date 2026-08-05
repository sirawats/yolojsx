## Why

Custom theme authors currently need a separate stylesheet alongside a theme module when tokens alone cannot express a selector or styling adjustment. Supporting an optional `css` string field directly in a theme module's `ThemeDefinition` keeps custom themes self-contained while integrating their CSS into Rtifact's global stylesheet graph.

## What Changes

- **ThemeDefinition Schema Update**: Add an optional `css?: string` property to `ThemeDefinition` and `Theme` interfaces.
- **Custom Theme Evaluation**: Preserve and validate the optional field while converting a loaded definition into Rtifact's runtime theme.
- **Stylesheets Cascade Integration**: Update the CLI-managed stylesheet graph so that embedded custom theme CSS is placed after theme variables in `@layer components`.
- **Readable Inline Code Defaults**: Give unclassed inline `code` and `kbd` elements compact, readable spacing in the shared foundation; embedded theme CSS can override those defaults when needed.

## Capabilities

### New Capabilities

_(None)_

### Modified Capabilities

- `global-theme-styling`: Extend custom theme validation and cascade requirements to support optional embedded CSS strings in custom theme definition modules.

## Impact

- **Affected Code**: `src/themes.ts`, `src/themes/foundation.css`, theme documentation, and focused unit and integration tests.
- **APIs & Dependencies**: Extends `ThemeDefinition` TypeScript type contract for custom themes. No breaking changes; existing built-in themes and manifests remain compatible.
