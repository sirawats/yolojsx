## Context

The current theme catalog stores one checked-in stylesheet per fixed preset and one manifest that also supplies Ant Design runtime values. `foundation.css` maps package-specific `--yolo-*` properties into Tailwind utilities and exposes helpers such as `yolo-surface`, while the examples repeat those helpers and utilities alongside long layout chains and `!important` corrections for Ant Design typography. The generated mount already wraps every entry in `StyleProvider layer` and `ConfigProvider`, but it passes only the selected algorithm and global tokens.

Ant Design v6 documents `ConfigProvider.theme` as the primary customization boundary. It accepts a global algorithm, seed or alias tokens, component-specific tokens and algorithms, and CSS-variable configuration. Its component tokens cover variant and interaction states without requiring selectors such as `.ant-btn-primary`. Tailwind v4 already consumes the CLI's CSS-first graph and can expose semantic color names without a package prefix.

The user requires built-in examples to remain JSX-only: they must not import application CSS or depend on a `--css` argument. CSS remains owned, selected, and composed by the CLI. Existing custom `--css` support remains an explicit user extension mechanism rather than a requirement for packaged examples.

## Goals / Non-Goals

**Goals:**

- Make selected themes ambient so ordinary semantic HTML and ordinary Ant Design props render correctly without theme plumbing in JSX.
- Replace the public `yolo-*` styling vocabulary with conventional unbranded semantic Tailwind names for the cases that still need explicit theme utilities.
- Express meaningful theme differences through Ant Design algorithms, global tokens, and component tokens, including component variants and interaction states.
- Keep every packaged example JSX-only and verify it in both HTML-file and directory output modes.
- Keep theme discovery concise and script-friendly through equivalent `themes` and `--themes` forms that emit canonical preset ids only.
- Preserve checked-in inspectable theme stylesheets, deterministic fixed light/dark selection, the current cascade, custom `--css`, provenance, and single-file compatibility.

**Non-Goals:**

- Add a yolojsx component library, JSX macro, styling prop, class-name helper, CSS module, CSS-in-JS layer, or proprietary shorthand vocabulary.
- Replace Tailwind layout utilities or Ant Design components with a second design system.
- Style built-in themes by patching generated `.ant-*` selectors.
- Enable Ant Design `zeroRuntime`, which requires an additional generated CSS import.
- Prevent users from intentionally overriding styles through the existing trusted `--css` extension.
- Remove supported light-family aliases or the detailed theme provenance stored in manifests and package notices.

## Decisions

### 1. Treat theme configuration as infrastructure, not an authoring API

Application JSX will not be expected to identify its selected theme or apply page-wide background and foreground classes. The foundation will style the document, semantic text, links, code, focus, selection, and native controls from the selected preset. Ant Design components will obtain their theme only from the generated provider.

This removes theme mechanics from the component tree. A package-owned class vocabulary was rejected because shorter proprietary names still require developers to learn a second styling system and obscure the standard Ant Design and Tailwind APIs.

### 2. Replace branded Tailwind names with conventional semantic names

Checked-in preset stylesheets will stop defining the public `--yolo-*` property vocabulary. They will define conventional semantic custom properties for background, foreground, card, muted, border, primary, status, code, focus, typography, radius, shadow, and density. The shared Tailwind `@theme inline` block will expose names such as:

- `background` and `foreground`;
- `card` and `card-foreground`;
- `muted` and `muted-foreground`;
- `primary` and `primary-foreground`;
- `border`, `ring`, and `code`;
- `success`, `warning`, `danger`, and `info`.

This yields familiar utilities such as `bg-background`, `text-muted-foreground`, `bg-card`, and `border-border`. Base rules will make even these unnecessary for the normal document root. Existing `yolo-*` utilities and `yolo-surface`, `yolo-muted`, and `yolo-reading` helpers will be removed rather than retained as aliases, because aliases would preserve the confusing API and keep unused generated CSS discoverable.

Direct literal declarations in every base selector were rejected because semantic properties keep each stored theme readable, make custom `--css` overrides coherent, and avoid repeating selectors across all fixed presets.

### 3. Extend the manifest with official Ant Design component configuration

Each preset's existing `antDesign` record will contain:

- its fixed default or dark algorithm selection;
- essential global seed and alias tokens;
- component token records for the components used by the supported examples and representative application UI.

Initial component coverage will include Button, Card, Layout, Menu, Tabs, Segmented, Typography, Input-family controls, and other components demonstrated by the verification fixture. Tokens will cover meaningful normal, hover, active, focus, disabled, danger, text, link, and ghost states where Ant Design exposes those states.

Shared visual-family profiles will provide maintainable defaults for related presets, while individual manifests can override tokens when a preset's design character warrants it. This avoids multiplying a complete hand-authored component matrix across twenty-one themes while still making Material, GitHub, editor, warm, Catppuccin, Minimal, and Baseline families differ beyond palette.

The generated mount will pass `algorithm`, `token`, `components`, and `cssVar` through one `ConfigProvider`. Component algorithms will remain disabled unless a component override needs Ant Design to derive map tokens from component-local seeds; any enabled component algorithm will be explicit and validated.

### 4. Do not style Ant Design through built-in CSS selector patches

Checked-in theme CSS and the shared foundation will contain no built-in `.ant-*` component overrides. Ant Design's generated class names, selector composition, and state rules are implementation details; patching them would create specificity coupling, incomplete interaction states, and version-upgrade risk.

`StyleProvider layer` remains enabled so standard Tailwind utilities can intentionally override supported semantic slots from the utilities layer. Ant Design semantic `classNames` or `styles` props remain available to application authors for exceptional per-instance customization, but yolojsx will not require them for normal theme application.

### 5. Refactor examples toward standard platform and library APIs

Examples will use:

- semantic native elements for document structure and content;
- Ant Design props such as component type, status, danger, ghost, and secondary typography instead of theme color classes;
- Ant Design `Layout`, `Menu`, `Flex`, `Space`, `Row`, or `Col` where those components express the structure more clearly;
- standard Tailwind utilities for genuinely application-specific responsive layout.

Examples will not import `.css`, wrap themselves in a theme provider, use `yolo-*`, or hard-code replacement colors for code panels and theme surfaces. Complex examples may extract ordinary React subcomponents in the same JSX module to improve readability, but will not hide class strings behind constants or introduce a new styling abstraction.

### 6. Keep CLI-managed CSS deterministic before React mounts

Native document styling will continue to come from the selected checked-in stylesheet at build time rather than consuming only Ant Design's runtime-generated CSS variables. This prevents an unthemed initial document and keeps non-AntD HTML deterministic in both output modes. The manifest and stored CSS remain parallel representations checked for semantic parity.

Custom `--css` remains loaded by the CLI after the selected preset. It can override the conventional semantic properties and layer rules without an import in the JSX entry. Packaged examples will not use it.

### 7. Make migration and verification explicit

README and release notes will map documented legacy utilities to inheritance, standard Ant Design props, or replacement semantic Tailwind names. Verification will:

- reject `yolo-*`, package helper classes, local CSS imports, self-managed theme providers, and theme-replacement hex colors in packaged examples;
- inspect theme CSS for `.ant-*` selector patches;
- validate every manifest's global and component token schema;
- render a representative Ant Design variant/state fixture under every fixed preset;
- build every example in both output modes and retain package-content checks.

### 8. Keep theme discovery concise

`yolojsx themes` and `yolojsx --themes` will be equivalent top-level discovery
actions. Both will write the canonical fixed-preset ids in catalog order, one per
line, with no heading, descriptions, alias annotations, mode labels, or
provenance. This makes the output easy to scan and safe to consume from shell
scripts.

Supported aliases remain accepted by `--theme` and remain documented in the
README, but they are not repeated in the discovery output because they do not
identify additional presets. Inspiration details remain in the theme manifests
and shipped third-party notices rather than the command output.

## Risks / Trade-offs

- **Removing documented utilities breaks existing source code** → Mark the change as breaking, publish a focused migration table, and make the replacement vocabulary conventional rather than introducing another package dialect.
- **Generic semantic custom properties can collide with user CSS** → Treat them as the intentional public override contract; custom `--css` loads after the preset and may deliberately replace them.
- **Ant Design component-token names can change across releases** → Validate against the controlled Ant Design version, use official token APIs only, and exercise component states in package verification before dependency upgrades.
- **Twenty-one themes can create a large component-token matrix** → Derive related presets from reviewed visual-family profiles and reserve per-preset overrides for meaningful differences.
- **Ant Design structural components may not fit every marketing layout** → Keep standard Tailwind available for application-specific layout instead of forcing all examples into Ant Design.
- **Removing helper classes may initially lengthen a few layout expressions** → Prefer semantic HTML, inheritance, Ant Design props, and local React component extraction; do not solve local repetition by creating another global shorthand API.
- **Runtime provider variables do not style pre-mount native HTML** → Retain build-time preset CSS for native/global styling and verify CSS/manifest parity.
- **Name-only discovery no longer teaches aliases or provenance inline** → Keep aliases in the README and retain complete audited provenance in manifests and shipped notices.

## Migration Plan

1. Introduce the conventional semantic property schema and foundation mapping while updating theme parity validation.
2. Add visual-family Ant Design component profiles, pass `components` through the generated provider, and add component/state verification.
3. Migrate every stored theme stylesheet from `--yolo-*` properties to the new semantic contract and remove package helper classes.
4. Refactor examples and README to inheritance, standard Ant Design APIs, and conventional semantic Tailwind names; add source-policy checks.
5. Simplify theme discovery output, add the equivalent `--themes` action, and cover both invocation forms.
6. Run full tests, syntax checks, both output modes, package inspection, packaged-artifact verification, accessibility contrast checks, and the artifact-size budget.

Rollback restores the previous foundation mappings, theme properties, provider configuration, and examples together. Because theme selection and output formats do not change, no generated user data requires migration.

## Open Questions

No product decision blocks implementation. Exact component-token fields must be selected from the official token tables for the controlled Ant Design version and validated during implementation rather than inferred from generated CSS.
