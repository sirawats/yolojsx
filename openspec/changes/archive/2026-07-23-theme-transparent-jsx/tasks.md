## 1. Establish the semantic CSS contract

- [x] 1.1 Define the conventional semantic property schema and its mapping to the existing manifest color, typography, radius, shadow, density, and status fields
- [x] 1.2 Replace the branded Tailwind `@theme inline` mappings in `foundation.css` with unbranded background, foreground, card, muted, primary, border, ring, code, and status namespaces
- [x] 1.3 Update foundation base rules so document text, headings, links, code, selection, focus, blockquotes, and native controls inherit the selected theme without application theme classes
- [x] 1.4 Remove `yolo-surface`, `yolo-muted`, `yolo-reading`, and other package-specific component helpers from the shared foundation
- [x] 1.5 Migrate every checked-in fixed-theme stylesheet from `--yolo-*` properties to the conventional semantic property schema while preserving each preset's fixed appearance and visual values
- [x] 1.6 Update CSS/manifest parity and catalog validation tests for the new property schema, including a check that no checked-in theme retains the removed branded properties or helpers
- [x] 1.7 Add build assertions for representative conventional utilities such as `bg-background`, `text-muted-foreground`, `bg-card`, and `border-border`

## 2. Expand official Ant Design theme integration

- [x] 2.1 Audit the controlled Ant Design version's official global and component token declarations for Button, Card, Layout, Menu, Tabs, Segmented, Typography, and input-family components
- [x] 2.2 Define maintainable Ant Design component-token profiles for the default, GitHub, Material, editor, warm, Catppuccin, Minimal, and Baseline visual families
- [x] 2.3 Extend fixed theme manifests with reviewed component tokens and explicit component-algorithm choices where derivation is required
- [x] 2.4 Extend theme catalog validation to reject missing, malformed, or unsupported component configuration while preserving contrast and fixed light/dark checks
- [x] 2.5 Pass `components` together with `algorithm`, `token`, and `cssVar` through the generated `ConfigProvider` theme configuration
- [x] 2.6 Add unit tests proving light aliases and explicit dark presets select the expected global and component configuration without consulting system preference
- [x] 2.7 Add source and package checks that built-in theme CSS contains no `.ant-*` component selector patches
- [x] 2.8 Add a representative Ant Design fixture covering default, primary, text, link, ghost, danger, hover, active, focus, and disabled states under every fixed preset

## 3. Enforce clean JSX examples

- [x] 3.1 Add a source-policy test that rejects example CSS imports, `--css` dependencies, self-managed Ant Design theme providers, `yolo-*` class names, package helper classes, and hard-coded theme-replacement colors
- [x] 3.2 Refactor `Home.jsx` and `Analytics.jsx` to rely on inheritance, standard Ant Design props, and standard Tailwind layout utilities
- [x] 3.3 Refactor `Techspec.jsx` to use semantic document structure and Ant Design components without branded theme utilities or `!important` theme corrections
- [x] 3.4 Refactor `APIDocs.jsx` to use Ant Design layout/navigation APIs and CLI-managed native code styling while preserving its interactions and readable right-hand code panel
- [x] 3.5 Refactor `CalculatorDemo.jsx` to use provider-themed Ant Design inputs, statistics, progress, cards, and alerts without branded theme utilities
- [x] 3.6 Refactor `SaaS.jsx` to keep its custom responsive layout in standard Tailwind while moving controls, surfaces, statuses, and typography to inheritance or Ant Design props
- [x] 3.7 Refactor `Editorial.jsx` to use semantic article markup and CLI-managed reading typography without package helpers or imported CSS
- [x] 3.8 Update the all-examples integration test to build every refactored entry in default HTML-file and explicit directory modes and assert equivalent theme semantics

## 4. Document the breaking authoring migration

- [x] 4.1 Rewrite the README quick start and theme sections so examples contain no `yolo-*` vocabulary and explain that the CLI applies Ant Design and native document themes automatically
- [x] 4.2 Document the conventional semantic Tailwind names and clarify that standard utilities are escape hatches rather than required page-level theme plumbing
- [x] 4.3 Add a migration table mapping each documented legacy `yolo-*` utility or helper to inheritance, an ordinary Ant Design prop, or its conventional semantic replacement
- [x] 4.4 Document that built-in Ant Design customization uses official global/component tokens and that custom `--css` remains the supported explicit stylesheet extension
- [x] 4.5 Add release notes identifying removal of the branded styling vocabulary as a breaking change and noting that output modes and theme IDs are unchanged

## 5. Complete verification

- [x] 5.1 Run theme catalog, stylesheet parity, contrast, provider-template, semantic utility, and source-policy unit tests
- [x] 5.2 Run integration coverage for all fixed themes, aliases, Ant Design variant states, custom `--css`, and all examples in both output modes
- [x] 5.3 Run syntax checks and package-content inspection, including preservation of all checked-in theme stylesheets and notices
- [x] 5.4 Run packaged-artifact verification and confirm generated HTML remains within the configured artifact-size budget
- [x] 5.5 Run `npm run verify` and record a clean final result

## 6. Simplify theme discovery

- [x] 6.1 Make `yolojsx themes` print only canonical preset ids in catalog order, one per line, with no descriptive metadata
- [x] 6.2 Add `yolojsx --themes` as an equivalent top-level discovery action and update CLI help, README guidance, and release notes
- [x] 6.3 Add parser, exact-output, integration, and packaged-CLI verification for both discovery forms
