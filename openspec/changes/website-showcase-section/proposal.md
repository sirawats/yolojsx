## Why

The homepage lists themes but does not let developers try the packaged examples with them. The showcase should stay current as examples and themes are added instead of duplicating both catalogs in `website/index.jsx`.

## What Changes

- Replace the static theme catalog with an interactive 20:80 example navigation and preview layout.
- Discover packaged examples from `examples/*.jsx` at build time.
- Derive theme families and variants from the canonical theme catalog.
- Page through theme families and show variants for the selected family.
- Switch the preview between a 16:9 desktop viewport and a 6:13 mobile viewport.
- Apply the selected theme to the preview through scoped CSS variables and Ant Design configuration.
- Keep imported example Tailwind utilities in generated output when the examples live outside the entry directory.

## Capabilities

### New Capabilities

- `website-showcase`: Build-time example discovery and live, scoped theme previews on the homepage.

### Modified Capabilities

<!-- No existing requirement changes. The source-discovery fix conforms to bundled-frontend-stack's existing imported-component requirement. -->

## Impact

- Website: `website/index.jsx`
- Build source discovery: `src/build.js`, `src/templates.js`, and focused integration coverage
- Dependencies: none
