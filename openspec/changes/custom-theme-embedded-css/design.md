## Context

Currently, custom Rtifact themes exported as `.jsx` or `.ts` modules return a `ThemeDefinition` object containing structured token values (colors, fonts, rhythm, component metrics). When custom styling or selector tweaks (e.g. padding on `:not(pre) > code` or custom component classes) are needed, users previously had to maintain a separate `.css` file alongside their theme module.

Adding an optional `css?: string` property to `ThemeDefinition` allows custom themes to remain completely self-contained in a single module file while feeding embedded CSS cleanly into Vite's CSS building pipeline.

## Goals / Non-Goals

**Goals:**

- Enable theme modules (`.jsx` / `.ts`) to export an optional `css?: string` field within their default-exported `ThemeDefinition` object.
- Validate `css` string type in `validateTheme()` without requiring full CSS syntax parsing (letting Vite handle CSS syntax errors gracefully during build).
- Inject custom theme CSS into Rtifact's stylesheet graph during application build so it takes effect alongside Tailwind and Ant Design tokens.
- Provide compact shared spacing for inline `code` and `kbd` without requiring every theme to repeat the rule.

**Non-Goals:**

- Support inline CSS-in-JS style objects inside `ThemeDefinition` (standard raw CSS string in `css` field is used).
- Auto-generate CSS selectors or convert JS objects to CSS.
- Redesign unrelated foundation styles or theme tokens.

## Decisions

### Decision 1: Embed `css?: string` directly in `ThemeDefinition`

- **Rationale**: Keeps theme definitions self-contained in a single `.jsx` or `.ts` file without breaking existing preset manifests or contract APIs.
- **Alternatives Considered**:
  - _Separate `.css` file_: Requires maintaining two files for one theme.
  - _Named export `export const css`_: Requires multiple exports from theme modules.

### Decision 2: Inject Embedded Theme CSS into the Vite CSS Processing Graph

- **Rationale**: When building an artifact with a custom theme that includes `definition.css`, the CLI appends the custom CSS into the generated theme stylesheet entry point, making CSS variables (`var(--primary)`, `var(--code)`) available and respecting cascade layers.

### Decision 3: Keep Common Inline Code Spacing in the Foundation

- **Rationale**: Padding, inline margin, and a slightly smaller font are useful readable defaults for unclassed inline `code` and `kbd` under every theme. Theme-specific exceptions remain possible because embedded CSS is emitted later in `@layer components`.

## Risks / Trade-offs

- **[Risk]**: User-supplied CSS string might contain malformed syntax.
  - **Mitigation**: Vite's CSS parser will report standard CSS build errors with exact line context during compilation.
- **[Risk]**: Oversized custom CSS string could impact build resource budgets.
  - **Mitigation**: `ThemeDefinition.css` is validated as a string and bounded by existing resource budget limits.

## QA Test Plan & Test Cases

### 1. Unit Test Matrix (`test/unit/themes.test.ts`)

| Case ID  | Test Description            | Input Condition                          | Expected Result                                                                    |
| :------- | :-------------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------- |
| **UT-1** | Valid embedded CSS property | `css: ".custom-card { padding: 12px; }"` | `validateThemeCatalog()` passes; `renderThemeCss()` appends the custom CSS string. |
| **UT-2** | Non-string CSS property     | `css: 123` (or `{}` / `true`)            | `validateThemeCatalog()` throws `"invalid css property"`.                          |

### 2. Integration Test Matrix (`test/integration/themes.test.ts` & CLI E2E)

| Case ID  | Test Description                        | Input Condition                                                                      | Expected Result                                                                                    |
| :------- | :-------------------------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **IT-1** | Single-file build with custom theme CSS | Build a fixture with `--theme ./themes/embedded.jsx`                                 | Build exits with code 0; generated single `.html` artifact includes embedded theme CSS.            |
| **IT-2** | Directory build with custom theme CSS   | Build the same fixture with `--theme ./themes/embedded.jsx --out-dir dist`           | Build exits with code 0; `dist/` contains CSS bundle with embedded theme styles.                   |
| **IT-3** | CSS Cascade Order & Variable Binding    | Custom theme CSS using `var(--primary)` and `var(--code)`                            | Embedded CSS is placed after `:root` variables, correctly referencing theme variables.             |
| **IT-4** | Malformed CSS Syntax Handling           | Custom theme module with broken CSS syntax                                           | CLI exits unsuccessfully with a CSS-related Vite build diagnostic.                                 |
| **IT-5** | Build isolation and source discovery    | Build two custom themes sequentially; one exports a component using a Tailwind class | Each output contains only its selected theme CSS, and Vite discovers the imported component class. |
