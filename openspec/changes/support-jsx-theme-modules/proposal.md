## Why

Built-in presets cannot cover product-specific visual systems, while `--css`
can only alter CSS and cannot coordinate Tailwind semantics with Ant Design
runtime tokens. A trusted local TypeScript or JSX theme module gives agents one
portable source for global theme values and reusable branded components.
Authoring the bundled preset manifests as JSX modules keeps the reference
catalog aligned with the preferred agent-authored theme format.

## What Changes

- Allow `--theme` to select either a built-in preset or a readable local `.ts`
  or `.jsx` theme module resolved from the invocation working directory.
- Define the module contract: the default export is a declarative theme
  manifest, while named exports remain available for ordinary application
  imports such as reusable React components.
- Validate custom manifests with the same semantic, contrast, serialization,
  and Ant Design constraints as built-in themes before creating output.
- Make Tailwind discover utilities used by components in the selected theme
  module and make yolojsx's supplied frontend packages available to that module.
- Migrate every bundled preset manifest under `src/themes/` from `.ts` to
  `.jsx` while preserving preset ids, aliases, validation, and emitted
  `lib/themes/*.js` package paths.
- **BREAKING**: Remove the `--css` CLI option and its controlled custom
  stylesheet path. Applications can continue importing local CSS through their
  normal module graph.
- Document that local theme modules are trusted executable build-time code.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `global-theme-styling`: Extend theme selection and validation to local
  TypeScript/JSX modules and remove the `--css` override contract.
- `bundled-frontend-stack`: Apply supplied dependency resolution and Tailwind
  discovery to reusable components exported by a selected theme module, and
  remove custom CSS-first extension behavior.

## Impact

The CLI argument parser and help, theme and path resolution, Vite build
orchestration, Tailwind source generation, tests, README, official agent skill,
public specifications, bundled preset sources, repository build/type tooling,
and changelog will change. No new dependency is needed; the loader reuses Vite
and yolojsx's existing package aliases. Repository tooling changes for bundled
JSX presets do not create a consumer `tsconfig.json` or ESLint requirement.
Existing scripts using `--css` must replace it with an application CSS import
or a theme module.
